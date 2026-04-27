import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';

const statusConfig = {
  bekliyor:    { label: 'Bekliyor',   bg: 'bg-amber-50',   text: 'text-amber-600',  icon: <Clock size={14} /> },
  onaylandi:   { label: 'Onaylandı',  bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle size={14} /> },
  reddedildi:  { label: 'Reddedildi', bg: 'bg-red-50',     text: 'text-red-600',    icon: <XCircle size={14} /> },
};

const uniLabels = {
  selcuk: 'Selçuk Üniversitesi',
  necmettin: 'Necmettin Erbakan Ünv.',
  ktn: 'KTO Karatay Ünv.',
  other: 'Diğer',
};

const Admin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await supabase.from('applications').update({ status }).eq('id', id);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setUpdating(null);
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = {
    all: applications.length,
    bekliyor: applications.filter(a => a.status === 'bekliyor').length,
    onaylandi: applications.filter(a => a.status === 'onaylandi').length,
    reddedildi: applications.filter(a => a.status === 'reddedildi').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-6 py-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Paneli</h1>
            <p className="text-slate-400 text-sm mt-1">Öğrenci başvurularını yönet</p>
          </div>
          <button onClick={fetchApplications}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
            <RefreshCw size={15} /> Yenile
          </button>
        </div>

        {/* Stats */}
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-4 mt-8">
          {[
            { key: 'all', label: 'Toplam', color: 'bg-white/10' },
            { key: 'bekliyor', label: 'Bekliyor', color: 'bg-amber-500/20' },
            { key: 'onaylandi', label: 'Onaylandı', color: 'bg-emerald-500/20' },
            { key: 'reddedildi', label: 'Reddedildi', color: 'bg-red-500/20' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`${s.color} rounded-xl p-4 text-left border transition-all ${filter === s.key ? 'border-white/40' : 'border-white/10 hover:border-white/20'}`}>
              <p className="text-2xl font-black text-white">{counts[s.key]}</p>
              <p className="text-slate-300 text-xs mt-1">{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-24 text-slate-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 opacity-40" />
            <p>Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-lg font-semibold">Başvuru bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(app => {
              const s = statusConfig[app.status] || statusConfig.bekliyor;
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-black text-dark text-lg">{app.name}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                        {s.icon}{s.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">{app.phone} · {uniLabels[app.university] || app.university}</p>
                    <p className="text-slate-400 text-xs mt-1">{new Date(app.created_at).toLocaleString('tr-TR')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {app.card_url && (
                      <button onClick={() => setPreview(app.card_url)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                        <Eye size={15} /> Kartı Gör
                      </button>
                    )}
                    {app.status !== 'onaylandi' && (
                      <button onClick={() => updateStatus(app.id, 'onaylandi')} disabled={updating === app.id}
                        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-500 px-3 py-2 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50">
                        <CheckCircle size={15} /> Onayla
                      </button>
                    )}
                    {app.status !== 'reddedildi' && (
                      <button onClick={() => updateStatus(app.id, 'reddedildi')} disabled={updating === app.id}
                        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-red-500 px-3 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
                        <XCircle size={15} /> Reddet
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-dark">Öğrenci Kartı</p>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-dark text-xl">✕</button>
            </div>
            <img src={preview} alt="Öğrenci Kartı" className="w-full rounded-xl border border-slate-100 object-contain max-h-[60vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
