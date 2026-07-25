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

          // Öğrenci onay durumunu sorgula
          const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('status')
            .or(`auth_id.eq.${user.id},email.eq.${userEmail}`)
            .limit(1)
            .maybeSingle();

          if (!appError && appData?.status === 'onaylandi') {
            setAuthorized(true);
          } else if (!appError && appData?.status === 'bekliyor') {
            // Hesap var ama henüz onaylanmamış
            setPendingApproval(true);
            setAuthorized(false);
          } else {
            setAuthorized(false);
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
    // Onay bekleyen öğrenci → anlamlı mesaj göster
    if (pendingApproval) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ⏳
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Hesabınız İnceleniyor</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Öğrenci belgeniz yüklendi ve ekibimiz tarafından inceleniyor. Onaylandığında giriş yapabileceksiniz.<br/>
              <span className="text-xs text-slate-400 mt-2 block">Bu işlem genellikle 24 saat içinde tamamlanır.</span>
            </p>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }
    // Yetkisi yoksa login sayfasına gönder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
