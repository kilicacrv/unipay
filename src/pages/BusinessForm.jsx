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
    icon: <Users size={20} className="text-white" />,
    title: 'Doğrudan Hedef Kitle',
    text: 'Öğrenci odaklı pazarlama ile on binlerce üniversiteliye anında ulaşın.',
  },
  {
    icon: <Zap size={20} className="text-white" />,
    title: 'Özgür Kampanyalar',
    text: 'Kendi kampanyanızı ve indirim oranınızı tamamen siz belirleyin.',
  },
  {
    icon: <BarChart2 size={20} className="text-white" />,
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

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm";

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-900/5 border border-white p-10 text-center max-w-md w-full relative z-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Tebrikler!</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            Başvurunuz başarıyla alındı. Ekibimiz <strong className="text-slate-900">24 saat</strong> içinde sizinle iletişime geçecek. Kampüs Pay'e hoş geldiniz!
          </p>
          <Link to="/" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]">
            Ana Sayfaya Dön
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-300/15 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 pt-24 md:pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div {...fadeUp(0)} className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm mb-4 uppercase tracking-widest">
              <Sparkles size={12} className="text-primary" />
              İşletmeler İçin
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              Öğrencilerle Büyümeye<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500"> Hazır Mısınız?</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl mx-auto">
              Kampüs Pay ekosistemine katılın, Bosna Hersek'teki binlerce öğrenciyi işletmenize çekin ve gelirinizi artırın.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            
            {/* Left — Benefits */}
            <motion.div {...fadeUp(0.1)} className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative glow in dark card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                
                <h3 className="text-2xl font-black mb-2 relative z-10">Neden Kampüs Pay?</h3>
                <p className="text-slate-400 text-sm mb-8 font-medium relative z-10">
                  Bölgenin en yenilikçi indirim ağına katılarak rekabette öne geçin.
                </p>
                
                <ul className="space-y-6 relative z-10">
                  {PERKS.map((p, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{p.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{p.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4 relative z-10">
                  <ShieldCheck size={32} className="text-primary" />
                  <div>
                    <div className="text-sm font-bold text-white">Güvenilir Partner</div>
                    <div className="text-xs text-slate-400">Ücretsiz kayıt ve hızlı onay süreci</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — Form */}
            <motion.div {...fadeUp(0.2)} className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-10">
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Başvuru Formu</h3>
                  <p className="text-sm text-slate-500 font-medium">Bilgilerinizi doldurun, ekibimiz en kısa sürede sizinle iletişime geçsin.</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-6 text-xs font-bold">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* İşletme Adı */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <Store size={18} />
                    </div>
                    <input
                      type="text"
                      name="business"
                      value={form.business}
                      onChange={handleChange}
                      placeholder="İşletmenizin Adı *"
                      className={inputBase}
                    />
                  </div>

                  {/* Yetkili Ad Soyad */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Yetkili Adı Soyadı *"
                      className={inputBase}
                    />
                  </div>

                  {/* Telefon Numarası */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center gap-1.5 pl-4 pr-3 border-r border-slate-200 shrink-0">
                      <Smartphone size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">+90</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="5XX XXX XX XX *"
                      className={`${inputBase} pl-3`}
                    />
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <Camera size={18} />
                    </div>
                    <input
                      type="text"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="Instagram Kullanıcı Adı (Opsiyonel)"
                      className={inputBase}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-base mt-2 flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Gönderiliyor...
                      </span>
                    ) : (
                      <>
                        Başvuruyu Tamamla
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400 font-medium leading-relaxed mt-2">
                    Bilgilerinizi gönderdikten sonra iş ortaklığı ekibimiz detayları görüşmek üzere <strong className="text-slate-600">24 saat içinde</strong> sizinle iletişime geçecektir.
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
