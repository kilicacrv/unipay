import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Aşağı mı yukarı mı kaydırıyor?
      const isScrollingUp = prevScrollPos > currentScrollPos;
      
      // En üstteyse her zaman göster
      if (currentScrollPos < 50) {
        setVisible(true);
        setScrolled(false);
      } else {
        setVisible(isScrollingUp);
        setScrolled(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <div 
      className={`
        fixed top-0 left-0 right-0 z-[100] px-4 py-3 md:py-4 pointer-events-none transition-transform duration-500 ease-in-out
        ${visible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <nav 
        className={`
          max-w-6xl mx-auto flex justify-between items-center px-5 py-2 transition-all duration-500 pointer-events-auto
          ${scrolled 
            ? 'bg-white/95 backdrop-blur-xl border border-dark/5 shadow-xl rounded-[1.5rem]' 
            : 'bg-white/50 backdrop-blur-sm rounded-[1.5rem] border border-white/20'
          }
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center select-none">
          <img src="/kampus-pay.png" alt="Kampüs Pay" className="h-14 md:h-18 w-auto" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Giriş Yap</Link>
          <Link 
            to="/kayit" 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-primary hover:text-dark hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            Kayıt Ol
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden p-2 rounded-xl bg-dark/5 text-dark"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Minimal Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="md:hidden mt-2 max-w-[200px] ml-auto pointer-events-auto"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-3 shadow-2xl flex flex-col overflow-hidden">
              <Link 
                to="/login" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                <UserCircle2 size={20} className="text-slate-400" />
                Giriş Yap
              </Link>
              <Link 
                to="/kayit" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-white bg-slate-900 rounded-2xl transition-colors mt-2"
              >
                <ArrowRight size={20} />
                Kayıt Ol
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
