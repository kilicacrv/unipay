-- ==========================================
-- KAMPÜS PAY - GÜVENLİK SCRİPTİ (TEMİZ VERSİYON)
-- ==========================================

-- 1. YARDIMCI FONKSİYONLAR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' = 'alperenklc55@gmail.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_business()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'business';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'student';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_fullname()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'full_name';
END;
$$;

-- ==========================================
-- 2. RLS AKTİVASYONU
-- ==========================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. ESKİ KURALLARI TEMİZLE (Açık DROP IF EXISTS)
-- ==========================================
DROP POLICY IF EXISTS "Student view own application" ON public.applications;
DROP POLICY IF EXISTS "Anyone can insert application" ON public.applications;
DROP POLICY IF EXISTS "Admin update application" ON public.applications;
DROP POLICY IF EXISTS "Admin delete application" ON public.applications;

DROP POLICY IF EXISTS "Admin view business application" ON public.business_applications;
DROP POLICY IF EXISTS "Anyone can insert business application" ON public.business_applications;
DROP POLICY IF EXISTS "Admin update business application" ON public.business_applications;
DROP POLICY IF EXISTS "Admin delete business application" ON public.business_applications;
DROP POLICY IF EXISTS "Business view own application" ON public.business_applications;

DROP POLICY IF EXISTS "Venues viewable by everyone" ON public.venues;
DROP POLICY IF EXISTS "Admin or Business update venue" ON public.venues;
DROP POLICY IF EXISTS "Admin insert venue" ON public.venues;
DROP POLICY IF EXISTS "Admin delete venue" ON public.venues;

DROP POLICY IF EXISTS "Discounts viewable by everyone" ON public.discounts;
DROP POLICY IF EXISTS "Admin or Business insert discount" ON public.discounts;
DROP POLICY IF EXISTS "Admin or Business update discount" ON public.discounts;
DROP POLICY IF EXISTS "Admin or Business delete discount" ON public.discounts;

DROP POLICY IF EXISTS "Visits select" ON public.visits;
DROP POLICY IF EXISTS "Student insert visit" ON public.visits;
DROP POLICY IF EXISTS "Business update visit" ON public.visits;

DROP POLICY IF EXISTS "Student view own points" ON public.student_points;
DROP POLICY IF EXISTS "Business or Admin insert/update points" ON public.student_points;

DROP POLICY IF EXISTS "Student view own history" ON public.points_history;
DROP POLICY IF EXISTS "Business or Admin insert history" ON public.points_history;

DROP POLICY IF EXISTS "Flash campaigns viewable by everyone" ON public.flash_campaigns;
DROP POLICY IF EXISTS "Admin insert/update/delete flash campaigns" ON public.flash_campaigns;
DROP POLICY IF EXISTS "Admin manage flash campaigns" ON public.flash_campaigns;

DROP POLICY IF EXISTS "User manage favorites" ON public.favorites;

DROP POLICY IF EXISTS "Admin view logs" ON public.system_logs;
DROP POLICY IF EXISTS "Authenticated insert logs" ON public.system_logs;
DROP POLICY IF EXISTS "Admin delete logs" ON public.system_logs;

DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "User insert review" ON public.reviews;
DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin delete reviews" ON public.reviews;

DROP POLICY IF EXISTS "Notifications viewable by everyone" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admin manage notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admin view clicks" ON public.notification_clicks;
DROP POLICY IF EXISTS "Authenticated insert clicks" ON public.notification_clicks;

DROP POLICY IF EXISTS "Banners are viewable by everyone" ON public.banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

-- Storage eski kurallar
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Venue Images Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Venue Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Venue Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Venue Images Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Banners Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Banners Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Banners Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Banners Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Venue Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Venue Images Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Venue Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Business Venue Images Delete" ON storage.objects;

-- ==========================================
-- 4. YENİ GÜVENLİ KURALLAR
-- ==========================================

