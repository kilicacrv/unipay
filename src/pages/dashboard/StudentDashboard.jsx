import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan, MapPin, Tag, History, ChevronRight, User, Loader2, Heart, Zap, Clock, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const getTier = (pts) => {
  if (pts >= 200) return { name: 'Altın', color: 'text-amber-500', bg: 'bg-amber-50', icon: '🥇' };
  if (pts >= 100) return { name: 'Gümüş', color: 'text-slate-300', bg: 'bg-slate-800', icon: '🥈' };
  return { name: 'Bronz', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🥉' };
};

const DiscountCard = ({ title, biz, rate, image }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm cursor-pointer hover:border-primary transition-all relative group">
    <div className="w-full aspect-square bg-slate-100 relative">
      <img src={image || 'https://via.placeholder.com/400x400?text=Fırsat'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={title} />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-black text-slate-900 border border-slate-100 uppercase tracking-widest shadow-sm z-10">
        AKTİF
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary text-dark px-2 py-1 rounded-lg z-10 shadow-sm">
        <span className="text-[12px] font-black">%{rate} İNDİRİM</span>
      </div>
    </div>
    
    <div className="p-3 flex-1 flex flex-col">
      <h3 className="font-black text-slate-900 text-sm tracking-tight mb-0.5 line-clamp-1">{biz}</h3>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1 mb-2">{title}</p>
      
      <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Kodu Al</span>
        <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-dark transition-colors">
          <ChevronRight size={14} />
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
  const [flashCampaigns, setFlashCampaigns] = useState([]);
  const [adminNotification, setAdminNotification] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchTopDiscounts();
    fetchFlashCampaigns();
    fetchAdminNotification();

    const channel = supabase
      .channel('flash_campaigns_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flash_campaigns' }, () => {
        fetchFlashCampaigns();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
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

  const fetchFlashCampaigns = async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('flash_campaigns')
      .select('*, venues(name)')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
    
    if (data) setFlashCampaigns(data);
  };

  const fetchAdminNotification = async () => {
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) setAdminNotification(data);
  };

  const tier = getTier(points);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header - App Style */}
      <header className="bg-slate-900 px-6 py-5 sticky top-0 z-50 flex justify-between items-center rounded-b-[2rem] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-0.5">Hoş Geldin</p>
            <h1 className="text-sm font-bold text-white leading-none">{student.name}</h1>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard/history')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
          <History size={18} />
        </button>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6 mt-2">
        {/* iOS Style Push Notification */}
        {adminNotification && (
          <div 
            onClick={() => adminNotification.link_url ? navigate(adminNotification.link_url) : null}
            className={`p-4 rounded-[1.5rem] shadow-xl flex gap-3 items-center backdrop-blur-xl animate-in slide-in-from-top-4 duration-500 cursor-pointer ${
              adminNotification.type === 'success' ? 'bg-emerald-500/90 text-white' :
              adminNotification.type === 'warning' ? 'bg-amber-500/90 text-white' :
              'bg-blue-600/90 text-white'
            } ${adminNotification.link_url ? 'hover:scale-[1.02] active:scale-95 transition-transform' : ''}`}
          >
            <div className={`shrink-0 p-2.5 rounded-2xl bg-white/20 backdrop-blur-md`}>
              {adminNotification.type === 'success' && <CheckCircle size={20} />}
              {adminNotification.type === 'warning' && <AlertTriangle size={20} />}
              {adminNotification.type === 'info' && <Bell size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm tracking-tight mb-0.5">{adminNotification.title}</h3>
              <p className="text-[11px] font-medium leading-tight opacity-90 line-clamp-2">{adminNotification.message}</p>
            </div>
            {adminNotification.link_url && (
              <div className="shrink-0 text-white/50 pl-2 border-l border-white/20">
                <ChevronRight size={20} />
              </div>
            )}
          </div>
        )}

        {/* Flash Campaigns Banner */}
        {flashCampaigns.length > 0 && (
          <div className="space-y-4">
            {flashCampaigns.map(campaign => {
              const expires = new Date(campaign.expires_at);
              const timeString = expires.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={campaign.id} onClick={() => navigate(`/mekan/${campaign.venue_id}`)} className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-[2rem] p-5 text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={12} className="fill-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Flaş İndirim</span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight leading-tight mb-0.5">{campaign.title}</h3>
                      <p className="text-xs font-medium text-white/90">{campaign.venues?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black tracking-tighter leading-none mb-1">%{campaign.rate}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                        <Clock size={10} /> Bitiş: {timeString}
                      </p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}

        {/* QR Wallet Card */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-4 rounded-[1.5rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-4">
              <QRCodeSVG 
                value={`unipay_student_${student.full_id}`} 
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <h2 className="text-lg font-bold mb-0.5 text-primary tracking-tight">Kampüs Pay ID</h2>
            <p className="text-slate-400 text-[10px] font-medium opacity-80 tracking-widest uppercase mb-4">{student.id}</p>
            
            {/* Loyalty Badge */}
            <div className="flex items-center w-full bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/dashboard/profile')}>
              <div className="flex items-center justify-center text-xl mr-3">{tier.icon}</div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Sadakat Puanı</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-white leading-none">{points}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${tier.color}`}>{tier.name}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            
            <button 
              onClick={() => navigate('/dashboard/scan')}
              className="w-full mt-4 bg-primary text-dark py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_8px_20px_-4px_rgba(255,214,0,0.3)] active:scale-95"
            >
              <Scan size={18} /> QR Okut
            </button>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        </div>

        {/* Categories (Pills) */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 snap-x">
          {['Tümü', 'Cafe', 'Restoran', 'Eğlence', 'Giyim'].map((cat, i) => (
            <button key={cat} className={`snap-center shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Popular Discounts */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-base font-bold text-slate-900 leading-none">Popüler Mekanlar</h2>
            <button onClick={() => navigate('/mekanlar')} className="text-[10px] font-black uppercase tracking-widest text-primary">Tümünü Gör</button>
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
        </div>
      </main>

      {/* Floating Bottom Nav - App Style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-100 p-2 flex justify-between items-center z-40 rounded-[2rem] shadow-2xl">
        <div onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center w-14 h-12 rounded-2xl bg-slate-900 text-white cursor-pointer transition-transform active:scale-95 shadow-md">
          <Tag size={18} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Fırsatlar</span>
        </div>
        <div onClick={() => navigate('/dashboard/favorites')} className="flex flex-col items-center justify-center w-14 h-12 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-rose-500 cursor-pointer transition-all active:scale-95">
          <Heart size={18} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Favoriler</span>
        </div>
        <div onClick={() => navigate('/dashboard/explore')} className="flex flex-col items-center justify-center w-14 h-12 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-blue-500 cursor-pointer transition-all active:scale-95">
          <MapPin size={18} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Harita</span>
        </div>
        <div onClick={() => navigate('/dashboard/profile')} className="flex flex-col items-center justify-center w-14 h-12 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-all active:scale-95">
          <User size={18} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Profil</span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
