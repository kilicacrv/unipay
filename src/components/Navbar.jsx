import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, UserCircle, LogOut, LayoutDashboard, Store, Zap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');
  const location = useLocation();

  useEffect(() => {
    const updateDashboardUrl = (currentSession) => {
      if (!currentSession) { setDashboardUrl('/dashboard'); return; }
      const role = currentSession.user?.user_metadata?.role;
      const email = currentSession.user?.email;
      const adminEmails = ['alperenklc55@gmail.com'];
      if (adminEmails.includes(email) || role === 'admin') setDashboardUrl('/admin');
      else if (role === 'business') setDashboardUrl('/business');
      else setDashboardUrl('/dashboard');
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      updateDashboardUrl(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      updateDashboardUrl(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Belirli rotalarda Navbar'ı gizle
  const hiddenRoutes = ['/dashboard', '/business', '/admin', '/mekanlar', '/mekan'];
  const isHidden = hiddenRoutes.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < 50) { setVisible(true); setScrolled(false); }
      else { setVisible(prevScrollPos > current); setScrolled(true); }
      setPrevScrollPos(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  if (isHidden) return null;

  const navLinks = [
    { to: '/mekanlar', label: 'Mekanlar', icon: <MapPin size={15} /> },
    { to: '/isletme-basvurusu', label: 'İşletme Ol', icon: <Store size={15} /> },
  ];

  return (
    <>
      {/* Backdrop when mobile menu open */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`
          fixed top-0 left-0 right-0 z-[100] px-4 py-3 pointer-events-none
          transition-transform duration-500 ease-in-out
          ${visible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <nav
          className={`
            max-w-6xl mx-auto flex justify-between items-center px-4 md:px-6 py-2.5
            transition-all duration-500 pointer-events-auto
            ${scrolled
              ? 'bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-900/5 rounded-[1.5rem]'
              : 'bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-white/40'
            }
          `}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center select-none shrink-0">
            <img src="/kampus-pay.png" alt="Kampüs Pay" className="h-12 md:h-14 w-auto" />
          </Link>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${location.pathname === link.to
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link
                  to={dashboardUrl}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <LayoutDashboard size={15} />
                  Panelim
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  <LogOut size={15} />
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="flex items-center gap-1.5 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary hover:text-dark hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                >
                  Kayıt Ol
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile: session indicator + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {session && (
              <Link
                to={dashboardUrl}
                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                <Zap size={12} />
                Panel
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              aria-label="Menü"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
                  : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* ── Mobile Full Dropdown ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden mt-2 pointer-events-auto"
            >
              <div className="bg-white/98 backdrop-blur-2xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden">

                {/* Nav links */}
                <div className="p-3 border-b border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Keşfet</p>
                  {navLinks.map((link, i) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all
                        ${location.pathname === link.to
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-700 font-semibold hover:bg-slate-50'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        {React.cloneElement(link.icon, { size: 16 })}
                      </div>
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Auth actions */}
                <div className="p-3">
                  {session ? (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Hesap</p>
                      <Link
                        to={dashboardUrl}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                          <LayoutDashboard size={16} className="text-primary" />
                        </div>
                        <span className="text-sm">Panelim</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-rose-600 font-semibold hover:bg-rose-50 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                          <LogOut size={16} className="text-rose-500" />
                        </div>
                        <span className="text-sm">Çıkış Yap</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Hesap</p>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                          <UserCircle size={16} className="text-slate-500" />
                        </div>
                        <span className="text-sm">Giriş Yap</span>
                      </Link>
                      <Link
                        to="/kayit"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 mt-1 rounded-2xl text-white bg-slate-900 font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                          <ArrowRight size={16} className="text-white" />
                        </div>
                        <span className="text-sm">Ücretsiz Kayıt Ol</span>
                      </Link>

                      {/* Business CTA */}
                      <div className="mt-3 mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
                        <div className="flex items-center gap-2 mb-1">
                          <Store size={13} className="text-amber-600" />
                          <span className="text-[11px] font-black text-amber-700 uppercase tracking-wide">İşletmeniz mi var?</span>
                        </div>
                        <p className="text-[11px] text-amber-700/80 mb-2 leading-relaxed">Kampüs Pay'e katılın, öğrencilere ulaşın.</p>
                        <Link
                          to="/isletme-basvurusu"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-500 text-white text-[11px] font-black hover:bg-amber-600 transition-all active:scale-[0.98]"
                        >
                          Başvuru Yap <ArrowRight size={11} />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navbar;
