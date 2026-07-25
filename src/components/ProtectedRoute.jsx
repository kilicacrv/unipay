import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const user = session.user;
        const userEmail = user.email;
        const role = user.user_metadata?.role;

        // 1. Admin Kontrolü
        if (allowedRole === 'admin') {
          const adminEmails = ['alperenklc55@gmail.com'];
          setAuthorized(adminEmails.includes(userEmail));
        }

        // 2. İşletme Kontrolü — applications tablosuna kayıt atılmıyor, sadece metadata kontrolü
        else if (allowedRole === 'business') {
          setAuthorized(role === 'business');
        }

        // 3. Öğrenci Kontrolü — applications tablosundan onay durumu kontrol et
        else if (allowedRole === 'student') {
          // Admin e-postası öğrenci sayfasına girmeye çalışıyorsa izin verme
          if (userEmail === 'alperenklc55@gmail.com') {
            setAuthorized(false);
            setLoading(false);
            return;
          }

          // İşletme hesabı öğrenci sayfasına girmeye çalışıyorsa izin verme
          if (role === 'business') {
            setAuthorized(false);
            setLoading(false);
            return;
          }

          // Öğrenciler artık onay beklemeden dashboard'a girebilir.
          // Onay ve aktivasyon kontrolü sadece QRScanner (İndirim Kullanımı) aşamasında yapılacak.
          setAuthorized(true);
        }

        setLoading(false);
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        setAuthorized(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    // Yetkisi yoksa login sayfasına gönder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
