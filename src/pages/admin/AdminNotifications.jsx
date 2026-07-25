import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Send, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    link_url: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    // Join ile views ve conversions sayılarını alıyoruz
    const { data, error } = await supabase
      .from('admin_notifications')
      .select(`
        *,
        notification_clicks(count),
        visits(count)
      `)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert([formData]);
        
      if (error) throw error;
      
      setFormData({ title: '', message: '', type: 'info', link_url: '' });
      fetchNotifications();
      alert('Duyuru başarıyla gönderildi! Tüm öğrenciler panellerinde görecek.');
    } catch (err) {
      console.error(err);
      alert('Duyuru gönderilirken hata oluştu. Veritabanı (SQL) tablosunu oluşturduğunuzdan emin olun.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      await supabase.from('admin_notifications').delete().eq('id', id);
      fetchNotifications();
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    await supabase
      .from('admin_notifications')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    fetchNotifications();
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Duyurular & Bildirimler</h1>
        <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Öğrencilere anlık mesaj ve duyurular gönderin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Taraf: Bildirim Gönderme Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-dark">
                <Bell size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-900">Yeni Duyuru</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duyuru Başlığı</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  placeholder="Örn: Yeni Sistem Güncellemesi"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mesaj İçeriği</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 resize-none"
                  placeholder="Duyuru metnini buraya yazın..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duyuru Tipi</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 appearance-none"
                >
                  <option value="info">Bilgi (Mavi)</option>
                  <option value="success">Başarılı/Müjde (Yeşil)</option>
                  <option value="warning">Uyarı (Turuncu)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yönlendirme Linki (Opsiyonel)</label>
                <input 
                  type="text" 
                  value={formData.link_url}
                  onChange={e => setFormData({...formData, link_url: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  placeholder="Örn: /mekan/123 veya /dashboard/profile"
                />
                <p className="text-[9px] font-medium text-slate-400 mt-2">Öğrenci bildirime tıkladığında bu sayfaya yönlendirilir.</p>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Gönder ve Yayınla
              </button>
            </form>
          </div>
        </div>

        {/* Sağ Taraf: Geçmiş Duyurular */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Geçmiş Duyurular</h2>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-50">
                  <Loader2 size={32} className="animate-spin mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Yükleniyor</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Henüz hiç duyuru gönderilmedi</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-6 rounded-[2rem] border ${notif.is_active ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-slate-50 opacity-60'} flex gap-4 transition-all relative overflow-hidden group`}>
                      <div className="shrink-0">
                        {notif.type === 'success' && <CheckCircle className="text-emerald-500" size={24} />}
                        {notif.type === 'warning' && <AlertCircle className="text-orange-500" size={24} />}
                        {notif.type === 'info' && <Bell className="text-blue-500" size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900">{notif.title}</h3>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(notif.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{notif.message}</p>
                        
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleToggleActive(notif.id, notif.is_active)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                              notif.is_active 
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {notif.is_active ? 'Yayından Kaldır' : 'Tekrar Yayınla'}
                          </button>
                          <button 
                            onClick={() => handleDelete(notif.id)}
                            className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {notif.link_url && (
                           <div className="mt-3 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <span>🔗 Link:</span> <span className="text-primary">{notif.link_url}</span>
                           </div>
                        )}

                        {/* Analitik İstatistikleri */}
                        <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                              <Bell size={16} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Erişim</p>
                              <p className="text-sm font-bold text-slate-900">{notif.notification_clicks?.[0]?.count || 0} Kişi</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                              <CheckCircle size={16} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Kullanım</p>
                              <p className="text-sm font-bold text-slate-900">{notif.visits?.[0]?.count || 0} İndirim</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {notif.is_active && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Yayında</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminNotifications;
