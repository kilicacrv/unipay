import React, { useState } from 'react';
import { Store, CheckCircle, AlertCircle, TrendingUp, Users, Zap, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PERKS = [
  {
    icon: <Users size={20} className="text-indigo-400" />,
    text: 'Öğrenci odaklı pazarlama ile doğrudan hedef kitleye ulaşın.',
  },
  {
    icon: <Zap size={20} className="text-emerald-400" />,
    text: 'Kurulum ücreti yok, gizli maliyet yok, komisyon alınmıyor.',
  },
  {
    icon: <TrendingUp size={20} className="text-violet-400" />,
    text: 'Kendi kampanyanızı ve indirim oranınızı siz belirleyin.',
  },
  {
    icon: <BarChart2 size={20} className="text-amber-400" />,
    text: 'İşletme panelinizden anlık ziyaret ve indirim istatistikleri.',
  },
];

const BusinessForm = () => {
  const [form, setForm] = useState({ business: '', name: '', phone: '', instagram: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.business || !form.name || !form.phone) {
      setError('İşletme adı, yetkili adı ve telefon alanları zorunludur.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-14 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-3">Başvurunuz Alındı!</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            Ekibimiz <strong>24 saat</strong> içinde sizinle iletişime geçecek. Üni Pay'e hoş geldiniz!
          </p>
          <a href="/" className="btn-primary flex items-center justify-center gap-2">
            Ana Sayfaya Dön
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
            <Store size={26} className="text-white" />
          </div>
          <span className="text-primary font-bold text-sm uppercase tracking-widest">İşletme Sahipleri</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3 mb-4">İşletme Başvurusu</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Üni Pay ekosistemine katılın, Bosna Hersek'teki binlerce öğrenciyi işletmenize çekin.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 gradient-hero rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-black mb-2">Neden Üni Pay?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Öğrencilerle büyüyen, esnafa sıfır yük getiren bir sistem.
            </p>
            <ul className="space-y-6">
              {PERKS.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {p.icon}
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed">{p.text}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">Zaten ağımızda</p>
              <div className="flex flex-wrap gap-2">
                {['Gonzo Coffee', 'Burger Station', 'Level Up', 'Dose Cafe'].map((n) => (
                  <span key={n} className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
          >
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">İşletme Adı *</label>
                <input
                  type="text"
                  name="business"
                  value={form.business}
                  onChange={handleChange}
                  placeholder="Örn: Gonzo Coffee"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Yetkili Ad Soyad *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Adınız ve Soyadınız"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefon Numarası *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Instagram Adresi <span className="text-slate-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="@isletmeadi"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-4 text-base justify-center flex items-center gap-2 mt-2"
              >
                <CheckCircle size={18} />
                Başvuruyu Gönder
              </button>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                Başvurunuz incelendikten sonra 24 saat içinde sizinle iletişime geçilecektir.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;
