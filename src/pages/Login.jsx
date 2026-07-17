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

      // Admin değilse onay kontrolü yap
      if (!adminEmails.includes(email) && role === 'student') {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('status')
          .eq('auth_id', user.id)
          .single();

        if (appError || !appData || appData.status !== 'onaylandi') {
          await supabase.auth.signOut();
          setError('Hesabınız henüz onaylanmamış. Onaylandığında e-posta alacaksınız.');
          setLoading(false);
          return;
        }
      }

      // Başarılı giriş yönlendirmesi
      if (adminEmails.includes(email)) {
        navigate('/admin');
      } else {
        if (role === 'admin') navigate('/admin');
        else if (role === 'business') navigate('/business');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError('Giriş başarısız: ' + err.message);
    } finally {
      setLoading(false);
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
