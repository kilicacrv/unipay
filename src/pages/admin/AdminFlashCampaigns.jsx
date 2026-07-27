import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap, Clock, Save, Trash2, Loader2, MapPin } from 'lucide-react';

const AdminFlashCampaigns = () => {
  const [venues, setVenues] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [selectedVenue, setSelectedVenue] = useState('');
  const [title, setTitle] = useState('');
  const [rate, setRate] = useState(50);
  const [hours, setHours] = useState(2);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch venues
    const { data: vData } = await supabase.from('venues').select('id, name').order('name');
    if (vData) setVenues(vData);

    // Fetch active campaigns
    const now = new Date().toISOString();
    const { data: cData } = await supabase
      .from('flash_campaigns')
      .select('*, venues(name)')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
    
    if (cData) setActiveCampaigns(cData);
    
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedVenue || !title || !rate || !hours) return;
    
    setCreating(true);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(hours));

    const { error } = await supabase.from('flash_campaigns').insert({
      venue_id: selectedVenue,
      title: title,
      rate: parseInt(rate),
      expires_at: expiresAt.toISOString()
    });

    setCreating(false);
    
    if (error) {
      alert('Hata: ' + error.message);
    } else {
      alert('Flaş kampanya başarıyla oluşturuldu!');
      setTitle('');
      setRate(50);
      setHours(2);
      setSelectedVenue('');
      fetchData(); // refresh list
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kampanyayı sonlandırmak istediğinize emin misiniz?')) return;
    
    await supabase.from('flash_campaigns').delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-slate-900" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Zap className="text-rose-500" /> Flaş Kampanyalar
        </h2>
        <p className="text-slate-500 text-sm">İşletmelere özel anlık (flaş) kampanyalar oluşturun ve yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-lg mb-6 tracking-tight">Yeni Kampanya Oluştur</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mekan Seçin</label>
              <select 
                value={selectedVenue} 
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                required
              >
                <option value="">Seçiniz...</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kampanya Başlığı</label>
              <input 
                type="text" 
                placeholder="Örn: Tatlı Krizine Son!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-900 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">İndirim Oranı (%)</label>
                <input 
                  type="number" 
                  min="1" max="100"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-900 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Süre (Saat)</label>
                <input 
                  type="number" 
                  min="1" max="72"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-900 outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={creating}
              className="w-full mt-4 bg-slate-900 text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
              Kampanyayı Başlat
            </button>
          </form>
        </div>

        {/* Active Campaigns List */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-lg mb-6 tracking-tight">Aktif Flaş Kampanyalar ({activeCampaigns.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCampaigns.map(campaign => {
              const expires = new Date(campaign.expires_at);
              const timeString = expires.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={campaign.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                        <MapPin size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{campaign.venues?.name}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 leading-tight">{campaign.title}</h4>
                    </div>
                    <div className="bg-rose-50 text-rose-600 font-black text-xl px-3 py-1 rounded-lg">
                      %{campaign.rate}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Clock size={14} className="text-rose-500" /> Bitiş: {timeString}
                    </div>
                    <button 
                      onClick={() => handleDelete(campaign.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Kampanyayı Sonlandır"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {activeCampaigns.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <Zap size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Şu an aktif bir flaş kampanya bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminFlashCampaigns;
