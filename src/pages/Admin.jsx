import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, Users, Store, Search, BarChart2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

// ─── EmailJS Config ───────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

const statusConfig = {
  bekliyor:    { label: 'Bekliyor',   bg: 'bg-amber-50',   text: 'text-amber-700', border: 'border-amber-200', icon: <Clock size={14} /> },
  onaylandi:   { label: 'Onaylandı',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle size={14} /> },
  reddedildi:  { label: 'Reddedildi', bg: 'bg-rose-50',    text: 'text-rose-700', border: 'border-rose-200', icon: <XCircle size={14} /> },
};

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [appsRes, bizRes] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('business_applications').select('*').order('created_at', { ascending: false })
    ]);
    if (!appsRes.error) setStudents(appsRes.data || []);
    if (!bizRes.error) setBusinesses(bizRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sendApprovalEmail = async (app) => {
    if (!app.email || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return;
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:   app.email,
          to_name:    app.name,
          from_name:  'Kampüs Pay',
          reply_to:   'info@kampuspay.com',
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (e) {
      console.error('Mail gönderilemedi:', e);
    }
  };

  const updateStatus = async (id, status, table) => {
    setUpdating(id);
    await supabase.from(table).update({ status }).eq('id', id);
    if (table === 'applications') {
      const updatedApp = students.find(a => a.id === id);
      setStudents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (status === 'onaylandi' && updatedApp) {
        await sendApprovalEmail({ ...updatedApp, status });
      }
    } else {
      setBusinesses(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
    setUpdating(null);
  };

  const currentData = activeTab === 'students' ? students : businesses;
  const filtered = filter === 'all' ? currentData : currentData.filter(a => a.status === filter);

  const counts = {
    all: currentData.length,
    bekliyor: currentData.filter(a => a.status === 'bekliyor').length,
    onaylandi: currentData.filter(a => a.status === 'onaylandi').length,
    reddedildi: currentData.filter(a => a.status === 'reddedildi').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-dark shadow-sm">Ü</div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Yönetim Paneli</h1>
                <p className="text-xs text-slate-500 font-medium">Kampüs Pay Kontrol Merkezi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => { setActiveTab('students'); setFilter('all'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Users size={16} /> Öğrenciler
                </button>
                <button 
                  onClick={() => { setActiveTab('businesses'); setFilter('all'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'businesses' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Store size={16} /> İşletmeler
                </button>
                <button 
                  onClick={() => navigate('/admin/venues')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  <MapPin size={16} /> Mekanlar
                </button>
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  <BarChart2 size={16} /> Analitik
                </button>
              </div>

              <button onClick={fetchData}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                <span className="hidden sm:inline">Yenile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', label: 'Toplam Başvuru', value: counts.all, color: 'text-slate-600', bg: 'bg-white' },
            { key: 'bekliyor', label: 'Bekleyenler', value: counts.bekliyor, color: 'text-amber-600', bg: 'bg-white' },
            { key: 'onaylandi', label: 'Onaylananlar', value: counts.onaylandi, color: 'text-emerald-600', bg: 'bg-white' },
            { key: 'reddedildi', label: 'Reddedilenler', value: counts.reddedildi, color: 'text-rose-600', bg: 'bg-white' },
          ].map(s => (
            <button 
              key={s.key} 
              onClick={() => setFilter(s.key)}
              className={`p-5 rounded-xl text-left transition-all border ${filter === s.key ? 'border-primary ring-2 ring-primary/20 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'} shadow-sm`}
            >
              <p className="text-sm font-semibold text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {activeTab === 'students' ? 'Öğrenci Başvuruları' : 'İşletme Başvuruları'}
            </h2>
            <div className="text-xs font-semibold text-slate-500">
              {filtered.length} sonuç bulundu
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">Veriler yükleniyor...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">Kayıt Bulunamadı</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Seçilen filtreye uygun herhangi bir başvuru mevcut değil.</p>
              </div>
            ) : (
              filtered.map(app => {
                const s = statusConfig[app.status] || statusConfig.bekliyor;
                const isStudent = activeTab === 'students';
                const tableName = isStudent ? 'applications' : 'business_applications';
                
                return (
                  <div key={app.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{isStudent ? app.name : app.business_name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
                          {s.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                        {isStudent ? (
                          <>
                            <div className="flex items-center gap-2">📱 <span className="font-medium">{app.phone}</span></div>
                            <div className="flex items-center gap-2">🎓 <span className="font-medium">{app.university}</span></div>
                            <div className="flex items-center gap-2 col-span-full">📧 <span className="font-medium">{app.email}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">👤 <span className="font-medium">{app.contact_name}</span></div>
                            <div className="flex items-center gap-2">📱 <span className="font-medium">{app.phone}</span></div>
                            {app.instagram && <div className="flex items-center gap-2">📸 <span className="font-medium">@{app.instagram}</span></div>}
                          </>
                        )}
                        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 col-span-full">
                          <Clock size={12} />
                          <span>{new Date(app.created_at).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isStudent && app.card_url && (
                        <button onClick={() => setPreview(app.card_url)}
                          className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 rounded-lg transition-all shadow-sm"
                          title="Kartı Görüntüle">
                          <Eye size={18} />
                        </button>
                      )}
                      
                      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {app.status !== 'onaylandi' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'onaylandi', tableName)} 
                            disabled={updating === app.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> Onayla
                          </button>
                        )}
                        {app.status !== 'reddedildi' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'reddedildi', tableName)} 
                            disabled={updating === app.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 ${app.status === 'onaylandi' ? 'text-slate-600 hover:bg-slate-200' : 'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 ml-1'}`}
                          >
                            <XCircle size={14} /> Reddet
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal - Preview */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-bold text-slate-900">Öğrenci Kartı Önizleme</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 bg-slate-100 flex items-center justify-center">
              <img src={preview} alt="Öğrenci Kartı" className="max-w-full rounded-lg shadow-md border border-slate-200 object-contain max-h-[60vh]" />
            </div>
            <div className="px-6 py-4 bg-white flex justify-end">
              <button 
                onClick={() => setPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

