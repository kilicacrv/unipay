import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart2, Heart, MapPin, Users, Zap, TrendingUp, Store, Loader2 } from 'lucide-react';

const StatCard = ({ label, value, icon, sub, color }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex items-start gap-6 hover:shadow-xl transition-all">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">{value}</p>
      {sub && <p className="text-xs font-bold text-slate-400 mt-2">{sub}</p>}
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalFavorites: 0,
    totalVisits: 0,
    totalStudents: 0,
    totalPointsAwarded: 0,
    totalFlash: 0,
  });
  const [topVenues, setTopVenues] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Total Venues
      const { count: venueCount } = await supabase
        .from('venues').select('*', { count: 'exact', head: true });

      // Total Favorites
      const { count: favCount } = await supabase
        .from('favorites').select('*', { count: 'exact', head: true });

      // Total Visits
      const { count: visitCount } = await supabase
        .from('visits').select('*', { count: 'exact', head: true });

      // Total Points Awarded
      const { data: pointsData } = await supabase
        .from('student_points').select('total_points');
      const totalPts = pointsData?.reduce((acc, cur) => acc + cur.total_points, 0) || 0;

      // Total Active Students (with points)
      const { count: studentCount } = await supabase
        .from('student_points').select('*', { count: 'exact', head: true });

      // Total Flash Campaigns
      const { count: flashCount } = await supabase
        .from('flash_campaigns').select('*', { count: 'exact', head: true });

      setStats({
        totalVenues: venueCount || 0,
        totalFavorites: favCount || 0,
        totalVisits: visitCount || 0,
        totalStudents: studentCount || 0,
        totalPointsAwarded: totalPts,
        totalFlash: flashCount || 0,
      });

      // Recent Visits (Son İşlemler)
      const { data: recentVisitsData } = await supabase
        .from('visits')
        .select(`
          id,
          status,
          created_at,
          user_id,
          venues (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentVisitsData) setRecentVisits(recentVisitsData);

      // Top venues by favorites
      const { data: topFavs } = await supabase
        .from('favorites')
        .select('venue_id, venues(name, category)')
        .limit(50);

      if (topFavs) {
        const countMap = {};
        topFavs.forEach(f => {
          if (!f.venues) return; // Prevent crashes from deleted venues
          const id = f.venue_id;
          countMap[id] = countMap[id] || { ...f.venues, count: 0 };
          countMap[id].count++;
        });
        const sorted = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 5);
        setTopVenues(sorted);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analitiği</h1>
        <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Gerçek zamanlı platform istatistikleri.</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Veriler Yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard
              label="Toplam Mekan"
              value={stats.totalVenues}
              icon={<Store size={24} className="text-white" />}
              color="bg-slate-900"
              sub="Sisteme kayıtlı mekan sayısı"
            />
            <StatCard
              label="Toplam Favori"
              value={stats.totalFavorites}
              icon={<Heart size={24} className="text-white" fill="white" />}
              color="bg-rose-500"
              sub="Öğrenciler tarafından kaydedilen"
            />
            <StatCard
              label="Toplam Ziyaret"
              value={stats.totalVisits}
              icon={<MapPin size={24} className="text-white" />}
              color="bg-emerald-500"
              sub="QR kod ile gerçekleşen indirim"
            />
            <StatCard 
              label="Flaş Kampanyalar" 
              value={stats.totalFlash} 
              icon={<Zap size={24} className="text-white fill-white" />} 
              color="bg-amber-500"
              sub="Aktif flaş kampanya sayısı"
            />
            <StatCard
              label="Aktif Öğrenci"
              value={stats.totalStudents}
              icon={<Users size={24} className="text-white" />}
              color="bg-blue-500"
              sub="Puan kazanmış öğrenci sayısı"
            />
            <StatCard
              label="Dağıtılan Puan"
              value={stats.totalPointsAwarded}
              icon={<Zap size={24} className="text-white" fill="white" />}
              color="bg-amber-500"
              sub="Toplam kazandırılan sadakat puanı"
            />
            <StatCard
              label="Etkileşim Oranı"
              value={stats.totalVisits > 0 ? `${Math.round((stats.totalVisits / Math.max(stats.totalStudents, 1)) * 10) / 10}x` : '—'}
              icon={<TrendingUp size={24} className="text-white" />}
              color="bg-violet-500"
              sub="Öğrenci başına ortalama ziyaret"
            />
          </div>

          {/* Top Venues */}
          {topVenues.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <BarChart2 size={18} /> En Çok Favorilenen Mekanlar
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Favori Sayısına Göre</span>
              </div>
              <div className="divide-y divide-slate-50">
                {topVenues.map((venue, i) => (
                  <div key={i} className="px-8 py-5 flex items-center gap-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{venue.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{venue.category}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-rose-50 text-rose-500 px-4 py-2 rounded-xl">
                      <Heart size={14} fill="currentColor" />
                      <span className="font-black text-sm">{venue.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Recent Visits (İndirim Geçmişi) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <MapPin size={18} /> Canlı İşlem Geçmişi
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full animate-pulse">Son 10 İşlem</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-4">Tarih / Saat</th>
                    <th className="px-8 py-4">Kullanıcı (ID)</th>
                    <th className="px-8 py-4">Mekan</th>
                    <th className="px-8 py-4 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentVisits.length > 0 ? (
                    recentVisits.map((visit) => (
                      <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                          {new Date(visit.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-8 py-4 text-xs font-bold text-slate-900 truncate max-w-[120px]">
                          {visit.user_id ? visit.user_id.substring(0, 8).toUpperCase() : 'Bilinmiyor'}
                        </td>
                        <td className="px-8 py-4 text-xs font-bold text-slate-900">
                          {visit.venues?.name || 'Mekan Bulunamadı'}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            visit.status === 'onaylandi' ? 'bg-emerald-50 text-emerald-600' :
                            visit.status === 'reddedildi' ? 'bg-rose-50 text-rose-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {visit.status === 'onaylandi' ? 'Onaylandı' :
                             visit.status === 'reddedildi' ? 'Reddedildi' : 'Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Henüz işlem bulunmuyor
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
