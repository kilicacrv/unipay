import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, CheckCircle, Loader2, AlertTriangle, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const POINTS_PER_VISIT = 10;

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [confirmCode] = useState(Math.floor(Math.random() * 900000 + 100000));

  useEffect(() => {
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        aspectRatio: 1.0,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(result) {
        if (result.startsWith('unipay_biz_')) {
          scanner.clear().catch(e => console.error('Clear error:', e));
          processMatch(result);
        } else {
          setError('Geçersiz QR Kod. Lütfen bir işletme kodu okutun.');
          setTimeout(() => setError(null), 3000);
        }
      }

      function onScanError(err) {
        // Sessiz hata yönetimi
      }

      return () => {
        scanner.clear().catch(e => console.error('Cleanup error:', e));
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const processMatch = async (bizQrData) => {
    setIsProcessing(true);

    // Extract business/venue info from QR data
    const bizSlug = bizQrData.replace('unipay_biz_', '');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Giriş yapmanız gerekiyor.');

      // 1. Record the visit
      await supabase.from('visits').insert({
        user_id: user.id,
        business_qr: bizQrData,
      });

      // 2. Award points
      const { data: existingPoints } = await supabase
        .from('student_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingPoints) {
        await supabase
          .from('student_points')
          .update({ 
            total_points: existingPoints.total_points + POINTS_PER_VISIT,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('student_points')
          .insert({ user_id: user.id, total_points: POINTS_PER_VISIT });
      }

      // 3. Record points history
      await supabase.from('points_history').insert({
        user_id: user.id,
        points: POINTS_PER_VISIT,
        reason: `${bizSlug.split('_').join(' ')} ziyareti`,
      });

      setEarnedPoints(POINTS_PER_VISIT);
    } catch (err) {
      console.error('Visit recording error:', err.message);
    } finally {
      setScanResult(bizQrData);
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
        {!scanResult ? (
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
        ) : isProcessing ? (
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <Loader2 size={48} className="text-primary animate-spin" />
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Doğrulanıyor...</h3>
            <p className="text-slate-500 text-sm font-medium px-4 leading-relaxed">
              Ziyaretiniz sisteme işleniyor, lütfen bekleyin.
            </p>
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

            <div className="mt-6 bg-white/10 p-6 rounded-[2rem] border border-white/10 w-full max-w-xs">
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2 opacity-70">İşlem Onay Kodu</p>
              <p className="text-white font-mono font-bold text-lg tracking-widest">#{confirmCode}</p>
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
