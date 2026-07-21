import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
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
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden gradient-hero pt-24 pb-32 px-4">
        {/* Background playful shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-20 w-32 h-32 bg-white rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">


          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-black text-dark leading-[1.05] tracking-tight mb-6">
            Çok Takıl,<br />
            <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Az Öde.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-xl text-dark font-medium leading-relaxed mb-10 max-w-2xl">
            Konya Bosna'nın en popüler mekanlarında sadece öğrencilere özel dev indirim ağı. Kampüs Pay ile indirimleri yakalamak için hemen kayıt ol!
          </motion.p>

          <motion.div {...fadeUp(0.3)}>
            <Link to="/kayit" className="btn-primary text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 inline-flex items-center justify-center gap-3 w-full sm:w-auto">
              <Zap size={24} />
              Kayıt Ol
            </Link>
            <p className="mt-4 text-sm font-bold text-dark/70">Ücretsizdir. Kredi kartı gerekmez.</p>
          </motion.div>


        </div>
      </section>

      {/* ─── FEATURED VENUES ─── */}
      <section className="py-20 px-4 bg-white border-t-4 border-dark overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10 px-2">
            <div>
              <span className="text-primary font-black text-sm uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">Popüler</span>
              <h2 className="text-3xl md:text-5xl font-black text-dark tracking-tight mt-4">
                İndirimleri Keşfet
              </h2>
            </div>
            <Link to="/kayit" className="hidden md:flex items-center gap-2 text-dark font-bold hover:text-primary transition-colors">
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar snap-x snap-mandatory">
            {featuredVenues.map((venue, index) => (
              <motion.div
                key={venue.id || index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="shrink-0 w-72 md:w-80 bg-white rounded-[2rem] border-4 border-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all snap-start overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-slate-100 relative">
                  <img src={venue.image_url || 'https://via.placeholder.com/400x300?text=Mekan'} alt={venue.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-primary text-dark font-black px-3 py-1.5 rounded-xl border-2 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
                    {venue.discount || '%15'} İndirim
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {venue.category}
                  </div>
                  <h3 className="text-xl font-black text-dark tracking-tight mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-6">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-black">{venue.rating || '4.5'}</span>
                  </div>
                  <Link to="/kayit" className="btn-primary w-full text-center block py-3 text-sm">
                    Fırsatı Yakala
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 text-center md:hidden">
            <Link to="/kayit" className="inline-flex items-center gap-2 text-dark font-bold hover:text-primary transition-colors border-2 border-dark px-6 py-3 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Tüm Mekanları Gör <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CURIOSITY & MAP ─── */}
      <section className="py-28 px-4 bg-background border-t-4 border-dark">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="text-secondary font-black text-lg uppercase tracking-widest bg-secondary/10 px-4 py-2 rounded-full border-2 border-secondary">KEŞFET</span>
            <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight mt-8 mb-6 uppercase">
              Kampüs Pay ile İndirimleri Yakala!
            </h2>
            <p className="text-dark/80 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              En sevdiğin kafeler, en cool mekanlar... Hepsi tek bir ağda birleşiyor. Bosna'nın yeni hareketine katıl, ayrıcalıklı dünyanın tadını çıkar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[2rem] overflow-hidden border-4 border-dark shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white"
          >
            <img 
              src="/bosna-map.png" 
              alt="Bosna Hersek Mahallesi Sanatsal Harita" 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="avantajlar" className="py-24 px-4 bg-dark">
        <div className="max-w-4xl mx-auto text-center">
           <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-8"
          >
            Hemen kayıt ol,<br/>indirimleri kaçırma.
          </motion.h2>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
          >
            <Link to="/kayit" className="btn-primary text-lg md:text-xl px-8 py-4 md:px-12 md:py-6 inline-block w-full sm:w-auto">
                Hemen Kayıt Ol
             </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── BUSINESS CTA ─── */}
      <section className="py-24 px-4 bg-primary border-t-4 border-dark">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[2rem] p-6 sm:p-10 md:p-16 flex flex-col md:flex-row gap-8 md:gap-10 items-center justify-between border-4 border-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="max-w-lg w-full">
              <div className="inline-flex items-center gap-2 bg-dark text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Store size={16} />
                İşletme Sahipleri
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-dark leading-tight mb-4">
                Mekanınızı sisteme dahil edin, binlerce öğrenciye ulaşın.
              </h2>
              <p className="text-dark/80 font-medium leading-relaxed">
                Kampüs Pay ağına katılarak müşteri trafiğinizi artırın ve öğrencilerin ilk tercihi olun.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link to="/isletme-basvurusu" className="btn-primary text-base md:text-lg px-6 py-4 md:px-8 md:py-5 flex items-center justify-center gap-2 w-full">
                <Star size={20} />
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
