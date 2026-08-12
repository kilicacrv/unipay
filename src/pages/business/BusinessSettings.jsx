import React, { useState } from 'react';
import { Lock, Bell, Shield, LogOut, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut, supabase } from '../../lib/supabase';

const SettingRow = ({ icon, title, desc, action, danger }) => (
  <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${danger ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-sm font-bold ${danger ? 'text-rose-600' : 'text-slate-900'}`}>{title}</h3>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    {action || <ChevronRight size={18} className="text-slate-300" />}
  </div>
);

const BusinessSettings = () => {
  const navigate = useNavigate();
  const [notif, setNotif] = useState(true);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      alert("Şifre değiştirilemedi: " + error.message);
    } else {
      alert("Şifreniz başarıyla güncellendi.");
      setShowPasswordModal(false);
      setNewPassword('');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hesap Ayarları</h1>
        <p className="text-slate-500 font-medium">Hesap güvenliği ve uygulama tercihlerinizi yönetin.</p>
      </div>

      <div className="space-y-8">
        {/* Security Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Güvenlik & Gizlilik</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <button onClick={() => setShowPasswordModal(true)} className="w-full text-left">
              <SettingRow 
                icon={<Lock size={20} />} 
                title="Şifre Değiştir" 
                desc="Hesap güvenliğiniz için düzenli olarak güncelleyin."
              />
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bildirim Tercihleri</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <SettingRow 
              icon={<Bell size={20} />} 
              title="E-posta Bildirimleri" 
              desc="Yeni indirim kullanımlarında bilgilendirme alın."
              action={
                <div 
                  onClick={() => setNotif(!notif)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notif ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notif ? 'left-7' : 'left-1'}`} />
                </div>
              }
            />
          </div>
        </div>

        {/* Account Status / Danger Zone */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hesap Yönetimi</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <button onClick={handleLogout} className="w-full text-left">
              <SettingRow 
                icon={<LogOut size={20} />} 
                title="Oturumu Kapat" 
                desc="Tüm cihazlardan çıkış yapın."
                danger
              />
            </button>
          </div>
        </div>

        <div className="text-center pb-8">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Üni Pay v1.0.4 — © 2026</p>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Şifre Değiştir</h3>
            <p className="text-sm text-slate-500 mb-6">Yeni şifrenizi belirleyin.</p>
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                {loading ? 'Güncelleniyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSettings;
