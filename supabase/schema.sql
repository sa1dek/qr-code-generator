-- ==============================================================================
-- Dynamic NFC & QR Code Review Cards
-- Schema: Unique + Case-Insensitive Usernames, Safe Migrations, Admin Seed
-- ==============================================================================
-- HOW TO APPLY
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this whole script and press Run.
--
-- This script is IDEMPOTENT and safe to run on:
--   - a brand new (empty) project, or
--   - an existing project that already runs the previous version of this file,
--     including one that already contains rows in `public.profiles`.
--
-- Everything uses safe migration patterns:
--   CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS /
--   CREATE OR REPLACE FUNCTION / DROP TRIGGER IF EXISTS / DROP POLICY IF EXISTS
--   and guarded ALTER TABLE ... inside DO blocks.
--
-- WHAT CHANGED VS THE PREVIOUS VERSION
--   - profiles.username is now TEXT UNIQUE NOT NULL (was VARCHAR(100) UNIQUE, nullable).
--   - Uniqueness is enforced CASE-INSENSITIVELY via idx_profiles_username_lower,
--     so "Ahmed" and "ahmed" can never coexist.
--   - Existing NULL / empty / case-colliding usernames are auto-repaired before
--     the NOT NULL + unique constraints are applied.
--   - handle_new_user() derives, sanitises and validates the username coming from
--     the sign-up form, and raises a readable error instead of failing silently.
--   - public.username_exists() and public.email_for_username() are SECURITY DEFINER
--     RPCs. They are required because the RLS policies intentionally hide other
--     people's profiles from non-admins, which previously broke both the
--     "is this username free?" check and username-based login.
--   - public.admin_set_role() and public.delete_user_completely() are the admin-only
--     SECURITY DEFINER RPCs behind the User Management panel. delete_user_completely()
--     removes the row from auth.users (cascading to public.profiles) and releases the
--     user's cards back to the unassigned admin pool.
--   - UPDATE on public.profiles.role is no longer granted to anon/authenticated, which
--     closes a privilege-escalation hole: the "Users can update own profile" policy
--     used to let any signed-in user promote themselves to admin. Only
--     admin_set_role() can change a role now, and it blocks self-demotion and the
--     removal of the last remaining admin.
-- ==============================================================================


-- ==============================================================================
-- 0. Extensions
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==============================================================================
-- 1. Profiles table linked to Supabase Auth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username TEXT NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------------------------
-- 1.1 Safe migration: upgrade an existing `profiles` table to the new shape.
--     Safe to re-run; a no-op when the table is already correct.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_row      RECORD;
    v_con      RECORD;
    v_base     TEXT;
    v_candidate TEXT;
    v_suffix   INTEGER := 0;
