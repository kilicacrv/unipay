import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Zap, Store, Star, TrendingDown, ShieldCheck, Users, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MOCK_VENUES } from '../data/mockData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});



const Home = () => {
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Giriş yapmış kullanıcı ana sayfaya düşerse otomatik olarak panele yönlendir
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const fetchVenues = async () => {
      try {
        const { data, error } = await supabase.from('venues').select('*').limit(6);
        if (error || !data || data.length === 0) {
          setFeaturedVenues(MOCK_VENUES.slice(0, 6));
        } else {
          setFeaturedVenues(data);
        }
      } catch (err) {
        setFeaturedVenues(MOCK_VENUES.slice(0, 6));
      }
    };
    fetchVenues();
  }, [navigate]);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden gradient-hero pt-24 pb-32 px-4">
        {/* Background playful shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-20 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">


          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.05] tracking-tighter mb-6">
            Çok Takıl,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
              Az Öde.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10 max-w-2xl">
            Konya Bosna'nın en popüler mekanlarında sadece öğrencilere özel dev indirim ağı. Kampüs Pay ile indirimleri yakalamak için hemen kayıt ol!
          </motion.p>

          <motion.div {...fadeUp(0.3)}>
            <Link to="/kayit" className="btn-primary text-lg px-8 py-4 md:px-10 md:py-4 inline-flex items-center justify-center gap-3 w-full sm:w-auto">
              <Zap size={20} />
              Kayıt Ol
            </Link>
            <p className="mt-4 text-sm font-semibold text-slate-500">Ücretsizdir. Kredi kartı gerekmez.</p>
          </motion.div>


        </div>
      </section>

      {/* ─── FEATURED VENUES ─── */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10 px-2">
            <div>
              <span className="text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Popüler</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tighter mt-4">
                İndirimleri Keşfet
              </h2>
            </div>
            <Link to="/mekanlar" className="hidden md:flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-12 pt-4 px-2 no-scrollbar snap-x snap-mandatory">
            {featuredVenues.map((venue, index) => (
              <motion.div
                key={venue.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="shrink-0 w-[85vw] sm:w-72 md:w-80 bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all snap-start overflow-hidden flex flex-col"
              >
                <div className="h-48 md:h-40 bg-slate-100 relative p-2">
                  <img src={venue.image_url || 'https://via.placeholder.com/400x300?text=Mekan'} alt={venue.name} className="w-full h-full object-cover rounded-[1.5rem]" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-amber-500 font-bold text-sm px-3 py-1.5 rounded-xl shadow-lg border border-white">
                    {venue.discount || '%15'} İndirim
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {venue.category}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-6">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-bold">{venue.rating || '4.5'}</span>
                  </div>
                  <Link to="/kayit" className="bg-slate-900 text-white font-bold rounded-2xl w-full text-center block py-3.5 text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
                    Fırsatı Yakala
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 text-center md:hidden">
            <Link to="/mekanlar" className="inline-flex items-center gap-2 text-slate-700 font-bold hover:text-slate-900 transition-colors bg-white border border-slate-200 px-6 py-3.5 rounded-2xl shadow-sm">
              Tüm Mekanları Gör <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CURIOSITY & MAP ─── */}
      <section className="py-28 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">KEŞFET</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tighter mt-8 mb-6">
              Kampüs Pay ile İndirimleri Yakala!
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              En sevdiğin kafeler, en cool mekanlar... Hepsi tek bir ağda birleşiyor. Bosna'nın yeni hareketine katıl, ayrıcalıklı dünyanın tadını çıkar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white p-2 md:p-3"
          >
            <img 
              src="/bosna-map.png" 
              alt="Bosna Hersek Mahallesi Sanatsal Harita" 
              className="w-full h-auto object-cover rounded-[2rem] hover:scale-105 transition-transform duration-700 cursor-zoom-in"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="avantajlar" className="py-24 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
           <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter"
          >
            Hemen kayıt ol,<br/>indirimleri kaçırma.
          </motion.h2>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
          >
            <Link to="/kayit" className="bg-primary text-slate-900 font-bold text-lg px-8 py-4 md:px-10 md:py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 inline-block w-full sm:w-auto">
                Hemen Kayıt Ol
             </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── BUSINESS CTA ─── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-14 flex flex-col md:flex-row gap-8 md:gap-10 items-center justify-between border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            <div className="max-w-lg w-full">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl mb-6 border border-slate-200">
                <Store size={16} />
                İşletme Sahipleri
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-tight mb-4">
                Mekanınızı sisteme dahil edin, binlerce öğrenciye ulaşın.
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Kampüs Pay ağına katılarak müşteri trafiğinizi artırın ve öğrencilerin ilk tercihi olun.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link to="/isletme-basvurusu" className="btn-secondary text-base md:text-lg flex items-center justify-center gap-2 w-full">
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
