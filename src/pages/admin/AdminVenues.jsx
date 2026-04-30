import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Store, MapPin, Plus, Trash2, Edit2, Save, X, Search, Loader2, Image as ImageIcon } from 'lucide-react';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    category: 'Cafe',
    lat: 37.99,
    lng: 32.51,
    image_url: '',
    address: '',
    phone: '',
    instagram: '',
    rating: 4.5
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('venues').select('*').order('created_at', { ascending: false });
    if (!error) setVenues(data);
    setLoading(false);
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('venues').insert(newVenue);
    if (!error) {
      setIsAdding(false);
      setNewVenue({ name: '', category: 'Cafe', lat: 37.99, lng: 32.51, image_url: '', address: '', phone: '', instagram: '', rating: 4.5 });
      fetchVenues();
    } else {
      alert('Hata: ' + error.message);
    }
  };

  const deleteVenue = async (id) => {
    if (window.confirm('Bu mekanı silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('venues').delete().eq('id', id);
      if (!error) fetchVenues();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mekan Yönetimi</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Sisteme yeni mekan ekleyin veya mevcutları düzenleyin.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={18} /> Yeni Mekan Ekle
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">Mekan Detayları</h2>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVenue} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mekan Adı</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    value={newVenue.name}
                    onChange={e => setNewVenue({...newVenue, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                  <select 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 appearance-none"
                    value={newVenue.category}
                    onChange={e => setNewVenue({...newVenue, category: e.target.value})}
                  >
                    <option>Cafe</option>
                    <option>Restoran</option>
                    <option>Tatlı</option>
                    <option>Giyim</option>
                    <option>Eğlence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Enlem (Lat)</label>
                  <input 
                    required
                    type="number" step="any"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    value={newVenue.lat}
                    onChange={e => setNewVenue({...newVenue, lat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Boylam (Lng)</label>
                  <input 
                    required
                    type="number" step="any"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    value={newVenue.lng}
                    onChange={e => setNewVenue({...newVenue, lng: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Görsel URL</label>
                <input 
                  type="url" 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  value={newVenue.image_url}
                  onChange={e => setNewVenue({...newVenue, image_url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adres</label>
                <textarea 
                  rows={2}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 resize-none"
                  value={newVenue.address}
                  onChange={e => setNewVenue({...newVenue, address: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-dark py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                >
                  Kaydet ve Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Mekanlar Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden shrink-0">
                  <img src={venue.image_url || 'https://via.placeholder.com/200x200'} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight">{venue.name}</h3>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-lg inline-block mt-1">{venue.category}</span>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-xs text-slate-500 font-bold flex items-center gap-2"><MapPin size={14} /> {venue.lat.toFixed(4)}, {venue.lng.toFixed(4)}</p>
                <p className="text-xs text-slate-400 font-medium truncate italic">{venue.address || 'Adres belirtilmemiş'}</p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button className="flex-1 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all">
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteVenue(venue.id)}
                  className="flex-1 h-12 bg-rose-50 text-rose-300 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-rose-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVenues;
