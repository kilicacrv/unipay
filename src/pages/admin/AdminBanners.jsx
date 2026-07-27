import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon, Plus, Trash2, Clock, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/mekanlar');
  const [colorFrom, setColorFrom] = useState('from-amber-600');
  const [colorTo, setColorTo] = useState('to-orange-500');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBanners(data);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await supabase.from('banners').insert({
      title,
      subtitle,
      description,
      image_url: imageUrl,
      link_url: linkUrl,
      color_from: colorFrom,
      color_to: colorTo,
      is_active: true
    });

    setCreating(false);

    if (error) {
      alert('Hata oluştu: ' + error.message);
    } else {
      alert('Banner başarıyla eklendi!');
      setTitle('');
      setSubtitle('');
      setDescription('');
      setImageUrl('');
      fetchBanners();
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Bu bannerı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if(error) {
      alert("Silinirken hata oluştu.");
    } else {
      fetchBanners();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    await supabase.from('banners').update({ is_active: !currentStatus }).eq('id', id);
    fetchBanners();
  };

  const presetColors = [
    { name: 'Turuncu/Sarı', from: 'from-amber-600', to: 'to-orange-500', hex: 'linear-gradient(to right, #d97706, #f97316)' },
    { name: 'Kırmızı/Pembe', from: 'from-rose-600', to: 'to-pink-500', hex: 'linear-gradient(to right, #e11d48, #ec4899)' },
    { name: 'Mor/Lacivert', from: 'from-indigo-600', to: 'to-purple-500', hex: 'linear-gradient(to right, #4f46e5, #a855f7)' },
    { name: 'Yeşil/Turkuaz', from: 'from-emerald-600', to: 'to-teal-500', hex: 'linear-gradient(to right, #059669, #14b8a6)' },
    { name: 'Siyah/Gri', from: 'from-slate-900', to: 'to-slate-700', hex: 'linear-gradient(to right, #0f172a, #334155)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500">Ana sayfada ziyaretçileri karşılayan dinamik kaydırmalı afişleri yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner Ekleme Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Plus size={16} /> Yeni Banner Ekle
              </h3>
            </div>
            <div className="p-5">
              <form onSubmit={handleCreate} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ana Başlık</label>
                  <input required type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Örn: Kahve Saati" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alt Başlık (Kampanya)</label>
                  <input required type="text" value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} placeholder="Örn: Tüm İçeceklerde %30 İndirim" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Açıklama (Opsiyonel)</label>
                  <input type="text" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Örn: Sınav haftasına özel enerji patlaması." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Görsel URL</label>
                  <input required type="url" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Yönlendirme Linki</label>
                  <input required type="text" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} placeholder="/mekanlar veya https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Renk Teması</label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map(color => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => { setColorFrom(color.from); setColorTo(color.to); }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${colorFrom === color.from ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                        style={{ background: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  disabled={creating}
                  className="w-full mt-4 bg-slate-900 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Banner Oluştur'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Banner Listesi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Yayındaki Bannerlar</h3>
            </div>
            
            {loading ? (
              <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : banners.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">Henüz hiç banner eklenmemiş.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {banners.map(banner => (
                  <div key={banner.id} className="p-4 flex flex-col sm:flex-row gap-4 items-center group">
                    {/* Preview Thumbnail */}
                    <div className="relative w-full sm:w-48 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-gradient-to-r ${banner.color_from} opacity-70 mix-blend-multiply`} />
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                         <span className="text-white font-black text-center text-sm truncate w-full px-1">{banner.title}</span>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-base truncate">{banner.title}</h4>
                        {!banner.is_active && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Pasif</span>}
                      </div>
                      <p className="text-sm text-slate-600 font-medium truncate">{banner.subtitle}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{banner.description}</p>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">
                        Eklenme: {new Date(banner.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => toggleStatus(banner.id, banner.is_active)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${banner.is_active ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                      >
                        {banner.is_active ? 'Yayından Kaldır' : 'Yayına Al'}
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={12} /> Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminBanners;
