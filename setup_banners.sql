-- Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text,
  image_url text NOT NULL,
  color_from text DEFAULT 'from-amber-600',
  color_to text DEFAULT 'to-orange-500',
  link_url text DEFAULT '/mekanlar',
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (auth.role() = 'authenticated');

-- Insert Dummy Data for initial view
INSERT INTO public.banners (title, subtitle, description, image_url, color_from, color_to, link_url) VALUES 
('Kahve Saati', 'Tüm İçeceklerde %30 İndirim', 'Sınav haftasına özel enerji patlaması. Sadece öğrencilere özel!', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', 'from-amber-600', 'to-orange-500', '/mekanlar'),
('Burger Gecesi', '2. Menü Anında Bedava', 'Arkadaşını al gel, Kampüs Pay ile anında kazan.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', 'from-rose-600', 'to-pink-500', '/mekanlar'),
('Tatlı Molası', 'Cheesecake + Filtre Kahve 150₺', 'Ders aralarının vazgeçilmez ikilisi, kaçırma!', 'https://images.unsplash.com/photo-1579954115545-a95711fe5922?auto=format&fit=crop&w=800&q=80', 'from-indigo-600', 'to-purple-500', '/mekanlar');
