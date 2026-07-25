import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, CheckCircle, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';



const QRScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [confirmCode] = useState(Math.floor(Math.random() * 900000 + 100000));
  const [visitId, setVisitId] = useState(null);
  const [status, setStatus] = useState(null); // 'bekliyor', 'onaylandi', 'reddedildi'

  const [isVerifying, setIsVerifying] = useState(true);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    checkStudentVerification();
  }, []);

  const checkStudentVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('status, approved_at')
        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (appError || !appData || appData.status !== 'onaylandi') {
        // Hiç başvurusu yoksa veya henüz onaylanmadıysa
        navigate('/dogrulama');
        return;
      }

      // 1 Yıllık Aktivasyon Kontrolü
      if (appData.approved_at) {
        const approvedDate = new Date(appData.approved_at);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (approvedDate < oneYearAgo) {
          // Süresi dolmuş
          navigate('/dogrulama', { state: { expired: true } });
          return;
        }
      }

      setIsVerifying(false);
    } catch (err) {
      console.error('Doğrulama hatası:', err);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (isVerifying) return; // Doğrulama bitmeden kamerayı açma

    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Removing fixed qrbox to let it scan the whole screen on mobile
          // which fixes scanning issues on smaller screens.
        },
        (result) => {
          if (result.startsWith('unipay_biz_')) {
            html5QrCode.stop().catch(console.error);
            processMatch(result);
          } else {
            setError('Geçersiz QR Kod. Lütfen bir işletme kodu okutun.');
            setTimeout(() => setError(null), 3000);
          }
        },
        (errorMessage) => {
          // Sessiz hata yönetimi
        }
      ).catch((err) => {
        console.error("Kamera başlatılamadı", err);
        setError("Kamera başlatılamadı. Lütfen kamera izinlerini kontrol edin.");
      });

    }, 500);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(console.error);
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [isVerifying]);

  useEffect(() => {
    if (!visitId) return;

    const channel = supabase
      .channel(`visit_${visitId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visits',
          filter: `id=eq.${visitId}`
        },
        (payload) => {
          if (payload.new.status === 'onaylandi') {
            setStatus('onaylandi');
            setEarnedPoints(10); // Show standard points on success
          } else if (payload.new.status === 'reddedildi') {
            setStatus('reddedildi');
            setError('İşletme indirimi reddetti.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [visitId]);

  const processMatch = async (bizQrData) => {
    setIsProcessing(true);

    // Extract business/venue info from QR data
    const bizSlug = bizQrData.replace('unipay_biz_', '');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Giriş yapmanız gerekiyor.');

      const searchParams = new URLSearchParams(location.search);
      const ref = searchParams.get('ref');
      let notificationId = null;
      if (ref && ref.startsWith('notif_')) {
        notificationId = ref.replace('notif_', '');
      }

      // 1. Sadece ziyareti bekliyor olarak kaydet. (Puanı kasiyer onaylayınca vereceğiz)
      const { data, error: insertError } = await supabase.from('visits').insert({
        student_id: user.id,
        user_id: user.id, // Fallback
        business_id: bizSlug, // The missing column!
        venue_id: bizSlug, // Fallback in case both are used
        business_qr: bizQrData,
        pin_code: confirmCode.toString(),
        status: 'bekliyor',
        notification_id: notificationId
      }).select().single();

      if (insertError) throw insertError;

      setVisitId(data.id);
      setStatus('bekliyor');
      setScanResult(bizQrData);
    } catch (err) {
      console.error('Visit recording error:', err.message);
      setError('İşlem kaydedilemedi: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col font-sans">
      {/* Header */}
      <div className="p-6 flex items-center justify-between text-white relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <h2 className="font-bold text-sm tracking-tight uppercase">QR Tarayıcı</h2>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {isVerifying ? (
          <div className="w-full flex flex-col items-center justify-center text-white">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase opacity-70">Hesabınız Kontrol Ediliyor...</p>
          </div>
        ) : !scanResult ? (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[300px]">
              <div id="reader" className="overflow-hidden rounded-[2.5rem] border-4 border-white/10 shadow-2xl bg-black/40"></div>
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(255,214,0,0.8)] animate-[scan_2s_infinite_ease-in-out] z-10" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-[2rem]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-[2rem]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-[2rem]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-[2rem]" />
            </div>
            <p className="text-white/40 text-center mt-12 text-xs font-bold uppercase tracking-widest px-8 leading-relaxed">
              İndirim kodunu doğrulamak için işletmenin QR kodunu taratın
            </p>
          </div>
        ) : status === 'bekliyor' ? (
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300 border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Loader2 size={40} className="text-amber-500 animate-spin" />
              <div className="absolute inset-0 border-4 border-amber-100/50 rounded-full" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Kasiyer Onayı Bekleniyor</h3>
            <p className="text-slate-500 text-sm font-medium px-4 leading-relaxed mb-8">
              Lütfen aşağıdaki kodu kasa görevlisine gösterin.
            </p>
            
            <div className="bg-slate-50 w-full p-6 rounded-[2rem] border-2 border-slate-100 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Onay Kodunuz</p>
              <p className="text-5xl font-black tracking-widest text-slate-900">{confirmCode}</p>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors underline"
            >
              Vazgeç ve Çık
            </button>
          </div>
        ) : status === 'reddedildi' ? (
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300 border border-rose-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">İşlem Reddedildi</h3>
            <p className="text-slate-500 text-sm font-medium px-4 leading-relaxed mb-8">
              Kasiyer indirimi onaylamadı.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              Panoya Dön
            </button>
          </div>
        ) : (
          <div className="fixed inset-0 bg-emerald-500 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 z-[110]">
            <div className="bg-white/20 backdrop-blur-lg w-24 h-24 rounded-full flex items-center justify-center mb-8 text-white shadow-2xl animate-bounce">
              <CheckCircle size={56} strokeWidth={3} />
            </div>
            
            <div className="space-y-4 max-w-sm">
              <h3 className="text-4xl font-black text-white tracking-tight">TEBRİKLER!</h3>
              <div className="h-1 w-20 bg-white/30 mx-auto rounded-full" />
              <p className="text-xl font-bold text-white leading-tight">
                Kampüs Pay <span className="underline decoration-white/40">{scanResult.replace('unipay_biz_', '').split('_').join(' ').toUpperCase()}</span> işletmesinde indiriminiz onaylanmıştır!
              </p>
              <p className="text-emerald-100 text-sm font-medium opacity-90">
                Keyifli vakit geçirmenizi dileriz.
              </p>
            </div>

            {/* Points Earned Badge */}
            {earnedPoints > 0 && (
              <div className="mt-8 bg-white text-emerald-600 px-8 py-4 rounded-[2rem] flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom duration-500 delay-300">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-emerald-500" fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Kazandığın Puan</p>
                  <p className="text-2xl font-black text-emerald-600 leading-none">+{earnedPoints} PUAN</p>
                </div>
              </div>
            )}

            <div className="mt-6 bg-white/10 p-5 rounded-[2rem] border border-white/10 w-full max-w-xs flex justify-between items-center px-8">
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 opacity-70">Onay Kodu</p>
                <p className="text-white font-mono font-bold text-lg tracking-widest">#{confirmCode}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 opacity-70">Durum</p>
                <p className="text-white font-bold text-sm tracking-widest uppercase text-emerald-300">ONAYLANDI</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-8 w-full max-w-xs bg-white text-emerald-600 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-2xl active:scale-95"
            >
              TAMAM
            </button>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
          </div>
        )}

        {error && !scanResult && (
          <div className="absolute bottom-12 left-6 right-6 bg-rose-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-wider shadow-2xl animate-in slide-in-from-bottom duration-300">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-100px) opacity(0); }
          50% { transform: translateY(100px) opacity(1); }
        }
        #reader { border: none !important; }
        #reader video { border-radius: 2rem; object-fit: cover; }
        #reader__dashboard { display: none !important; }
        #reader__status_span { display: none !important; }
      `}} />
    </div>
  );
};

export default QRScanner;
