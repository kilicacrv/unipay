import React, { useState } from 'react';
import { Store, CheckCircle, AlertCircle, Users, BarChart2, User, Smartphone, Camera, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const PERKS = [
  {
    icon: <Users size={18} className="text-white" />,
    title: 'Doğrudan Hedef Kitle',
    text: 'Öğrenci odaklı pazarlama ile on binlerce üniversiteliye anında ulaşın.',
  },
  {
    icon: <Zap size={18} className="text-white" />,
    title: 'Özgür Kampanyalar',
    text: 'Kendi kampanyanızı ve indirim oranınızı tamamen siz belirleyin.',
  },
  {
    icon: <BarChart2 size={18} className="text-white" />,
    title: 'Anlık İstatistikler',
    text: 'Gelişmiş işletme panelinizden ziyaret ve kullanım verilerini takip edin.',
  },
];

const BusinessForm = () => {
  const [form, setForm] = useState({ business: '', name: '', phone: '', instagram: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business || !form.name || !form.phone) {
      setError('İşletme adı, yetkili adı ve telefon alanları zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('business_applications').insert([{
        business_name: form.business,
        contact_name: form.name,
        phone: form.phone,
        instagram: form.instagram || null,
        status: 'bekliyor'
      }]);
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err) {
      setError('Bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success Screen ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center w-full max-w-sm"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Tebrikler!</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-7">
            Başvurunuz alındı. Ekibimiz{' '}
            <strong className="text-slate-800">24 saat</strong> içinde sizinle iletişime geçecek.
          </p>
          <Link
            to="/"
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Ana Sayfaya Dön
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ─── Main Page ─── */
  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto lg:max-w-5xl">

          {/* ── Header ── */}
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm mb-4 uppercase tracking-widest">
              <Sparkles size={11} className="text-primary" />
              İşletmeler İçin
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 leading-tight">
              Öğrencilerle Büyümeye
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                Hazır Mısınız?
              </span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto">
              Kampüs Pay ekosistemine katılın, binlerce öğrenciyi işletmenize çekin.
            </p>
          </motion.div>

          {/* ── Two-column on desktop, single column on mobile ── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

            {/* Left — Benefits (hidden on mobile, shown on desktop) */}
            <motion.div {...fadeUp(0.1)} className="hidden lg:block lg:w-2/5 shrink-0">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <h3 className="text-xl font-black mb-1 relative z-10">Neden Kampüs Pay?</h3>
                <p className="text-slate-400 text-xs mb-6 font-medium relative z-10">
                  Bölgenin en yenilikçi indirim ağına katılarak rekabette öne geçin.
                </p>
                <ul className="space-y-5 relative z-10">
                  {PERKS.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-0.5">{p.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{p.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 relative z-10">
                  <ShieldCheck size={24} className="text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">Güvenilir Partner</div>
                    <div className="text-xs text-slate-400">Ücretsiz kayıt ve hızlı onay süreci</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — Form */}
            <motion.div {...fadeUp(0.15)} className="w-full lg:flex-1">

              {/* Mobile benefits strip */}
              <div className="flex lg:hidden gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
                {PERKS.map((p, i) => (
                  <div key={i} className="flex-shrink-0 flex items-start gap-2 bg-white/80 border border-slate-200/60 rounded-2xl p-3 w-48">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                      {React.cloneElement(p.icon, { size: 14 })}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-800 leading-tight">{p.title}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{p.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-5 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1">Başvuru Formu</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Bilgilerinizi doldurun, ekibimiz en kısa sürede iletişime geçsin.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-xs font-bold"
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                  {/* İşletme Adı */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <Store size={16} />
                    </div>
                    <input
                      type="text"
                      name="business"
                      value={form.business}
                      onChange={handleChange}
                      placeholder="İşletmenizin Adı *"
                      className="flex-1 min-w-0 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm"
                    />
                  </div>

                  {/* Yetkili Ad Soyad */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Yetkili Adı Soyadı *"
                      className="flex-1 min-w-0 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm"
                    />
                  </div>

                  {/* Telefon */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center gap-1.5 pl-4 pr-3 border-r border-slate-200 shrink-0">
                      <Smartphone size={15} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">+90</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="5XX XXX XX XX *"
                      className="flex-1 min-w-0 py-3.5 pl-3 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <Camera size={16} />
                    </div>
                    <input
                      type="text"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="Instagram Kullanıcı Adı (Opsiyonel)"
                      className="flex-1 min-w-0 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm mt-1 flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Gönderiliyor...
                      </span>
                    ) : (
                      <>
                        Başvuruyu Tamamla
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400 font-medium leading-relaxed">
                    Ekibimiz{' '}
                    <strong className="text-slate-600">24 saat içinde</strong>{' '}
                    sizinle iletişime geçecektir.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BusinessForm;
