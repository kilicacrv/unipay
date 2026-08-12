-- Storage Policy Fixes for 'business-assets' and 'student-cards'

-- 1. business-assets (Mekan Görselleri)
DROP POLICY IF EXISTS "Public Access Business Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Assets Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Assets Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Assets Delete" ON storage.objects;

CREATE POLICY "Public Access Business Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-assets');

CREATE POLICY "Admin/Business Assets Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'business-assets' AND (public.is_admin() OR public.is_business()));

CREATE POLICY "Admin/Business Assets Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'business-assets' AND (public.is_admin() OR public.is_business()));

CREATE POLICY "Admin/Business Assets Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'business-assets' AND (public.is_admin() OR public.is_business()));

-- 2. student-cards (Öğrenci Kimlikleri)
DROP POLICY IF EXISTS "Auth Read Student Cards" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert Student Cards" ON storage.objects;

CREATE POLICY "Auth Read Student Cards" ON storage.objects
  FOR SELECT USING (bucket_id = 'student-cards' AND auth.role() = 'authenticated');

CREATE POLICY "Auth Insert Student Cards" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'student-cards' AND auth.role() = 'authenticated');
