import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Logo = () => (
  <Link to="/" className="flex items-center select-none">
    <img src="/logo.png" alt="Kampüs Pay" className="h-10 md:h-12 w-auto" />
  </Link>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <nav className={`sticky top-0 z-50 px-4 py-3 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-dark' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Logo />

        <div className="hidden md:flex gap-8 text-sm font-bold text-dark">
          {/* Gelecekte eklenecek linkler */}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/kayit" className="btn-primary text-sm">
            Ön Kayıt Ol →
          </Link>
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden p-2 rounded-xl hover:bg-dark/5 transition-colors"
          aria-label={menuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 py-4 px-4 bg-white rounded-2xl shadow-xl border border-dark flex flex-col gap-3"
          >
            <div className="h-px bg-slate-100 my-1" />
            <Link to="/kayit" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm">
              Ön Kayıt Ol →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
