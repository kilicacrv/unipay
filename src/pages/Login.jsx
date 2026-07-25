import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          <h1 className="text-3xl font-black tracking-tight mb-2">Giriş Yap</h1>
          <p className="text-dark/70 text-sm">Hesabına eriş ve avantajları keşfet.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-dark p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">E-posta Adresi</label>
              <div className="flex items-center bg-white border border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-dark/50">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="ogrenci@gmail.com" 
                  className="flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-dark/50 bg-transparent text-sm" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/80 mb-1.5">Şifre</label>
              <div className="flex items-center bg-white border border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
                <div className="flex items-center pl-4 pr-3 shrink-0 text-dark/50">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-dark/50 bg-transparent text-sm" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-sm mt-2 justify-center flex items-center gap-2"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : null}
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap →'}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">VEYA</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile Devam Et
            </button>
          </form>

          <p className="text-center text-sm text-dark/70 mt-6">
            Henüz hesabın yok mu? <Link to="/kayit" className="text-primary font-semibold hover:underline">Kayıt Ol</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
