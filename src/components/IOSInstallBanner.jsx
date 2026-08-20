import React, { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';

const isIos = () => {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
};

const isInStandaloneMode = () =>
  ('standalone' in window.navigator) && window.navigator.standalone;

const IOSInstallBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sadece iOS'ta ve tarayıcıda açıksa göster (kurulu app'te değil)
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (isIos() && !isInStandaloneMode() && !dismissed) {
      // 3 saniye sonra göster
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 pb-8">
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl relative flex items-start gap-4">
        {/* Kapat */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* İkon */}
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-2xl font-black text-slate-900">K</span>
        </div>

        {/* İçerik */}
        <div className="flex-1 pr-6">
          <p className="text-sm font-black text-white mb-1">Kampüs Pay'i Yükle</p>
          <p className="text-xs text-white/60 leading-relaxed mb-3">
            Ana ekranına ekleyerek uygulama gibi kullan, daha hızlı aç!
          </p>

          {/* Adımlar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <Share size={12} className="text-primary" />
              </div>
              <p className="text-[11px] text-white/70">
                Alt menüdeki <span className="text-white font-bold">Paylaş</span> ikonuna bas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black text-primary">+</div>
              <p className="text-[11px] text-white/70">
                <span className="text-white font-bold">"Ana Ekrana Ekle"</span> seçeneğine dokun
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallBanner;
