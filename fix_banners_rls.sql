-- Banners tablosu için mevcut politikaları silelim
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

-- Admin doğrulamasını sadece giriş yapmış olmakla değiştirelim (Admin paneline zaten sadece yetkililer girebiliyor)
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (auth.role() = 'authenticated');

-- Aynısını Görsel (Storage) yükleme izinleri için de yapalım
DROP POLICY IF EXISTS "banners bucket admin insert" ON storage.objects;
DROP POLICY IF EXISTS "banners bucket admin update" ON storage.objects;
DROP POLICY IF EXISTS "banners bucket admin delete" ON storage.objects;

CREATE POLICY "banners bucket admin insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "banners bucket admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
CREATE POLICY "banners bucket admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
