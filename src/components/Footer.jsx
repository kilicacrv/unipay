import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">Ü</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight">Üni<span className="text-indigo-400">Pay</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Öğrenciler için özel indirim ağı. Konya Bosna'nın en popüler mekanlarında geçerli.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">Platform</p>
            <div className="flex flex-col gap-3">
              <Link to="/mekanlar" className="text-slate-300 hover:text-white text-sm transition-colors">Mekanlar</Link>
              <Link to="/kayit" className="text-slate-300 hover:text-white text-sm transition-colors">Öğrenci Kaydı</Link>
              <Link to="/isletme-basvurusu" className="text-slate-300 hover:text-white text-sm transition-colors">İşletme Başvurusu</Link>
              <Link to="/gizlilik" className="text-slate-300 hover:text-white text-sm transition-colors">Gizlilik Politikası</Link>
              <Link to="/kullanim-kosullari" className="text-slate-300 hover:text-white text-sm transition-colors">Kullanım Koşulları</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">İletişim</p>
            <div className="flex flex-col gap-3">
              <a href="https://www.instagram.com/unipay.com.tr" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                @unipay.com.tr
              </a>
              <a href="mailto:info@unipay.app" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors">
                <Mail size={16} /> info@unipay.app
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Üni Pay. Tüm Hakları Saklıdır.</p>
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
