import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan, MapPin, Tag, History, ChevronRight, User, Loader2, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const getTier = (pts) => {
  if (pts >= 200) return { name: 'Altın', color: 'text-amber-500', bg: 'bg-amber-50', icon: '🥇' };
  if (pts >= 100) return { name: 'Gümüş', color: 'text-slate-300', bg: 'bg-slate-800', icon: '🥈' };
  return { name: 'Bronz', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🥉' };
};

const DiscountCard = ({ title, biz, rate, image }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:border-primary transition-all cursor-pointer group">
    <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-300 relative">
      <Tag size={32} />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-slate-900 border border-slate-100">
        AKTİF
      </div>
    </div>
    <div className="p-4 flex-1">
      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{biz}</p>
      <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-lg font-black text-slate-900">%{rate}</span>
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-dark transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState({ id: '...', name: 'Yükleniyor', university: 'Selçuk Üniversitesi' });
  const [points, setPoints] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchTopDiscounts();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setStudent({
        id: user.id.substring(0, 8).toUpperCase(),
        full_id: user.id,
        name: user.user_metadata?.full_name || 'Öğrenci',
        university: user.user_metadata?.university || 'Selçuk Üniversitesi'
      });

      const { data: pts } = await supabase
        .from('student_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();
      
      if (pts) setPoints(pts.total_points);
    }
  };

  const fetchTopDiscounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discounts')
      .select('*, venues(name)')
      .eq('is_active', true)
      .limit(4);
    
    if (!error) setDiscounts(data);
    setLoading(false);
  };

  const tier = getTier(points);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-30 flex justify-between items-center backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <User size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Merhaba, {student.name.split(' ')[0]} 👋</h1>
            <p className="text-[10px] text-slate-500 font-medium">{student.university}</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <History size={20} />
        </button>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        {/* QR Card Section */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-10 border border-white/5">
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-5 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-6">
              <QRCodeSVG 
                value={`unipay_student_${student.full_id}`} 
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <h2 className="text-xl font-bold mb-1 text-primary tracking-tight">Kampüs Pay ID</h2>
            <p className="text-slate-400 text-xs font-medium opacity-80 tracking-widest uppercase mb-6">{student.id}</p>
            
            {/* Loyalty Badge */}
            <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-all" onClick={() => navigate('/dashboard/profile')}>
              <div className="flex items-center justify-center text-xl">{tier.icon}</div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Sadakat Puanı</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white leading-none">{points}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>{tier.name} Öğrenci</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/30 ml-2" />
            </div>
            
            <div className="w-full h-px bg-white/10 my-6" />
            
            <button 
              onClick={() => navigate('/dashboard/scan')}
              className="w-full bg-primary text-dark py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_8px_20px_-4px_rgba(255,214,0,0.3)] active:scale-95"
            >
              <Scan size={20} /> İndirim Uygula (QR Oku)
            </button>
            <p className="mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">Mekan kodunu okutarak indirimini al</p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-24 -mb-24" />
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar px-1">
          {['Tümü', 'Cafe', 'Restoran', 'Eğlence', 'Giyim'].map((cat, i) => (
            <button key={cat} className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${i === 0 ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Discounts Section */}
        <div className="mb-6 flex justify-between items-end px-1">
          <h2 className="text-lg font-bold text-slate-900 leading-none">Popüler İndirimler</h2>
          <button onClick={() => navigate('/mekanlar')} className="text-xs font-bold text-primary hover:underline">Tümünü Gör</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-10 flex flex-col items-center opacity-20">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Fırsatlar Yükleniyor</p>
            </div>
          ) : discounts.length > 0 ? (
            discounts.map(discount => (
              <DiscountCard 
                key={discount.id}
                title={discount.title} 
                biz={discount.venues?.name} 
                rate={discount.rate} 
              />
            ))
          ) : (
            <div className="col-span-2 py-10 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Henüz aktif fırsat yok.</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-5 flex justify-between items-center z-40 max-w-lg mx-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1.5 text-slate-900 cursor-pointer">
          <Tag size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Fırsatlar</span>
        </div>
        <div onClick={() => navigate('/dashboard/favorites')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
          <Heart size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Favoriler</span>
        </div>
        <div onClick={() => navigate('/dashboard/explore')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
          <MapPin size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Harita</span>
        </div>
        <div onClick={() => navigate('/dashboard/profile')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Profil</span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
