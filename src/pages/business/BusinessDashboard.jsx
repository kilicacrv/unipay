import React, { useState, useEffect } from 'react';
import { Eye, MousePointer2, Tag, TrendingUp, Users, Download, Printer, Loader2 } from 'lucide-react';
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

      // 1. Check business application
      const { data: bizApp } = await supabase
        .from('business_applications')
        .select('business_name')
        .eq('user_id', user.id)
        .eq('status', 'onaylandi')
        .single();

      if (bizApp) {
        // 2. Try to find the venue
        const { data: venue } = await supabase
          .from('venues')
          .select('*')
          .ilike('name', `%${bizApp.business_name}%`)
          .single();

        if (venue) {
          setBusiness({
            id: venue.id,
            name: venue.name,
            branch: venue.address || 'Merkez'
          });
        } else {
          setBusiness({
            id: user.id,
            name: bizApp.business_name,
            branch: 'Merkez'
          });
        }
      } else {
        // Fallback for test/admin accounts without a business application
        setBusiness({
          id: user.id,
          name: user.user_metadata?.full_name || 'İşletme Hesabı',
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
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Son İndirim Kullanımları</h2>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Canlı</span>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { id: '782341', name: 'Alperen K.', time: '5 dk önce', discount: '%20 Kahve' },
              { id: '129384', name: 'Ayşe Y.', time: '24 dk önce', discount: '%20 Kahve' },
              { id: '445212', name: 'Mehmet S.', time: '1 saat önce', discount: 'Öğrenci Menüsü' },
              { id: '992834', name: 'Fatma G.', time: '2 saat önce', discount: '%20 Kahve' },
            ].map((visitor) => (
              <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    {visitor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{visitor.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">ID: {visitor.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">{visitor.discount}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{visitor.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-slate-900 border-t border-slate-50 transition-colors">
            Tüm Geçmişi Gör
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
