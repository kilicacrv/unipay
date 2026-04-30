import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Zap, Store, Star, TrendingDown, ShieldCheck, Users } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
});



const Home = () => {
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
            Konya Bosna'nın en popüler mekanlarında sadece öğrencilere özel dev indirim ağı. İlk katılanlardan olmak için ön kaydını hemen yap!
          </motion.p>

          <motion.div {...fadeUp(0.3)}>
            <Link to="/kayit" className="btn-primary text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 inline-flex items-center justify-center gap-3 w-full sm:w-auto">
              <Zap size={24} />
              Ön Kayıt Ol
            </Link>
            <p className="mt-4 text-sm font-bold text-dark/70">Ücretsizdir. Kredi kartı gerekmez.</p>
          </motion.div>


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
            <span className="text-secondary font-black text-lg uppercase tracking-widest bg-secondary/10 px-4 py-2 rounded-full border-2 border-secondary">ÇOK YAKINDA</span>
            <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight mt-8 mb-6">
              Bosna'nın Sırrı Çözülüyor...
            </h2>
            <p className="text-dark/80 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              En sevdiğin kafeler, en çok gittiğin mekanlar... Hepsi tek bir ağda birleşiyor. Yakında Bosna Hersek Mahallesi'nde yer yerinden oynayacak. Hazır mısın?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[2rem] overflow-hidden border-4 border-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.47458694038!2d32.50290121532454!3d38.01890307971597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d08f43c3d31b0b%3A0xc392ceceb9d88!2sBosna%20Hersek%2C%20Sel%C3%A7uklu%2FKonya!5e0!3m2!1str!2str!4v1690000000000!5m2!1str!2str" 
              width="100%" 
              className="h-[300px] md:h-[450px]"
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Bosna Hersek Mahallesi Haritası"
            ></iframe>
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
            Kontenjan dolmadan<br/>yerini ayırt.
          </motion.h2>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
          >
            <Link to="/kayit" className="btn-primary text-lg md:text-xl px-8 py-4 md:px-12 md:py-6 inline-block w-full sm:w-auto">
                Hemen Ön Kayıt Ol
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