BEGIN
    -- 1.1.a Make sure the column physically exists (handles odd/partial states).
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name  = 'profiles'
          AND column_name = 'username'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;

    -- 1.1.b Drop every single-column UNIQUE constraint on `username` BEFORE
    --         normalising the data. This is mandatory: the old constraint is
    --         case-SENSITIVE, so turning '  Ahmed  ' into 'ahmed' collides with
    --         an existing 'ahmed' row and aborts the whole migration with
    --         "duplicate key value violates unique constraint". They are all
    --         re-created in 1.1.g once the values are consistent.
    FOR v_con IN
        SELECT c.conname
        FROM pg_constraint c
        WHERE c.conrelid = 'public.profiles'::regclass
          AND c.contype  = 'u'
          AND (
            SELECT array_agg(a.attname::text ORDER BY a.attname)
            FROM unnest(c.conkey) AS k(attnum)
            JOIN pg_attribute a
              ON a.attrelid = c.conrelid AND a.attnum = k.attnum
          ) = ARRAY['username']
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', v_con.conname);
    END LOOP;

    -- Same reasoning for the case-insensitive index created by an earlier run.
    DROP INDEX IF EXISTS public.idx_profiles_username_lower;

    -- 1.1.c Normalise the storage type to TEXT (no-op if it already is).
    ALTER TABLE public.profiles
        ALTER COLUMN username TYPE TEXT USING username::TEXT;

    -- 1.1.d Trim + lowercase existing values so uniqueness becomes case-insensitive.
    UPDATE public.profiles
       SET username = lower(btrim(username))
     WHERE username IS NOT NULL
       AND username IS DISTINCT FROM lower(btrim(username));

    -- 1.1.e Give a username to every row that has none (derived from the e-mail).
    --       The target rows are collected first so the table is never modified
    --       while a cursor is still scanning it.
    FOR v_row IN
        SELECT * FROM (
            SELECT p.id, p.email
            FROM public.profiles p
            WHERE p.username IS NULL OR btrim(p.username) = ''
            ORDER BY p.created_at, p.id
        ) AS pending
    LOOP
        v_base := lower(
            regexp_replace(split_part(coalesce(v_row.email, ''), '@', 1), '[^a-z0-9_.-]', '', 'g')
        );
        IF v_base = '' THEN
            v_base := 'user';
        END IF;
        v_base    := left(v_base, 24);
        v_candidate := v_base;

        LOOP
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.username = v_candidate AND p.id <> v_row.id
            );
            v_suffix    := v_suffix + 1;
            v_candidate := v_base || '_' || v_suffix;
        END LOOP;

        UPDATE public.profiles SET username = v_candidate WHERE id = v_row.id;
    END LOOP;

    -- 1.1.f Repair case-insensitive duplicates left behind by the old constraint
    --       (e.g. both 'Ahmed' and 'ahmed' existed under the old VARCHAR UNIQUE).
    --       Materialised in a sub-query first, for the same reason as 1.1.e.
    FOR v_row IN
        SELECT * FROM (
            SELECT p.id
            FROM public.profiles p
            WHERE EXISTS (
                SELECT 1 FROM public.profiles q
                WHERE q.id <> p.id
                  AND lower(btrim(q.username)) = lower(btrim(p.username))
            )
            ORDER BY p.created_at, p.id
        ) AS duplicated
    LOOP
        v_base      := 'user_' || left(replace(v_row.id::TEXT, '-', ''), 8);
        v_candidate := v_base;
        v_suffix    := 0;

        LOOP
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.username = v_candidate AND p.id <> v_row.id
            );
            v_suffix    := v_suffix + 1;
            v_candidate := v_base || '_' || v_suffix;
        END LOOP;

        UPDATE public.profiles SET username = v_candidate WHERE id = v_row.id;
    END LOOP;
END $$;

-- 1.1.g Now that every row has a value, enforce NOT NULL.
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- 1.1.h Re-create the case-SENSITIVE unique constraint (1.1.b removed it).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND conname   = 'profiles_username_key'
          AND contype   = 'u'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 1.1.i CASE-INSENSITIVE uniqueness: the real guarantee against duplicates.
    --       This is the index that makes "Ahmed" and "ahmed" collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
    ON public.profiles (lower(username));

-- 1.1.j Username format guard (mirrors validateUsername() on the front-end).
--       Added NOT VALID so historical rows are not rejected by this migration;
--       the rule is enforced for every new or updated row from now on.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND conname   = 'profiles_username_format'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_username_format
            CHECK (username ~ '^[a-z0-9_.-]{3,30}$') NOT VALID;
    END IF;
END $$;


-- ==============================================================================
-- 2. Cards table (owned by a profile)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) DEFAULT NULL,
    target_url TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    scan_count INTEGER NOT NULL DEFAULT 0,
    last_scanned_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- 3. Card Scans table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.card_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(50) NOT NULL REFERENCES public.cards(card_id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT DEFAULT NULL,
    referer TEXT DEFAULT NULL,
    ip_hash VARCHAR(64) DEFAULT NULL
);


