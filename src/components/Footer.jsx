import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Kampüs Pay Logo" className="h-10 md:h-12 w-auto" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Öğrenciler için özel indirim ağı. Konya Bosna'nın en popüler mekanlarında geçerli.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">Platform</p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-slate-300 hover:text-white text-sm transition-colors">İşletme Girişi</Link>
              <Link to="/isletme-basvurusu" className="text-slate-300 hover:text-white text-sm transition-colors font-semibold text-secondary">İşletme Başvurusu</Link>
              <Link to="/gizlilik" className="text-slate-300 hover:text-white text-sm transition-colors">Gizlilik Politikası</Link>
              <Link to="/kullanim-kosullari" className="text-slate-300 hover:text-white text-sm transition-colors">Kullanım Koşulları</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">İletişim</p>
            <div className="flex flex-col gap-3">
              <a href="https://www.instagram.com/kampuspay" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                @kampuspay
              </a>
              <a href="https://www.tiktok.com/@kampuspay" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                @kampuspay
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Kampüs Pay. Tüm Hakları Saklıdır.</p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <Link to="/gizlilik" className="hover:text-slate-300 transition-colors">Gizlilik</Link>
            <Link to="/kullanim-kosullari" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</Link>
            <div className="flex items-center gap-1.5">
              <Shield size={13} />
              <span>Güvenli Bağlantı</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
