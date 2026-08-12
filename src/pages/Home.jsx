import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Zap, Store, Star, ShieldCheck, ChevronRight, MapPin, Navigation, ArrowRight, Sparkles, BadgePercent, Coffee, Utensils, Gift, Clock, CheckCircle, Percent, Tag, Pizza, IceCream, Ticket, Bed, Music, Gamepad2, ShoppingBag, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BannerCarousel from '../components/BannerCarousel';


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

// Floating background icons config
const floatingIcons = [
  { Icon: Coffee, top: '8%', left: '5%', size: 28, delay: 0, duration: 18, color: 'text-amber-300/20' },
  { Icon: Pizza, top: '15%', right: '8%', size: 32, delay: 2, duration: 22, color: 'text-orange-300/15' },
  { Icon: IceCream, top: '35%', left: '3%', size: 24, delay: 4, duration: 20, color: 'text-pink-300/15' },
  { Icon: Percent, top: '60%', right: '5%', size: 30, delay: 1, duration: 19, color: 'text-emerald-300/20' },
  { Icon: Tag, top: '75%', left: '8%', size: 26, delay: 3, duration: 21, color: 'text-blue-300/15' },
  { Icon: Ticket, top: '20%', left: '85%', size: 22, delay: 5, duration: 17, color: 'text-purple-300/15' },
  { Icon: Bed, top: '50%', left: '90%', size: 28, delay: 2.5, duration: 23, color: 'text-teal-300/15' },
  { Icon: Music, top: '80%', right: '12%', size: 24, delay: 1.5, duration: 18, color: 'text-rose-300/15' },
  { Icon: Gamepad2, top: '45%', left: '12%', size: 20, delay: 3.5, duration: 20, color: 'text-indigo-300/15' },
  { Icon: ShoppingBag, top: '65%', left: '45%', size: 22, delay: 4.5, duration: 22, color: 'text-amber-300/15' },
  { Icon: Scissors, top: '25%', left: '40%', size: 20, delay: 0.5, duration: 19, color: 'text-cyan-300/15' },
  { Icon: Utensils, top: '70%', left: '70%', size: 26, delay: 2, duration: 21, color: 'text-orange-300/15' },
];

