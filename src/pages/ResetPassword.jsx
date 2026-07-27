import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase will automatically parse the access_token from the URL hash
    // and set the session. We just need to wait for the user to submit a new password.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar şifre sıfırlama talebinde bulunun.');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Şifre güncellenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-black tracking-tight mb-2">Yeni Şifre Belirle</h1>
          <p className="text-dark/70 text-sm">Lütfen hesabınız için yeni bir şifre girin.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-dark p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Şifreniz Güncellendi!</h3>
              <p className="text-slate-500 text-sm mb-6">Giriş sayfasına yönlendiriliyorsunuz...</p>
              <button onClick={() => navigate('/login')} className="text-primary font-semibold text-sm hover:underline">
                Hemen Giriş Yap
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-dark/80 mb-1.5">Yeni Şifre</label>
                <div className="flex items-center bg-white border border-dark rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
                  <div className="flex items-center pl-4 pr-3 shrink-0 text-dark/50">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="En az 6 karakter" 
                    className="flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-dark/50 bg-transparent text-sm" 
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !!error.includes('Geçersiz')}
                className="btn-primary w-full py-4 text-sm mt-2 justify-center flex items-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
