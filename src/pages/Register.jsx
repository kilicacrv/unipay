import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, User, GraduationCap, AlertCircle, Mail, Lock, Zap, ArrowRight, BadgePercent, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', university: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-orange-200/15 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 pt-24 md:pt-28 pb-12 px-4 flex flex-col items-center">
        
        {/* Hero Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-6 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm mb-4 uppercase tracking-widest">
            <Zap size={12} className="text-primary" />
            30 saniyede kayıt
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
            İndirimlerin Dünyasına<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Hoş Geldin!</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Ücretsiz hesabını oluştur, Konya Bosna'daki öğrenci indirimlerinden hemen faydalan.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div {...fadeUp(0.1)} className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/80 p-6 md:p-8">

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-xs font-bold"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {/* Google Button */}
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile Hızlı Kayıt
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">veya</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              
              {/* Ad Soyad */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                  <User size={16} />
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ad Soyad" className={inputBase} />
              </div>

              {/* Telefon */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center gap-1.5 pl-4 pr-3 border-r border-slate-200 shrink-0">
                  <Smartphone size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">+90</span>
                </div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="5XX XXX XX XX" className={`${inputBase} pl-3`} />
              </div>

              {/* E-posta */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                  <Mail size={16} />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-posta adresi" className={inputBase} />
              </div>

              {/* Şifre */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                  <Lock size={16} />
                </div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Şifre (min 6 karakter)" className={inputBase} />
              </div>

              {/* Üniversite */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                  <GraduationCap size={16} />
                </div>
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
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm mt-1 flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Hesap Oluşturuluyor...
                  </span>
                ) : (
                  <>
                    Hesabımı Oluştur
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
              Devam ederek{' '}
              <Link to="/gizlilik" className="underline hover:text-primary transition-colors">Gizlilik Politikasını</Link> ve{' '}
              <Link to="/kullanim-kosullari" className="underline hover:text-primary transition-colors">Kullanım Koşullarını</Link> kabul edersiniz.
            </p>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div {...fadeUp(0.2)} className="mt-6 w-full max-w-md">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-slate-100 text-center">
              <BadgePercent size={18} className="text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">Öğrenciye Özel<br />İndirimler</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-slate-100 text-center">
              <ShieldCheck size={18} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">%100 Güvenli<br />Kayıt</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-slate-100 text-center">
              <Star size={18} className="text-purple-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">Puan Kazan<br />Biriktir</p>
            </div>
          </div>
        </motion.div>

        {/* Login Link */}
        <motion.p {...fadeUp(0.3)} className="text-center text-sm text-slate-500 mt-6">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-slate-900 font-bold hover:text-primary transition-colors">
            Giriş Yap →
          </Link>
        </motion.p>

      </div>
    </div>
  );
};

export default Register;
