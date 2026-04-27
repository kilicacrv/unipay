import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, User, GraduationCap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const InputWrapper = ({ icon, children }) => (
  <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
      {icon}
    </div>
    {children}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', university: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.university) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }
    navigate('/dogrulama');
  };

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-slate-400 bg-transparent text-sm";

  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-2xl">Ü</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Hesap Oluştur</h1>
          <p className="text-slate-500 text-sm">Ücretsiz kayıt ol, indirimleri kullanmaya başla.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => navigate('/dogrulama')}
            className="w-full mb-6 flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3.5 font-semibold text-dark hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Google ile Devam Et
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">veya</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ad Soyad</label>
              <InputWrapper icon={<User size={16} />}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınız ve Soyadınız"
                  className={inputBase}
                />
              </InputWrapper>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefon Numarası</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
                <div className="flex items-center gap-2 pl-4 pr-3 border-r border-slate-200 shrink-0">
                  <Smartphone size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-500">+90</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="5XX XXX XX XX"
                  className={`${inputBase} pl-3`}
                />
              </div>
            </div>

            {/* Üniversite */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Üniversite</label>
              <InputWrapper icon={<GraduationCap size={16} />}>
                <select
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className={`${inputBase} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>Üniversite Seçin</option>
                  <option value="selcuk">Selçuk Üniversitesi</option>
                  <option value="necmettin">Necmettin Erbakan Üniversitesi</option>
                  <option value="ktn">KTO Karatay Üniversitesi</option>
                  <option value="other">Diğer</option>
                </select>
                <div className="pr-4 shrink-0 pointer-events-none">
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-t-[6px] border-t-slate-400 border-r-[5px] border-r-transparent" />
                </div>
              </InputWrapper>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-sm mt-2 justify-center flex items-center">
              Devam Et →
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
            Devam ederek{' '}
            <span className="underline cursor-pointer">Gizlilik Politikasını</span> ve{' '}
            <span className="underline cursor-pointer">Kullanım Koşullarını</span> kabul etmiş olursunuz.
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Zaten hesabın var mı?{' '}
          <Link to="/kayit" className="text-primary font-semibold hover:underline">Giriş Yap</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
