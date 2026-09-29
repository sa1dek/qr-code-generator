-- ==============================================================================
-- Dynamic NFC & QR Code Review Cards - Enhanced Schema with Roles & User Isolation
-- ==============================================================================

-- 1. Create Profiles table linked with Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function & Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        -- جعل إيميلك أنت هو الأدمن تلقائياً (استبدل الإيميل هنا بإيميلك)
        CASE WHEN NEW.email = 'admin@example.com' THEN 'admin' ELSE 'user' END
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
    user_id UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- ملكية الكارت
    client_name VARCHAR(255) DEFAULT NULL,
    target_url TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    scan_count INTEGER NOT NULL DEFAULT 0,
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
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- --- CARDS POLICIES ---
-- Public / Redirect link access
CREATE POLICY "Public read for redirect" ON public.cards
    FOR SELECT USING (true);

-- Authenticated Users can create cards for themselves
CREATE POLICY "Users can insert their own cards" ON public.cards
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users can update only their own cards, Admin updates any card
CREATE POLICY "Users update own cards or Admin all" ON public.cards
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can delete only their own cards, Admin deletes any card
CREATE POLICY "Users delete own cards or Admin all" ON public.cards
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- --- SCANS POLICIES ---
CREATE POLICY "Public insert scans" ON public.card_scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Read scans for card owners or admins" ON public.card_scans
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            WHERE cards.card_id = card_scans.card_id
            AND (cards.user_id = auth.uid() OR public.is_admin())
        )
    );