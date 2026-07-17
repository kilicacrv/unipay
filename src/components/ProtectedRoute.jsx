import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
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

        // --- GÜVENLİK MANTIĞI ---
        
        // 1. Admin Kontrolü
        if (allowedRole === 'admin') {
          // Buraya admin e-postalarınızı ekleyin
          const adminEmails = ['alperenklc55@gmail.com']; 
          if (adminEmails.includes(userEmail)) {
            setAuthorized(true);
          }
        } 
        
        // 2. İşletme Kontrolü
        else if (allowedRole === 'business') {
          // Metadata içindeki rolü kontrol et
          if (user.user_metadata?.role === 'business') {
            setAuthorized(true);
          }
        }
        
        // 3. Öğrenci Kontrolü
        else if (allowedRole === 'student') {
          // Önce metadata'ya bak
          const isStudentRole = user.user_metadata?.role === 'student' || !user.user_metadata?.role;
          
          if (isStudentRole) {
            // Veritabanından onay durumunu sorgula
            const { data: appData, error: appError } = await supabase
              .from('applications')
              .select('status')
              .eq('auth_id', user.id)
              .single();

            if (!appError && appData?.status === 'onaylandi') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          }
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
    // Yetkisi yoksa ana sayfaya gönder
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
