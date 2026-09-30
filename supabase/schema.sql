-- ==============================================================================
-- Dynamic NFC & QR Code Review Cards - Enhanced Schema with Roles & User Isolation
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles table linked with Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function & Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        CASE WHEN NEW.email = 'abdelrahman20e@gmail.com' THEN 'admin' ELSE 'user' END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Cards table with user_id
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


-- 3. Create Card Scans table
CREATE TABLE IF NOT EXISTS public.card_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(50) NOT NULL REFERENCES public.cards(card_id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT DEFAULT NULL,
    referer TEXT DEFAULT NULL,
    ip_hash VARCHAR(64) DEFAULT NULL
);


-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_cards_card_id ON public.cards (card_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON public.cards (is_active);
CREATE INDEX IF NOT EXISTS idx_card_scans_card_id ON public.card_scans (card_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);


-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_cards_updated_at ON public.cards;
CREATE TRIGGER trigger_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 6. Helper Function to check if user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_scans ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Users can view their own profile, admins can view all
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (username), admins can update any
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());


-- --- CARDS POLICIES ---
-- Public / Redirect link access (anyone can read card for redirect)
DROP POLICY IF EXISTS "Public read for redirect" ON public.cards;
CREATE POLICY "Public read for redirect" ON public.cards
    FOR SELECT USING (true);

-- Authenticated Users can create cards for themselves, admins can create for anyone
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.cards;
CREATE POLICY "Users can insert their own cards" ON public.cards
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users can update only their own cards, Admin updates any card
DROP POLICY IF EXISTS "Users update own cards or Admin all" ON public.cards;
CREATE POLICY "Users update own cards or Admin all" ON public.cards
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users can delete only their own cards, Admin deletes any card
DROP POLICY IF EXISTS "Users delete own cards or Admin all" ON public.cards;
CREATE POLICY "Users delete own cards or Admin all" ON public.cards
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());


-- --- SCANS POLICIES ---
-- Public can insert scans (for redirect tracking)
DROP POLICY IF EXISTS "Public insert scans" ON public.card_scans;
CREATE POLICY "Public insert scans" ON public.card_scans
    FOR INSERT WITH CHECK (true);

-- Read scans for card owners or admins
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
-- 8. Idempotent Fixed Admin Account Seeding
-- ==============================================================================
-- This block safely creates/ensures the primary Admin account without errors on re-run.
-- Admin Details:
--   Username: abdo_sadek
--   Email: abdelrahman20e@gmail.com
--   Password: AbdleSadek20@7!2
--   Role: 'admin'
-- ==============================================================================

DO $$
DECLARE
    v_admin_uid UUID;
    v_email CONSTANT TEXT := 'abdelrahman20e@gmail.com';
    v_username CONSTANT TEXT := 'abdo_sadek';
    v_password CONSTANT TEXT := 'AbdleSadek20@7!2';
    v_role CONSTANT TEXT := 'admin';
BEGIN
    -- Step 1: Check if user already exists in auth.users
    SELECT id INTO v_admin_uid
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    -- Step 2: If not exists, create the user in auth.users with hashed password
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
            jsonb_build_object('username', v_username),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO v_admin_uid;

        RAISE NOTICE 'Created new admin user with ID: %', v_admin_uid;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', v_admin_uid;
        
        -- Update password in case it changed
        UPDATE auth.users
        SET encrypted_password = crypt(v_password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object('username', v_username),
            updated_at = NOW()
        WHERE id = v_admin_uid;
    END IF;

    -- Step 3: Ensure profile exists with admin role and username (upsert)
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (v_admin_uid, v_email, v_username, v_role)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        role = EXCLUDED.role;

    RAISE NOTICE 'Admin profile ensured for user: %', v_email;
END $$;