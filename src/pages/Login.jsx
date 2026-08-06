import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      const user = data.user;
      const role = user?.user_metadata?.role || 'student';
      const adminEmails = ['alperenklc55@gmail.com'];

      // Başarılı giriş yönlendirmesi
      if (adminEmails.includes(email)) {
        navigate('/admin');
      } else {
        if (role === 'admin') navigate('/admin');
        else if (role === 'business') navigate('/business');
        else navigate('/dashboard');
      }
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-posta adresi veya şifre hatalı.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('E-posta adresiniz henüz onaylanmamış. Lütfen gelen kutunuzu kontrol edin.');
      } else {
        setError('Giriş başarısız: Lütfen bilgilerinizi kontrol edip tekrar deneyin. (' + err.message + ')');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    setError('');
    setResetMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setResetMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. (Spam/Gereksiz kutusunu kontrol etmeyi unutmayın)');
    } catch (err) {
      setError('İşlem başarısız: ' + err.message);
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
      setError('Google ile giriş başarısız: ' + err.message);
    }
  };

  const inputBase = "flex-1 py-3.5 pr-4 font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent text-sm";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-orange-200/15 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 pt-24 md:pt-28 pb-12 px-4 flex flex-col items-center">

        {/* Hero Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-6 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm mb-4 uppercase tracking-widest">
            <Zap size={12} className="text-primary" />
            Tekrar hoş geldin
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
            {isResetMode ? (
              <>Şifreni<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Sıfırla</span></>
            ) : (
              <>Hesabına<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Giriş Yap</span></>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isResetMode
              ? 'E-posta adresini gir, sıfırlama bağlantısını gönderelim.'
              : 'İndirimlerini ve puanlarını kaçırma, hemen giriş yap.'}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div {...fadeUp(0.1)} className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/80 p-6 md:p-8">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-xs font-bold"
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Reset Success */}
            {resetMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 mb-5 text-xs font-bold leading-relaxed"
              >
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                {resetMessage}
              </motion.div>
            )}

            {/* Google Login - only in login mode */}
            {!isResetMode && (
              <>
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
                  Google ile Giriş Yap
                </button>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">veya</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="flex flex-col gap-3.5">

              {/* E-posta */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresi"
                  className={inputBase}
                  required
                />
              </div>

              {/* Şifre - only in login mode */}
              {!isResetMode && (
                <div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 focus-within:bg-white transition-all">
                    <div className="flex items-center pl-4 pr-3 shrink-0 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifre"
                      className={inputBase}
                      required
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => { setIsResetMode(true); setError(''); setResetMessage(''); }}
                      className="text-[11px] font-bold text-slate-400 hover:text-primary transition-colors"
                    >
                      Şifremi Unuttum
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm mt-1 flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    İşlem Yapılıyor...
                  </span>
                ) : (
                  <>
                    {isResetMode ? 'Sıfırlama Linki Gönder' : 'Giriş Yap'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Back to login from reset mode */}
              {isResetMode && (
                <button
                  type="button"
                  onClick={() => { setIsResetMode(false); setError(''); setResetMessage(''); }}
                  className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors text-center mt-1"
                >
                  ← Giriş Ekranına Dön
                </button>
              )}
            </form>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div {...fadeUp(0.2)} className="mt-6 w-full max-w-md">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-3">
              Henüz hesabın yok mu?
            </p>
            <Link
              to="/kayit"
              className="inline-flex items-center justify-center gap-2 bg-primary text-slate-900 font-black text-sm px-6 py-3 rounded-2xl w-full hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
            >
              <Zap size={16} className="group-hover:rotate-12 transition-transform" />
              Ücretsiz Kayıt Ol
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
