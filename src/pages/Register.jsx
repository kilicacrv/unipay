import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, User, GraduationCap, AlertCircle, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

  const handleSubmit = async (e) => {
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
    setLoading(true);
    try {
      // 1. Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'student',
            full_name: formData.name,
            university: formData.university
          }
        }
      });

      if (authError) throw authError;

      // 2. Eksik durumunda bir applications kaydı oluştur
      const { error: dbError } = await supabase.from('applications').insert([{
        auth_id: authData.user?.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        university: formData.university,
        status: 'eksik' // Kart yüklenmedi
      }]);

      if (dbError) throw dbError;

      navigate('/dogrulama');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (err) {
      setError('Google ile kayıt başarısız: ' + err.message);
    }
  };

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-dark/50 bg-transparent text-sm";

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-4 flex flex-col items-center">
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

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Kayıt Ol
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest text-center">veya E-Posta ile</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

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
