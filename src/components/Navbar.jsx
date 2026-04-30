import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Kayıt Ol', path: '/kayit' },
    { name: 'İşletme Girişi', path: '/isletme-basvurusu' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-6 pointer-events-none">
      <nav 
        className={`
          max-w-6xl mx-auto flex justify-between items-center px-6 py-4 transition-all duration-500 pointer-events-auto
          ${scrolled 
            ? 'bg-white/90 backdrop-blur-xl border border-dark/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem]' 
            : 'bg-transparent rounded-none border-transparent'
          }
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.1 }}
            className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors"
          >
            <span className="text-primary group-hover:text-dark font-black text-xl">Ü</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-dark font-black text-lg leading-none tracking-tight">KAMPÜS PAY</span>
            <span className="text-[10px] text-dark/40 font-bold uppercase tracking-widest mt-0.5">Premium İndirim</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-sm font-bold tracking-tight transition-all relative group ${location.pathname === link.path ? 'text-dark' : 'text-dark/50 hover:text-dark'}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`} />
            </Link>
          ))}
          
          <div className="h-6 w-px bg-dark/10 mx-2" />
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-sm font-bold text-dark/70 hover:text-dark transition-colors px-4 py-2 rounded-xl hover:bg-slate-50"
            >
              <UserCircle2 size={18} />
              Giriş Yap
            </Link>
            <Link 
              to="/kayit" 
              className="bg-dark text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-primary hover:text-dark transition-all duration-300 active:scale-95"
            >
              Ön Kayıt Ol
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden p-3 rounded-2xl bg-dark/5 text-dark hover:bg-dark/10 transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="md:hidden mt-3 max-w-6xl mx-auto pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-dark/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-black text-dark p-4 rounded-2xl hover:bg-slate-50 transition-colors flex justify-between items-center group"
                >
                  {link.name}
                  <ArrowRight size={18} className="text-dark/20 group-hover:text-primary transition-colors" />
                </Link>
              ))}
              
              <div className="h-px bg-dark/5 my-2" />
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <UserCircle2 size={24} className="text-dark/40" />
                  <span className="text-xs font-black uppercase tracking-widest text-dark/60">Giriş Yap</span>
                </Link>
                <Link 
                  to="/kayit" 
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-primary shadow-lg hover:brightness-105 transition-all"
                >
                  <ArrowRight size={24} className="text-dark" />
                  <span className="text-xs font-black uppercase tracking-widest text-dark">Kayıt Ol</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