const Home = () => {
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [session, setSession] = useState(null);
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');

  useEffect(() => {
    const updateDashboardUrl = (currentSession) => {
      if (!currentSession) {
        setDashboardUrl('/dashboard');
        return;
      }
      const user = currentSession.user;
      const role = user?.user_metadata?.role;
      const email = user?.email;
      const adminEmails = ['alperenklc55@gmail.com'];

      if (adminEmails.includes(email)) {
        setDashboardUrl('/admin');
      } else if (role === 'admin') {
        setDashboardUrl('/admin');
      } else if (role === 'business') {
        setDashboardUrl('/business');
      } else {
        setDashboardUrl('/dashboard');
      }
    };

    // Oturum durumunu al
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      updateDashboardUrl(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      updateDashboardUrl(session);
    });

    const fetchVenues = async () => {
      try {
        const { data, error } = await supabase.from('venues').select('*, discounts(*)');
        if (error || !data) {
          setFeaturedVenues([]);
        } else {
          const activeVenues = data
            .filter(v => v.discounts && v.discounts.length > 0)
            .map(v => {
              const d = v.discounts[0];
              const discountText = d.discount_rate ? `%${d.discount_rate}` : (d.title || '%15');
              return { ...v, discount: discountText };
            });
          setFeaturedVenues(activeVenues.slice(0, 6));
        }
      } catch (err) {
        setFeaturedVenues([]);
      }
    };

    fetchVenues();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-20 md:pb-32 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-3xl" />
        
        {/* Floating Vector Icons */}
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.color} pointer-events-none select-none`}
            style={{ top: item.top, left: item.left, right: item.right }}
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 10, -5, 8, 0],
              rotate: [0, 8, -5, 3, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          {/* Güven Rozeti */}
          <motion.div {...fadeUp(0)} className="mb-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-600 text-xs font-bold px-4 py-2 rounded-full border border-slate-200/60 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Konya Bosna'da aktif
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-[2.75rem] md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tighter mb-6">
            Çok Takıl,<br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-shimmer">
                Az Öde.
              </span>
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-base md:text-xl text-slate-500 font-medium leading-relaxed mb-8 max-w-lg md:max-w-2xl">
            Konya Bosna'nın en popüler mekanlarında sadece <span className="text-slate-800 font-bold">öğrencilere özel</span> dev indirim ağı.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to={session ? dashboardUrl : "/kayit"} className="btn-primary text-base md:text-lg px-8 py-4 md:px-10 md:py-4 inline-flex items-center justify-center gap-3 w-full sm:w-auto group">
              <Zap size={20} className="group-hover:rotate-12 transition-transform" />
              {session ? "Panelime Git" : "Ücretsiz Kayıt Ol"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {!session && (
              <Link to="/login" className="bg-white text-slate-700 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-base inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                Giriş Yap
              </Link>
            )}
          </motion.div>

          {!session && (
            <motion.p {...fadeUp(0.4)} className="mt-4 text-xs font-semibold text-slate-400">
              Ücretsizdir · Kredi kartı gerekmez · 30 saniyede kayıt
            </motion.p>
          )}

          {/* ─── Sistemi Anlatan Özellikler ─── */}
          <motion.div {...fadeUp(0.5)} className="mt-12 md:mt-16 w-full max-w-md md:max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 md:p-5 border border-slate-200/60 shadow-sm flex items-center gap-3 md:flex-col md:text-center md:gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <BadgePercent className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-black text-slate-900">Özel İndirimler</div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium">Sadece öğrencilere</div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 md:p-5 border border-primary/30 shadow-sm shadow-primary/5 flex items-center gap-3 md:flex-col md:text-center md:gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 md:w-6 md:h-6 text-slate-800" />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-black text-slate-900">QR ile Anında</div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium">Tarat, faydalan</div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 md:p-5 border border-emerald-200/60 shadow-sm flex items-center gap-3 md:flex-col md:text-center md:gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-black text-slate-900">%100 Ücretsiz</div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium">Kart gerekmez</div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 md:p-5 border border-purple-200/60 shadow-sm flex items-center gap-3 md:flex-col md:text-center md:gap-2">
                <div className="w-9 h-9 md:w-12 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-black text-slate-900">Puan Kazan</div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium">Kullandıkça biriktir</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BANNER CAROUSEL ─── */}
      <BannerCarousel />

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 mb-4 inline-block">Nasıl Çalışır?</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter mt-4">
              3 Basit Adımda İndirim
            </h2>
          </motion.div>

          {/* Mobile: Vertical Timeline / Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-12 h-0.5 bg-slate-100 z-0" style={{ left: '16.66%', right: '16.66%', width: '66.66%' }} />

            {[
              { icon: QrCode, title: '1. QR Okut', desc: 'Kasadaki Kampüs Pay QR kodunu okut, sistem öğrenci olduğunu işletmeye anında bildirsin.', border: 'border-slate-200', shadow: 'shadow-slate-200/50', iconBg: 'bg-slate-50', iconColor: 'text-slate-900' },
              { icon: Zap, title: '2. İndirimi Kap', desc: 'İşletme ödemeyi onaylasın, sadece öğrencilere özel olan bu dev indirimden anında faydalan.', border: 'border-primary', shadow: 'shadow-primary/20', iconBg: 'bg-primary/10', iconColor: 'text-slate-900' },
              { icon: Star, title: '3. Puan Kazan', desc: 'Her işleminizden Kampüs Puan (KP) kazanın, daha fazla fırsatın kilidini açın.', border: 'border-amber-200', shadow: 'shadow-amber-200/50', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className={`w-24 h-24 bg-white rounded-[2rem] border ${step.border} shadow-xl ${step.shadow} flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300`}>
                  <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-base text-slate-500 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Compact horizontal steps */}
          <div className="md:hidden flex flex-col gap-4">
            {[
              { icon: QrCode, step: '1', title: 'QR Okut', desc: 'Kasadaki QR\'ı tarat, öğrenci olduğun anında görülsün.', gradient: 'from-slate-100 to-slate-50', accent: 'bg-slate-900', accentText: 'text-white' },
              { icon: Zap, step: '2', title: 'İndirimi Kap', desc: 'İşletme onaylasın, dev indiriminden anında faydalan.', gradient: 'from-primary/20 to-amber-50', accent: 'bg-primary', accentText: 'text-slate-900' },
              { icon: Star, step: '3', title: 'Puan Kazan', desc: 'Her işlemden puan kazan, daha fazla fırsat aç.', gradient: 'from-amber-100 to-orange-50', accent: 'bg-amber-500', accentText: 'text-white' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 bg-gradient-to-r ${step.gradient} rounded-2xl p-4 border border-white shadow-sm`}
              >
                <div className={`w-12 h-12 ${step.accent} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                  <step.icon className={`w-6 h-6 ${step.accentText}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900">{step.step}. {step.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{step.desc}</p>
                </div>
                {i < 2 && (
                  <ArrowRight size={16} className="text-slate-300 shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VENUES ─── */}
      <section className="py-16 md:py-20 px-4 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-10 px-2">
            <div>
              <span className="text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Popüler</span>
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter mt-3 md:mt-4">
                İndirimleri Keşfet
              </h2>
            </div>
            <Link to="/mekanlar" className="hidden md:flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 md:pb-12 pt-4 px-2 no-scrollbar snap-x snap-mandatory">
            {featuredVenues.map((venue, index) => (
              <motion.div
                key={venue.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="shrink-0 w-[75vw] sm:w-72 md:w-80 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all snap-start overflow-hidden flex flex-col"
              >
                <div className="h-44 md:h-44 bg-slate-100 relative">
                  <img src={venue.image_url || 'https://via.placeholder.com/400x300?text=Mekan'} alt={venue.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-amber-600 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-white">
                    {venue.discount} İndirim
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold">{venue.rating || '4.5'}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {venue.category}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{venue.name}</h3>
                  {venue.address && (
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-4">
                      <MapPin size={10} /> {venue.address?.split(',')[0]}
                    </p>
                  )}
                  <div className="mt-auto flex gap-2">
                    <Link to={session ? "/dashboard" : "/kayit"} className="bg-slate-900 text-white font-bold rounded-2xl flex-1 text-center py-3 text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {session ? "Mekanı İncele" : "Fırsatı Yakala"}
                    </Link>
                    {venue.lat && venue.lng && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-100 text-slate-600 font-bold rounded-2xl w-11 flex items-center justify-center hover:bg-primary hover:text-dark transition-colors border border-slate-200"
                        title="Yol Tarifi Al"
                      >
                        <Navigation size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-2 text-center md:hidden">
            <Link to="/mekanlar" className="inline-flex items-center gap-2 text-slate-700 font-bold hover:text-slate-900 transition-colors bg-white border border-slate-200 px-6 py-3.5 rounded-2xl shadow-sm">
              Tüm Mekanları Gör <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NEDEN KAMPÜS PAY? (Trust Badges) ─── */}
      <section className="py-16 md:py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 mb-4 inline-block">Avantajlar</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter mt-4">
              Neden Kampüs Pay?
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[
              { icon: BadgePercent, title: 'Dev İndirimler', desc: 'Öğrenciye özel fiyatlar', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: Clock, title: 'Anında Onay', desc: 'QR okut, hemen faydalan', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
              { icon: ShieldCheck, title: '%100 Güvenli', desc: 'Verileriniz şifreli', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Gift, title: 'Puan Sistemi', desc: 'Kullandıkça kazan', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`${item.bg} rounded-2xl md:rounded-3xl p-4 md:p-6 border ${item.border} text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 ${item.bg} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 md:w-7 md:h-7 ${item.color}`} />
                </div>
                <h3 className="text-xs md:text-base font-black text-slate-900 mb-0.5 md:mb-1">{item.title}</h3>
                <p className="text-[10px] md:text-sm text-slate-500 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/80 text-xs font-bold px-4 py-2 rounded-full border border-white/10 mb-6">
              <Sparkles size={14} className="text-primary" />
              Tamamen Ücretsiz
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              {session ? "İndirimleri yakalamaya" : "Hemen kayıt ol,"}<br/>{session ? "hemen başla." : "indirimleri kaçırma."}
            </h2>
          </motion.div>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
          >
            <Link to={session ? "/dashboard" : "/kayit"} className="bg-primary text-slate-900 font-black text-base md:text-lg px-8 py-4 md:px-10 md:py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-3 w-full sm:w-auto group">
               {session ? "Panelime Git" : "Hemen Kayıt Ol"}
               <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── BUSINESS CTA ─── */}
      <section className="py-16 md:py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-14 flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="max-w-lg w-full">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl mb-4 md:mb-6 border border-slate-200">
                <Store size={16} />
                İşletme Sahipleri
              </div>
              <h2 className="text-xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-3 md:mb-4">
                Mekanınızı sisteme dahil edin, binlerce öğrenciye ulaşın.
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                Kampüs Pay ağına katılarak müşteri trafiğinizi artırın ve öğrencilerin ilk tercihi olun.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link to="/isletme-basvurusu" className="btn-secondary text-sm md:text-lg flex items-center justify-center gap-2 w-full">
                <Star size={20} className="text-amber-500" />
                İşletme Başvurusu Yap
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
