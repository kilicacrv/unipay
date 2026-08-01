-- 1. Create the 'banners' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies on 'banners' if any to prevent conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 3. Create policies for the 'banners' bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'banners' );

CREATE POLICY "Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

-- ==========================================
-- VENUE IMAGES BUCKET POLICIES
-- ==========================================

-- 1. Create the 'venue-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create policies for the 'venue-images' bucket
CREATE POLICY "Public Venue Images Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'venue-images' );

CREATE POLICY "Auth Venue Images Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'venue-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Venue Images Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'venue-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Venue Images Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'venue-images' AND auth.role() = 'authenticated' );
