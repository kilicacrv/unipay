import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, User, GraduationCap, AlertCircle, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const InputWrapper = ({ icon, children }) => (
  <div className="flex items-center bg-white border border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
    <div className="flex items-center pl-4 pr-3 shrink-0 text-dark/50">
      {icon}
    </div>
    {children}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', university: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.university) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }
    // Bir sonraki adımda kullanmak için kaydet
    sessionStorage.setItem('kampuspay.comlicant', JSON.stringify(formData));
    navigate('/dogrulama');
  };

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-dark/50 bg-transparent text-sm";

  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Kampüs Pay Logo" className="h-16 mx-auto mb-4 w-auto drop-shadow-md" />
          <h1 className="text-3xl font-black tracking-tight mb-2">Hesap Oluştur</h1>
          <p className="text-dark/70 text-sm">Ücretsiz kayıt ol, indirimleri kullanmaya başla.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-dark p-8">


          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">Ad Soyad</label>
              <InputWrapper icon={<User size={16} />}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Adınız ve Soyadınız" className={inputBase} />
              </InputWrapper>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">Telefon Numarası</label>
              <div className="flex items-center bg-white border border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
                <div className="flex items-center gap-2 pl-4 pr-3 border-r border-dark shrink-0">
                  <Smartphone size={16} className="text-dark/50" />
                  <span className="text-sm font-semibold text-dark/70">+90</span>
                </div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="5XX XXX XX XX" className={`${inputBase} pl-3`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">E-posta Adresi</label>
              <InputWrapper icon={<Mail size={16} />}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ogrenci@gmail.com" className={inputBase} />
              </InputWrapper>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">Şifre</label>
              <InputWrapper icon={<Lock size={16} />}>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputBase} />
              </InputWrapper>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">Üniversite</label>
              <InputWrapper icon={<GraduationCap size={16} />}>
                <select name="university" value={formData.university} onChange={handleChange} className={`${inputBase} appearance-none cursor-pointer`}>
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

          <p className="text-center text-xs text-dark/50 mt-5 leading-relaxed">
            Devam ederek{' '}
            <Link to="/gizlilik" className="underline hover:text-primary transition-colors">Gizlilik Politikasını</Link> ve{' '}
            <Link to="/kullanim-kosullari" className="underline hover:text-primary transition-colors">Kullanım Koşullarını</Link> kabul etmiş olursunuz.
          </p>
        </div>

        <p className="text-center text-sm text-dark/70 mt-6">
          Zaten hesabın var mı? <Link to="/login" className="text-primary font-semibold hover:underline">Giriş Yap</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
