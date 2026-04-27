import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 select-none">
    <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
      <span className="text-white font-black text-lg">Ü</span>
    </div>
    <span className="font-extrabold text-xl tracking-tight text-dark">Üni<span className="text-primary">Pay</span></span>
  </Link>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-primary transition-colors">Nasıl Çalışır?</Link>
          <Link to="/mekanlar" className="hover:text-primary transition-colors">Mekanlar</Link>
          <Link to="/isletme-basvurusu" className="hover:text-primary transition-colors">İşletmeler</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/kayit" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors px-4 py-2">
            Giriş Yap
          </Link>
          <Link to="/kayit" className="btn-primary text-sm">
            Hemen Başla →
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 py-4 px-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="font-semibold text-slate-600 hover:text-primary py-2 px-3 rounded-xl hover:bg-indigo-50 transition-colors">Nasıl Çalışır?</Link>
          <Link to="/mekanlar" onClick={() => setMenuOpen(false)} className="font-semibold text-slate-600 hover:text-primary py-2 px-3 rounded-xl hover:bg-indigo-50 transition-colors">Mekanlar</Link>
          <Link to="/isletme-basvurusu" onClick={() => setMenuOpen(false)} className="font-semibold text-slate-600 hover:text-primary py-2 px-3 rounded-xl hover:bg-indigo-50 transition-colors">İşletmeler</Link>
          <Link to="/kayit" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm mt-1">
            Hemen Başla →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