-- ==============================================================================
-- 4. Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cards_card_id    ON public.cards (card_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id    ON public.cards (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_active  ON public.cards (is_active);
CREATE INDEX IF NOT EXISTS idx_card_scans_card_id ON public.card_scans (card_id);
-- Plain lookup index, used by the front-end when resolving a username to a profile.
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
-- Case-insensitive uniqueness index is created above (idx_profiles_username_lower).


-- ==============================================================================
-- 5. updated_at maintenance
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cards_updated_at ON public.cards;
CREATE TRIGGER trigger_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ==============================================================================
-- 6. Helpers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- 6.1 Is this username already taken? (case-insensitive)
--     Needed because the profiles SELECT policy hides other users' rows from
--     non-admins, so the client cannot check availability with a plain SELECT.
CREATE OR REPLACE FUNCTION public.username_exists(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        lower(btrim(coalesce(p_username, ''))) <> ''
        AND EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE lower(username) = lower(btrim(p_username))
        );
$$;

REVOKE ALL ON FUNCTION public.username_exists(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_exists(TEXT) TO anon, authenticated;

-- 6.2 Username -> e-mail resolution used by the login form.
--     Same reason as above: non-admins cannot SELECT other users' profiles.
CREATE OR REPLACE FUNCTION public.email_for_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT p.email
    FROM public.profiles p
    WHERE lower(p.username) = lower(btrim(p_username))
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.email_for_username(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_for_username(TEXT) TO anon, authenticated;

-- 6.3 Admin-only: promote / demote a user between 'admin' and 'user'.
--     SECURITY DEFINER because `authenticated` has no privilege on the `role`
--     column (see the column grants in section 8) - the RPC is the only way to
--     change a role, which is what closes the self-promotion hole that the
--     generic "Users can update own profile" policy used to allow.
CREATE OR REPLACE FUNCTION public.admin_set_role(p_user_id UUID, p_role TEXT)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_role      TEXT := lower(btrim(coalesce(p_role, '')));
    v_current_role  TEXT;
    v_admin_count   INTEGER := 0;
    v_updated       public.profiles;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not_authenticated: يجب تسجيل الدخول لتنفيذ هذا الإجراء'
            USING ERRCODE = '42501';
    END IF;

    -- Authorisation is re-checked here instead of trusting a GRANT alone, so
    -- revoking the EXECUTE privilege later still cannot widen access.
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden: هذا الإجراء متاح للمديرين فقط'
            USING ERRCODE = '42501';
    END IF;

    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'invalid_target: معرّف المستخدم مطلوب'
            USING ERRCODE = '22023';
    END IF;

    IF v_new_role NOT IN ('admin', 'user') THEN
        RAISE EXCEPTION 'invalid_role: الصلاحية يجب أن تكون admin أو user'
            USING ERRCODE = '22023';
    END IF;

    SELECT role INTO v_current_role
    FROM public.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user_not_found: المستخدم غير موجود'
            USING ERRCODE = 'P0002';
    END IF;

    -- Guard: an admin may not demote themselves. Otherwise a single click would
    -- lock the caller out of the very panel they are working in.
    IF p_user_id = auth.uid() AND v_current_role <> v_new_role THEN
        RAISE EXCEPTION 'self_role_change: لا يمكنك تغيير صلاحيتك الخاصة'
            USING ERRCODE = '42501';
    END IF;

    -- Guard: never leave the system without an admin able to manage it.
    IF v_current_role = 'admin' AND v_new_role <> 'admin' THEN
        SELECT count(*) INTO v_admin_count
        FROM public.profiles
        WHERE role = 'admin';

        IF v_admin_count <= 1 THEN
            RAISE EXCEPTION 'last_admin: لا يمكن إزالة صلاحية المدير من آخر حساب إداري في النظام'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    UPDATE public.profiles
    SET role = v_new_role
    WHERE id = p_user_id
    RETURNING * INTO v_updated;

    RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, TEXT) TO authenticated;

-- 6.4 Admin-only: remove a user and every trace of them.
--     The plain `DELETE FROM auth.users` cannot be issued from the anon client
--     (auth is not exposed through PostgREST), and the profile row alone is not
--     enough because the login lives in auth.users. SECURITY DEFINER lets the
--     function owner's rights do the cascade:
--         auth.users -> public.profiles (ON DELETE CASCADE)
--                     -> auth.identities / auth.sessions (Supabase's own FKs)
--     public.cards survives by design, so it is released back to the admin pool
--     instead of being destroyed; public.card_scans is keyed by card_id, so the
--     scan history of those cards is preserved as well.
CREATE OR REPLACE FUNCTION public.delete_user_completely(p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_admin    BOOLEAN := false;
    v_admin_count INTEGER := 0;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not_authenticated: يجب تسجيل الدخول لتنفيذ هذا الإجراء'
            USING ERRCODE = '42501';
    END IF;

    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden: هذا الإجراء متاح للمديرين فقط'
            USING ERRCODE = '42501';
    END IF;

    IF p_target_user_id IS NULL THEN
        RAISE EXCEPTION 'invalid_target: معرّف المستخدم مطلوب'
            USING ERRCODE = '22023';
    END IF;

    IF p_target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'self_delete: لا يمكنك حذف حسابك الخاص، يمكن للمدير الآخر حذفه'
            USING ERRCODE = '42501';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_target_user_id AND role = 'admin'
    ) INTO v_is_admin;

    -- Guard: do not let the last admin delete themselves out of existence and
    -- strand every remaining user without anyone able to manage accounts.
    IF v_is_admin THEN
        SELECT count(*) INTO v_admin_count
        FROM public.profiles
        WHERE role = 'admin';

        IF v_admin_count <= 1 THEN
            RAISE EXCEPTION 'last_admin: لا يمكن حذف آخر حساب إداري في النظام'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    -- Step 1: hand the user's cards back to the unassigned (admin) pool.
    --         Deactivating them prevents a redirect from surviving the deletion.
    UPDATE public.cards
    SET user_id     = NULL,
        is_active   = false,
        client_name = NULL,
        target_url  = NULL
    WHERE user_id = p_target_user_id;

    -- Step 2: drop the profile explicitly. It would also cascade from step 3,
    --         but doing it first keeps the row gone even if a future Supabase
    --         version stops cascading, and it frees the unique username.
    DELETE FROM public.profiles
    WHERE id = p_target_user_id;

    -- Step 3: remove the authentication record itself (sessions + identities
    --         cascade), so the account can never be logged into again.
    DELETE FROM auth.users
    WHERE id = p_target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user_not_found: المستخدم غير موجود'
            USING ERRCODE = 'P0002';
    END IF;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_completely(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO authenticated;


-- ==============================================================================
-- 7. Auto-create the profile on sign-up
-- ==============================================================================
-- Reads `username` from raw_user_meta_data, sanitises it, validates it, and
-- refuses the registration with a readable message when it is invalid or taken.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_raw_username TEXT;
    v_username    TEXT;
    v_role        TEXT := 'user';
BEGIN
    IF NEW.email = 'abdelrahman20e@gmail.com' THEN
        v_role := 'admin';
    END IF;

    -- Normalise whatever the sign-up form sent.
    v_raw_username := lower(btrim(coalesce(NEW.raw_user_meta_data ->> 'username', '')));

    -- Fall back to the e-mail local part when the client sent nothing.
    IF v_raw_username = '' THEN
        v_raw_username := lower(split_part(coalesce(NEW.email, ''), '@', 1));
    END IF;

    -- Strip every character that is not allowed, so the CHECK constraint above
    -- can never reject the row for an unexpected reason.
    v_raw_username := regexp_replace(v_raw_username, '[^a-z0-9_.-]', '', 'g');
    v_username    := left(v_raw_username, 30);

    IF char_length(v_username) < 3 THEN
        RAISE EXCEPTION
            'invalid_username: اسم المستخدم يجب أن يكون 3 أحرف على الأقل باستخدام أحرف إنجليزية وأرقام و _ . - فقط'
            USING ERRCODE = '22023';
    END IF;

    -- The unique index already rejects duplicates; raising first lets the
    -- client receive an actionable message instead of a generic DB error.
    IF EXISTS (
        SELECT 1 FROM public.profiles WHERE lower(username) = v_username
    ) THEN
        RAISE EXCEPTION
            'username_taken: اسم المستخدم مُستعمل بالفعل، يرجى اختيار اسم آخر'
            USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.profiles (id, email, username, role)
    VALUES (NEW.id, NEW.email, v_username, v_role)
    ON CONFLICT (id) DO UPDATE
        SET email    = EXCLUDED.email,
            username = EXCLUDED.username,
            role     = EXCLUDED.role;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 8. Row Level Security
-- ==============================================================================
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_scans ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Users can view their own profile, admins can view all.
-- NOTE: other users' rows stay hidden on purpose; that is exactly why the
--       username lookups go through the SECURITY DEFINER RPCs in section 6.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (username), admins can update any.
-- This policy only decides WHICH ROWS are writable; see the column privileges
-- right below for WHICH COLUMNS are. username stays UNIQUE NOT NULL, so a
-- colliding UPDATE is rejected by the index.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- --- PROFILES COLUMN PRIVILEGES ---
-- RLS answers "which ROWS may be touched"; privileges answer "which COLUMNS".
-- Without this, the UPDATE policy above let any signed-in user rewrite their own
-- `role` to 'admin' - a full privilege escalation. Roles now change only through
-- public.admin_set_role() (section 6.3), so the table-level UPDATE privilege is
-- dropped and re-granted column by column.
--
-- NOTE: a column-level REVOKE is inert while a table-level UPDATE grant exists,
-- so the table-level grant MUST be revoked first - the order below matters.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (username, email) ON public.profiles TO authenticated;

-- Redundant on purpose: re-asserting the absence of the role privilege makes the
-- intent explicit even if a future migration re-adds a broad table-level grant.
-- Unaffected either way, because admin_set_role() is SECURITY DEFINER and runs
-- with the migration role's privileges.
REVOKE UPDATE (role) ON public.profiles FROM anon, authenticated;

-- --- CARDS POLICIES ---
DROP POLICY IF EXISTS "Public read for redirect" ON public.cards;
CREATE POLICY "Public read for redirect" ON public.cards
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own cards" ON public.cards;
CREATE POLICY "Users can insert their own cards" ON public.cards
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own cards or Admin all" ON public.cards;
CREATE POLICY "Users update own cards or Admin all" ON public.cards
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users delete own cards or Admin all" ON public.cards;
CREATE POLICY "Users delete own cards or Admin all" ON public.cards
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- --- SCANS POLICIES ---
DROP POLICY IF EXISTS "Public insert scans" ON public.card_scans;
CREATE POLICY "Public insert scans" ON public.card_scans
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Read scans for card owners or admins" ON public.card_scans;
CREATE POLICY "Read scans for card owners or admins" ON public.card_scans
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            WHERE cards.card_id = card_scans.card_id
            AND (cards.user_id = auth.uid() OR public.is_admin())
        )
    );


-- ==============================================================================
-- 9. Idempotent Fixed Admin Account Seeding
-- ==============================================================================
-- Safely creates/ensures the primary Admin account; re-running never errors.
--   Username: abdo_sadek
--   Email:    abdelrahman20e@gmail.com
--   Password: AbdleSadek20@7!2
--   Role:     'admin'
--
-- The raw_user_meta_data must carry the same username as the profile, otherwise
-- handle_new_user() would derive a different one from the e-mail local part.
-- ==============================================================================
DO $$
DECLARE
    v_admin_uid UUID;
    v_row       RECORD;
    v_base      TEXT;
    v_candidate TEXT;
    v_suffix    INTEGER := 0;
    v_email     CONSTANT TEXT := 'abdelrahman20e@gmail.com';
    v_username  CONSTANT TEXT := 'abdo_sadek';
    v_password  CONSTANT TEXT := 'AbdleSadek20@7!2';
    v_role      CONSTANT TEXT := 'admin';
BEGIN
    -- Step 1: locate the user
    SELECT id INTO v_admin_uid
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    -- Step 2: free the admin username BEFORE touching auth.users.
    --         Inserting into auth.users fires handle_new_user(), which refuses a
    --         duplicate username - so any squatter has to be renamed first,
    --         otherwise the whole seed would abort. When v_admin_uid is NULL the
    --         `id = v_admin_uid` test yields NULL, so the check falls through to
    --         "rename whoever holds it", which is exactly what we want.
    IF EXISTS (
        SELECT 1 FROM public.profiles WHERE lower(username) = v_username
    ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE lower(username) = v_username AND id = v_admin_uid
    ) THEN
        FOR v_row IN
            SELECT * FROM (
                SELECT p.id
                FROM public.profiles p
                WHERE lower(p.username) = v_username
            ) AS squatters
        LOOP
            v_base      := 'user_' || left(replace(v_row.id::TEXT, '-', ''), 8);
            v_candidate := v_base;
            v_suffix    := 0;

            LOOP
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.username = v_candidate AND p.id <> v_row.id
                );
                v_suffix    := v_suffix + 1;
                v_candidate := v_base || '_' || v_suffix;
            END LOOP;

            RAISE NOTICE 'Username % was held by another profile; renamed to %.',
                v_username, v_candidate;

            UPDATE public.profiles SET username = v_candidate WHERE id = v_row.id;
        END LOOP;
    END IF;

    -- Step 3: create or refresh the credentials
    IF v_admin_uid IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_password, gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('username', v_username, 'role', v_role),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO v_admin_uid;

        RAISE NOTICE 'Created new admin user with ID: %', v_admin_uid;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %, refreshing it', v_admin_uid;

        UPDATE auth.users
        SET encrypted_password = crypt(v_password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object('username', v_username, 'role', v_role),
            updated_at = NOW()
        WHERE id = v_admin_uid;
    END IF;

    -- Step 4: ensure the profile exists with the admin role (upsert)
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (v_admin_uid, v_email, v_username, v_role)
    ON CONFLICT (id) DO UPDATE SET
        email    = EXCLUDED.email,
        username = EXCLUDED.username,
        role     = EXCLUDED.role;

    RAISE NOTICE 'Admin profile ensured for user: %', v_email;
END $$;
