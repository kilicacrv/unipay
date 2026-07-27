import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Terminal, Clock, Search, AlertCircle, CheckCircle, Zap, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, errors, success, system
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    
    // Temizlik işlemi (RPC veya client side cleanup for 24h)
    // Supabase fonksiyonunuz yoksa diye şimdilik son 24 saati çeken filtre kullanıyoruz.
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Geri kalanları sadece view'da gizliyoruz ancak veritabanını temizlemek isterseniz:
    await supabase.from('system_logs').delete().lt('created_at', oneDayAgo);

    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
      
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Realtime subscription
    const channel = supabase
      .channel('system_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getLogStyle = (type) => {
    if (type.includes('error') || type.includes('rejected')) return { bg: 'bg-rose-50', text: 'text-rose-600', icon: <AlertCircle size={16} /> };
    if (type.includes('success') || type.includes('approved')) return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle size={16} /> };
    if (type.includes('pending')) return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={16} /> };
    return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Zap size={16} /> };
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'errors' && !log.event_type.includes('error') && !log.event_type.includes('rejected')) return false;
    if (filter === 'success' && !log.event_type.includes('success') && !log.event_type.includes('approved')) return false;
    
    if (searchQuery) {
      const searchStr = `${log.event_type} ${log.details?.message || ''} ${log.details?.name || ''}`.toLowerCase();
      if (!searchStr.includes(searchQuery.toLowerCase())) return false;
    }
    
    return true;
  });

  const clearAllLogs = async () => {
    if(!window.confirm("Tüm logları silmek istediğinize emin misiniz?")) return;
    await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all trick
    setLogs([]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sistem Logları</h1>
          <p className="text-slate-500 font-medium text-sm">Sistemdeki tüm hareketleri ve hataları anlık olarak izleyin (24 saatlik veri).</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={clearAllLogs} className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-rose-100 transition-colors shadow-sm">
            <Trash2 size={14} /> Temizle
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tümü</button>
          <button onClick={() => setFilter('errors')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'errors' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}>Sadece Hatalar</button>
          <button onClick={() => setFilter('success')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'success' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>Başarılı İşlemler</button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Loglarda ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Logs Window */}
      <div className="bg-[#0A0F1C] rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-slate-400" />
            <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Sistem Terminali</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-sm">
          {loading ? (
            <div className="text-slate-500 flex items-center gap-2"><Clock className="animate-spin" size={14}/> Bağlanıyor...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-slate-500">Gösterilecek log bulunamadı. Dinleniyor... _</div>
          ) : (
            filteredLogs.map(log => {
              const style = getLogStyle(log.event_type);
              return (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 group">
                  <div className="text-slate-500 text-xs shrink-0 w-24">
                    {format(new Date(log.created_at), 'HH:mm:ss', { locale: tr })}
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest ${style.bg.replace('50', '500/10')} ${style.text.replace('600', '400')} shrink-0`}>
                    {style.icon} {log.event_type}
                  </div>
                  <div className="text-slate-300 flex-1 truncate">
                    {log.details?.message || JSON.stringify(log.details)}
                  </div>
                  
                  {/* Action Buttons for quick intervention */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
                    {(log.user_id || log.details?.email) && (
                      <button 
                        onClick={() => alert(`Kullanıcı/İşletme Bilgileri: ${log.details?.name || 'Bilinmiyor'} - ${log.details?.email || 'Bilinmiyor'}\nHata: ${log.details?.error || 'Yok'}`)}
                        className="px-3 py-1 rounded bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition-colors flex items-center gap-1"
                      >
                        <Eye size={12} /> İncele
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
