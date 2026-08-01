import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, Users, Store, Search } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { logSystemEvent } from '../lib/logger';

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
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
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

  const sendEmailNotification = async (app, status) => {
    if (!app.email || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return;
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:   app.email,
          to_name:    app.name || app.contact_name || 'Öğrenci',
          status_message: status === 'onaylandi' 
            ? 'Öğrenci bilgileriniz onaylanmıştır, Kampüs Pay uygulamasını gönül rahatlığı ile kullanıp indirimlerden faydalanabilirsiniz.' 
            : 'Öğrenci belgeniz doğrulanamadı. Lütfen E-Devlet üzerinden aldığınız güncel bir öğrenci belgesini (PDF) veya öğrenci kartınızı net bir şekilde tekrar yükleyin.',
          from_name:  'Kampüs Pay',
          reply_to:   'info@kampuspay.com',
        },
        EMAILJS_PUBLIC_KEY
      );
    } catch (e) {
      console.error('Mail gönderilemedi:', e);
    }
  };

  const processUpdateStatus = async () => {
    if (!confirmModal) return;
    const { id, status, table, app } = confirmModal;
    setUpdating(id);
    
    const updatePayload = { status };
    if (table === 'applications' && status === 'onaylandi') {
      updatePayload.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase.from(table).update(updatePayload).eq('id', id);
    
    if (error) {
      alert('Güncelleme sırasında bir hata oluştu: ' + error.message);
      setUpdating(null);
      setConfirmModal(null);
      return;
    }

    if (table === 'applications') {
      setStudents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      await sendEmailNotification({ ...app, status }, status);
      await logSystemEvent(`student_${status}`, app.user_id || null, null, { name: app.name, email: app.email, message: `Öğrenci ${status}` });
    } else {
      const updatedBiz = businesses.find(a => a.id === id);
      setBusinesses(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      await logSystemEvent(`business_${status}`, updatedBiz?.user_id || null, updatedBiz?.id || null, { name: updatedBiz?.business_name, email: updatedBiz?.email, message: `İşletme ${status}` });
      
      // İşletme onaylandığında otomatik Mekan (Venue) oluştur
      if (status === 'onaylandi' && updatedBiz) {
        const { error: venueError } = await supabase.from('venues').insert({
          name: updatedBiz.business_name,
          category: 'Cafe', // Varsayılan kategori
          phone: updatedBiz.phone,
          instagram: updatedBiz.instagram || '',
          lat: 38.0232, // Bosna default koordinatları
          lng: 32.5103,
          rating: 5.0,
          address: 'Bosna Hersek Mh.', // Varsayılan
          image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' // Varsayılan resim
        });
        
        if (venueError) {
          console.error("Mekan oluşturulamadı:", venueError);
          alert("İşletme onaylandı ancak mekanlar sekmesine eklenirken hata oluştu: " + venueError.message + " Detaylar konsolda.");
        } else {
          alert("İşletme onaylandı ve mekan listesine otomatik eklendi. Detayları Mekan Yönetimi sayfasından düzenleyebilirsiniz.");
        }
      }
    }
    setUpdating(null);
    setConfirmModal(null);
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
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Başvurular</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setActiveTab('students'); setFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'students' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              <Users size={14} /> Öğrenciler
            </button>
            <button 
              onClick={() => { setActiveTab('businesses'); setFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'businesses' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              <Store size={14} /> İşletmeler
            </button>
          </div>
        </div>
        
        <button onClick={fetchData}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
          <span>Yenile</span>
        </button>
      </div>
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
                            onClick={() => setConfirmModal({ id: app.id, status: 'onaylandi', table: tableName, app })} 
                            disabled={updating === app.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> Onayla
                          </button>
                        )}
                        {app.status !== 'reddedildi' && (
                          <button 
                            onClick={() => setConfirmModal({ id: app.id, status: 'reddedildi', table: tableName, app })} 
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

      {/* Modal - Preview */}
      {preview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-lg">Belge Önizleme</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-white rounded-md border border-slate-200">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-100/50 flex-1 overflow-auto flex items-center justify-center">
              {preview.toLowerCase().includes('.pdf') ? (
                <iframe src={preview} className="w-full h-full min-h-[60vh] rounded-xl shadow-sm border border-slate-200 bg-white" title="PDF Preview" />
              ) : (
                <img src={preview} alt="Öğrenci Kartı" className="max-w-full rounded-xl shadow-md border border-slate-200 object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Confirmation */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.status === 'onaylandi' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {confirmModal.status === 'onaylandi' ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {confirmModal.status === 'onaylandi' ? 'Onaylıyor musunuz?' : 'Reddediyor musunuz?'}
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                <span className="font-bold text-slate-700">{confirmModal.app.name || confirmModal.app.business_name}</span> adlı kullanıcının başvurusu 
                {confirmModal.status === 'onaylandi' ? ' onaylanacak' : ' reddedilecek'}. 
                <br/><br/>
                İşlem sonucunda kullanıcıya otomatik bir e-posta bildirimi gönderilecektir. (EmailJS aktifse)
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  İptal Et
                </button>
                <button 
                  onClick={processUpdateStatus}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    confirmModal.status === 'onaylandi' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {updating ? 'İşleniyor...' : 'Evet, Onayla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

