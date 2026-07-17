import React, { useState } from 'react';
import { Store, MapPin, Smartphone, AtSign, User, Save, Globe } from 'lucide-react';

const BusinessProfile = () => {
  const [loading, setLoading] = useState(false);
  // Mock data
  const [profile, setProfile] = useState({
    business_name: 'Örnek İşletme',
    branch: 'Bosna Şubesi',
    contact_name: 'Ahmet Yılmaz',
    phone: '5XX XXX XX XX',
    instagram: 'ornekkahve',
    website: 'www.ornekkahve.com',
    description: 'Konya Bosna Hersek mahallesinde en taze kahveler ve öğrenci dostu fiyatlarla hizmetinizdeyiz.'
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İşletme Profili</h1>
          <p className="text-slate-500 font-medium">Öğrencilerin göreceği bilgileri güncelleyin.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {loading ? <Save size={18} className="animate-pulse" /> : <Save size={18} />}
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image/Logo */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <Store size={48} />
            </div>
            <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Logoyu Değiştir</button>
            <p className="text-[10px] text-slate-400 mt-4 font-medium leading-relaxed">Minimum 512x512px boyutunda kare bir görsel önerilir.</p>
          </div>
        </div>

        {/* Right Column: Info Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İşletme Adı</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.business_name}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none transition-all"
                    readOnly
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şube</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.branch}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Yetkili Adı</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={profile.contact_name}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.phone}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instagram</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={profile.instagram}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İşletme Açıklaması</label>
              <textarea 
                rows={4}
                className="w-full p-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 outline-none transition-all resize-none leading-relaxed"
                value={profile.description}
                onChange={(e) => setProfile({...profile, description: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
