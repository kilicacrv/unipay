import React from 'react';
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
        {/* Background mesh */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4F46E5 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8B5CF6 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              Konya Bosna'da Aktif · 6+ Mekan
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Öğrenci ol,<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                kazanmaya başla.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
              Üni Pay ile anlaşmalı mekan kasasına QR kodunu okutarak anında indirim kazan. Uygulama yok, üyelik ücreti yok.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4">
              <Link to="/kayit" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4">
                <QrCode size={20} />
                Ücretsiz Başla
              </Link>
              <Link to="/mekanlar" className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200">
                Mekanları İncele
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.4)} className="mt-12 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-secondary" />
                <span>Ücretsiz Kayıt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown size={16} className="text-secondary" />
                <span>%10–%25 İndirim</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-secondary" />
                <span>Öğrenciye Özel</span>
              </div>
            </motion.div>
          </div>

          {/* Right — App mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: 'spring', bounce: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full scale-150" />

              {/* Phone */}
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-[36px] w-72 p-6 shadow-2xl">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-sm">Ü</span>
                    </div>
                    <span className="text-white font-bold text-sm">Üni Pay</span>
                  </div>
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>

                {/* Balance */}
                <div className="bg-white/10 rounded-2xl p-5 mb-4 border border-white/10">
                  <p className="text-slate-300 text-xs font-medium mb-1">Toplam Kazancın</p>
                  <p className="text-white font-black text-4xl tracking-tight">₺840</p>
                  <p className="text-secondary text-xs font-semibold mt-1">+₺120 bu ay</p>
                </div>

                {/* QR area */}
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
                  <QrCode size={80} className="text-dark" strokeWidth={1.5} />
                  <p className="text-slate-500 text-xs font-semibold text-center">Kasaya göster, indirimini al</p>
                </div>

                {/* Bottom indicator */}
                <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <section className="bg-primary py-4 marquee-container overflow-hidden">
        <div className="marquee-content font-extrabold text-lg text-white/80 tracking-widest uppercase">
          <span className="mx-8">☕ Kafeler</span>
          <span className="mx-8">🍔 Burger</span>
          <span className="mx-8">📚 Kırtasiye</span>
          <span className="mx-8">🎮 Oyun Salonu</span>
          <span className="mx-8">🍕 Restoran</span>
          <span className="mx-8">✂️ Berber</span>
          <span className="mx-8">☕ Kafeler</span>
          <span className="mx-8">🍔 Burger</span>
          <span className="mx-8">📚 Kırtasiye</span>
          <span className="mx-8">🎮 Oyun Salonu</span>
          <span className="mx-8">🍕 Restoran</span>
          <span className="mx-8">✂️ Berber</span>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-28 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-bold text-sm uppercase tracking-widest">Nasıl Çalışır?</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3 mb-4">Sadece 3 adım yeterli.</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Kayıt ol, doğrula, indirimini al. Sana zaman kaybettirmiyoruz.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone size={28} className="text-primary" />,
                step: '01',
                title: 'Kayıt Ol',
                desc: 'Telefon numaranı gir, öğrenci kartını yükle. 5 saniye sürer.',
                color: 'bg-indigo-50',
                delay: 0.1,
              },
              {
                icon: <QrCode size={28} className="text-secondary" />,
                step: '02',
                title: 'QR Kodunu Göster',
                desc: 'Anlaşmalı mekana gittiğinde kasaya QR kodunu göster.',
                color: 'bg-emerald-50',
                delay: 0.2,
              },
              {
                icon: <Zap size={28} className="text-accent" />,
                step: '03',
                title: 'İndirimini Al',
                desc: 'İndirim anında uygulanır. Ekstra bir şeye gerek yok.',
                color: 'bg-violet-50',
                delay: 0.3,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: item.delay }}
                className="card p-8 group"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  {item.icon}
                </div>
                <span className="text-xs font-black text-slate-300 tracking-widest uppercase">{item.step}</span>
                <h3 className="text-2xl font-black mt-2 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST / STATS SECTION ─── */}
      <section className="py-20 px-4 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '6+', label: 'Anlaşmalı Mekan' },
            { value: '%25', label: "Maks. İndirim" },
            { value: '0₺', label: 'Üyelik Ücreti' },
            { value: '<5sn', label: 'Kayıt Süresi' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-black text-gradient mb-2">{stat.value}</p>
              <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BUSINESS CTA ─── */}
      <section className="py-28 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="gradient-hero rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-10 items-center justify-between overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #8B5CF6 0%, transparent 60%)' }} />
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-secondary text-sm font-semibold px-3 py-1.5 rounded-full mb-6">
                <Store size={14} />
                İşletme Sahipleri İçin
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                Üni Pay ağına dahil ol,<br />müşteri tabanını genişlet.
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Üniversite öğrencilerini mekânına çek. Sıfır teknik altyapı, dakikalar içinde aktif. Komisyon almıyoruz.
              </p>
            </div>
            <div className="relative z-10 flex-shrink-0">
              <Link to="/isletme-basvurusu" className="flex items-center gap-2 bg-white text-dark font-bold px-8 py-4 rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all duration-200 whitespace-nowrap">
                <Star size={18} className="text-primary" />
                Başvuru Yap
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