-- [applications]
CREATE POLICY "Student view own application" ON public.applications
  FOR SELECT USING (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Anyone can insert application" ON public.applications
  FOR INSERT WITH CHECK (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin update application" ON public.applications
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete application" ON public.applications
  FOR DELETE USING (public.is_admin());

-- [business_applications]
CREATE POLICY "Admin view business application" ON public.business_applications
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Anyone can insert business application" ON public.business_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update business application" ON public.business_applications
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin delete business application" ON public.business_applications
  FOR DELETE USING (public.is_admin());

-- [venues]
CREATE POLICY "Venues viewable by everyone" ON public.venues
  FOR SELECT USING (true);

CREATE POLICY "Admin or Business update venue" ON public.venues
  FOR UPDATE USING (
    public.is_admin() OR
    (public.is_business() AND name ILIKE '%' || public.get_auth_fullname() || '%')
  );

CREATE POLICY "Admin insert venue" ON public.venues
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete venue" ON public.venues
  FOR DELETE USING (public.is_admin());

-- [discounts]
CREATE POLICY "Discounts viewable by everyone" ON public.discounts
  FOR SELECT USING (true);

CREATE POLICY "Admin or Business insert discount" ON public.discounts
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (public.is_business() AND EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_id AND v.name ILIKE '%' || public.get_auth_fullname() || '%'
    ))
  );

CREATE POLICY "Admin or Business delete discount" ON public.discounts
  FOR DELETE USING (
    public.is_admin() OR
    (public.is_business() AND EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_id AND v.name ILIKE '%' || public.get_auth_fullname() || '%'
    ))
  );

-- [visits]
CREATE POLICY "Visits select" ON public.visits
  FOR SELECT USING (
    public.is_admin() OR
    user_id = auth.uid() OR
    (public.is_business() AND EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_id AND v.name ILIKE '%' || public.get_auth_fullname() || '%'
    ))
  );

CREATE POLICY "Student insert visit" ON public.visits
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Business update visit" ON public.visits
  FOR UPDATE USING (
    public.is_admin() OR
    (public.is_business() AND EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_id AND v.name ILIKE '%' || public.get_auth_fullname() || '%'
    ))
  );

-- [student_points]
CREATE POLICY "Student view own points" ON public.student_points
  FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Business or Admin manage points" ON public.student_points
  FOR ALL USING (public.is_admin() OR public.is_business());

-- [points_history]
CREATE POLICY "Student view own history" ON public.points_history
  FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Business or Admin insert history" ON public.points_history
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_business());

-- [flash_campaigns]
CREATE POLICY "Flash campaigns viewable by everyone" ON public.flash_campaigns
  FOR SELECT USING (true);

CREATE POLICY "Admin manage flash campaigns" ON public.flash_campaigns
  FOR ALL USING (public.is_admin());

-- [favorites]
CREATE POLICY "User manage favorites" ON public.favorites
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- [system_logs]
CREATE POLICY "Admin view logs" ON public.system_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Authenticated insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin delete logs" ON public.system_logs
  FOR DELETE USING (public.is_admin());

-- [reviews]
CREATE POLICY "Reviews viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "User insert review" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin delete reviews" ON public.reviews
  FOR DELETE USING (public.is_admin());

-- [admin_notifications]
CREATE POLICY "Notifications viewable by everyone" ON public.admin_notifications
  FOR SELECT USING (true);

CREATE POLICY "Admin manage notifications" ON public.admin_notifications
  FOR ALL USING (public.is_admin());

-- [notification_clicks]
CREATE POLICY "Admin view clicks" ON public.notification_clicks
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Authenticated insert clicks" ON public.notification_clicks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- [banners]
CREATE POLICY "Banners are viewable by everyone" ON public.banners
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert banners" ON public.banners
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update banners" ON public.banners
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete banners" ON public.banners
  FOR DELETE USING (public.is_admin());

-- ==========================================
-- 5. STORAGE BUCKET GÜVENLİK KURALLARI
-- ==========================================

CREATE POLICY "banners bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "banners bucket admin insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "banners bucket admin update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "banners bucket admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "venue images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'venue-images');

CREATE POLICY "venue images admin business insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'venue-images' AND (public.is_admin() OR public.is_business()));

CREATE POLICY "venue images admin business update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'venue-images' AND (public.is_admin() OR public.is_business()));

CREATE POLICY "venue images admin business delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'venue-images' AND (public.is_admin() OR public.is_business()));

-- ==========================================
-- 6. JWT METADATA ROL KORUMASI (Trigger)
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_metadata_updates()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' IS DISTINCT FROM OLD.raw_user_meta_data->>'role' THEN
    IF OLD.raw_user_meta_data->>'role' IS NOT NULL THEN
      NEW.raw_user_meta_data = jsonb_set(
        NEW.raw_user_meta_data,
        '{role}',
        OLD.raw_user_meta_data->'role'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_role_integrity ON auth.users;
CREATE TRIGGER ensure_role_integrity
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_metadata_updates();

-- TAMAMLANDI.
