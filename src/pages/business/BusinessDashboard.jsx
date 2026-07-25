import React, { useState, useEffect } from 'react';
import { Eye, Tag, TrendingUp, Users, Download, Printer, Loader2, Zap, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, icon, trend, color = "text-slate-900" }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
        <TrendingUp size={12} /> {trend}
      </span>
    </div>
    <p className="text-slate-500 text-sm font-semibold">{title}</p>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const BusinessDashboard = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVisits, setPendingVisits] = useState([]);
  
  // Flash Campaign State
  const [flashTitle, setFlashTitle] = useState('');
  const [flashRate, setFlashRate] = useState(50);
  const [flashHours, setFlashHours] = useState(2);
  const [creatingFlash, setCreatingFlash] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const businessName = user.user_metadata?.full_name || 'İşletme Hesabı';

      // 1. Try to find the venue by business name
      const { data: venue } = await supabase
        .from('venues')
        .select('*')
        .ilike('name', `%${businessName}%`)
        .maybeSingle();

      if (venue) {
        setBusiness({
          id: venue.id,
          name: venue.name,
          branch: venue.address || 'Merkez'
        });
      } else {
        // Fallback
        setBusiness({
          id: user.id,
          name: businessName,
          branch: 'Merkez'
        });
      }
    } catch (err) {
      console.error("Error fetching business data:", err);
      // Fallback
      setBusiness({
        id: 'error_id',
        name: 'İşletme (Hata)',
        branch: 'Merkez'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVisits = async (qrCode) => {
    const { data } = await supabase
      .from('visits')
      .select('*')
      .eq('business_qr', qrCode)
      .eq('status', 'bekliyor')
      .order('created_at', { ascending: false });
    if (data) setPendingVisits(data);
  };

  useEffect(() => {
    if (!business?.id) return;
    const qrCode = `unipay_biz_${business.id}`;
    fetchPendingVisits(qrCode);

    const channel = supabase
      .channel('business_visits')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'visits',
        filter: `business_qr=eq.${qrCode}`
      }, () => {
        fetchPendingVisits(qrCode);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [business?.id]);

  const handleApprove = async (visit) => {
    try {
      // 1. Update visit status and venue_id
      await supabase.from('visits').update({ 
        status: 'onaylandi',
        venue_id: business.id 
      }).eq('id', visit.id);
      
      const POINTS = 10;
      const { data: existingPoints } = await supabase.from('student_points').select('*').eq('user_id', visit.user_id).single();
      
      if (existingPoints) {
        await supabase.from('student_points').update({ total_points: existingPoints.total_points + POINTS }).eq('user_id', visit.user_id);
      } else {
        await supabase.from('student_points').insert({ user_id: visit.user_id, total_points: POINTS });
      }
      
      await supabase.from('points_history').insert({ user_id: visit.user_id, points: POINTS, reason: `${business.name} ziyareti` });
      
      fetchPendingVisits(`unipay_biz_${business.id}`);
    } catch (err) {
      console.error('Onaylama hatası:', err);
    }
  };

  const handleReject = async (visitId) => {
    await supabase.from('visits').update({ status: 'reddedildi' }).eq('id', visitId);
    fetchPendingVisits(`unipay_biz_${business.id}`);
  };

  const handleCreateFlash = async () => {
    if (!flashTitle || !flashRate || !flashHours) return;
    setCreatingFlash(true);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(flashHours));

    await supabase.from('flash_campaigns').insert({
      venue_id: business.id,
      title: flashTitle,
      rate: parseInt(flashRate),
      expires_at: expiresAt.toISOString()
    });

    setFlashTitle('');
    setFlashRate(50);
    setFlashHours(2);
    setCreatingFlash(false);
    alert('Flaş kampanya başarıyla oluşturuldu ve öğrencilere bildirildi!');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center opacity-50">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">İşletme Bilgileri Yükleniyor...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <p className="text-slate-500 font-bold">İşletme bilgisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hoş Geldiniz 👋</h1>
          <p className="text-slate-500 font-medium">{business.name} - {business.branch}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Printer size={16} /> QR Yazdır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Görüntülenme" value="1,284" icon={<Eye size={20} />} trend="+12%" />
        <StatCard title="İndirim Kullanımı" value="156" icon={<Tag size={20} />} trend="+5%" />
        <StatCard title="Tekil Müşteri" value="89" icon={<Users size={20} />} trend="+18%" />
        <StatCard title="Aktif Kampanya" value="2" icon={<Tag size={20} />} trend="0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visitor Tracking */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Onay Bekleyen İşlemler</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase animate-pulse">CANLI</span>
              <span className="text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full">{pendingVisits.length} Bekleyen</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingVisits.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium text-sm">
                Şu an onay bekleyen indirim işlemi bulunmuyor.
              </div>
            ) : (
              pendingVisits.map((visit) => (
                <div key={visit.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-black text-lg border-2 border-amber-200">
                      Q
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Onay Kodu</p>
                      <p className="text-2xl font-black text-slate-900 tracking-widest">{visit.pin_code}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(visit.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReject(visit.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Reddet
                    </button>
                    <button 
                      onClick={() => handleApprove(visit)}
                      className="px-6 py-2 rounded-xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      Onayla
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-slate-900 border-t border-slate-50 transition-colors">
            Geçmiş İşlemleri Gör
          </button>
        </div>

        {/* Business QR Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <h3 className="font-bold text-slate-900 mb-2">Mekan QR Kodu</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Öğrencilerin indirim alması için bu kodu taratması gerekir.</p>
            
            <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 shadow-inner mb-6">
              <QRCodeSVG 
                value={`unipay_biz_${business.id}`} 
                size={160}
                level="H"
              />
            </div>

            <div className="flex gap-2 w-full">
              <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                <Download size={14} /> İndir
              </button>
            </div>
          </div>

          {/* Flash Campaign Creator */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={24} className="text-white fill-white animate-pulse" />
                <h3 className="font-black text-xl tracking-tight">Flaş Kampanya</h3>
              </div>
              <p className="text-xs text-white/80 font-medium mb-6">Öğrencilere anlık indirim bildirimi gönderin.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1 block">Kampanya Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Tatlılarda Son Şans" 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white"
                    value={flashTitle}
                    onChange={e => setFlashTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1 block">İndirim Oranı (%)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                      value={flashRate}
                      onChange={e => setFlashRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1 block">Süre (Saat)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                      value={flashHours}
                      onChange={e => setFlashHours(e.target.value)}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleCreateFlash}
                  disabled={creatingFlash}
                  className="w-full bg-white text-orange-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all mt-2 active:scale-95 shadow-lg"
                >
                  {creatingFlash ? <Loader2 className="animate-spin" size={16} /> : <Clock size={16} />}
                  Kampanyayı Başlat
                </button>
              </div>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-bold">Performans Notu</p>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
              Bu hafta geçen haftaya göre <span className="text-primary font-bold">%15 daha fazla</span> öğrenci işletmenizi ziyaret etti.
            </p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
