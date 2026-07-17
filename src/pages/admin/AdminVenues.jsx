import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Plus, Trash2, Edit2, Save, X, Search, Loader2, Image as ImageIcon, Upload, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

const AdminVenues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Tümü');

  const [newVenue, setNewVenue] = useState({
    name: '',
    category: 'Cafe',
    lat: 37.99,
    lng: 32.51,
    image_url: '',
    address: '',
    phone: '',
    instagram: '',
    rating: 4.5,
    google_maps_url: ''
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const parseGoogleMapsLink = (url) => {
    if (!url) return null;
    // Regex to find @lat,lng in Google Maps URLs
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return null;
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = newVenue.image_url;

      // 1. Image Upload
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `venues/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-assets')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('business-assets')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      // 2. Parse Coordinates from Link
      let finalLat = newVenue.lat;
      let finalLng = newVenue.lng;
      const coords = parseGoogleMapsLink(newVenue.google_maps_url);
      if (coords) {
        finalLat = coords.lat;
        finalLng = coords.lng;
      }

      // 3. Database Insert
      const venueToInsert = {
        ...newVenue,
        lat: finalLat,
        lng: finalLng,
        image_url: finalImageUrl
      };
      
      // Remove temporary field before insert
      delete venueToInsert.google_maps_url;

      const { error } = await supabase.from('venues').insert(venueToInsert);
      
      if (error) throw error;

      setIsAdding(false);
      setNewVenue({ name: '', category: 'Cafe', lat: 37.99, lng: 32.51, image_url: '', address: '', phone: '', instagram: '', rating: 4.5, google_maps_url: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchVenues();
      alert('Mekan başarıyla eklendi!');
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteVenue = async (id) => {
    if (window.confirm('Bu mekanı silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('venues').delete().eq('id', id);
      if (!error) fetchVenues();
    }
  };

  return (
    <div className="p-8 pt-32 max-w-6xl mx-auto font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm transition-all duration-300 -mx-8 -mt-32 mb-12">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-dark shadow-sm">Ü</div>
            <h1 className="text-xl font-bold tracking-tight">Mekan Yönetimi</h1>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button onClick={() => navigate('/admin')} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Başvurular</button>
            <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg">Mekanlar</button>
            <button onClick={() => navigate('/admin/analytics')} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Analitik</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 mt-8">
        <div>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors"
          >
            <ChevronLeft size={14} /> Geri Dön
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mekan Yönetimi</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Sisteme yeni mekan ekleyin veya mevcutları düzenleyin.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['Tümü', 'Cafe', 'Restoran', 'Tatlı', 'Giyim', 'Eğlence'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedFilter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={18} /> Yeni Mekan Ekle
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Yeni Mekan Ekle</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mekan detaylarını girin</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVenue} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mekan Adı</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    placeholder="Mekan İsmi"
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

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Maps Linki (Otomatik Koordinat)</label>
                <div className="relative">
                  <input 
                    type="url" 
                    placeholder="https://www.google.com/maps/..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    value={newVenue.google_maps_url}
                    onChange={e => setNewVenue({...newVenue, google_maps_url: e.target.value})}
                  />
                  <div className="flex items-center gap-2 mt-2 ml-1 text-slate-400">
                    <AlertCircle size={10} />
                    <p className="text-[9px] font-medium uppercase tracking-tight">Link girerseniz koordinatlar otomatik çekilir.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mekan Görseli</label>
                <div 
                  onClick={() => document.getElementById('venue-image-upload').click()}
                  className="border-2 border-dashed border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden h-40"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                      <div className="relative z-10 flex flex-col items-center">
                        <CheckCircle className="text-emerald-500 mb-2" size={32} />
                        <span className="text-sm font-bold text-slate-900">Görsel Seçildi</span>
                        <span className="text-xs text-slate-500 mt-1 font-medium italic">Değiştirmek için tıklayın</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="text-slate-300 mb-4" size={48} />
                      <span className="text-sm font-bold text-slate-900">Görsel Seçmek İçin Tıklayın</span>
                      <span className="text-[10px] text-slate-400 mt-2 text-center px-4 font-medium leading-relaxed">
                        Mekanın en güzel fotoğrafını yükleyin.
                      </span>
                    </>
                  )}
                  <input id="venue-image-upload" type="file" hidden accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adres</label>
                <textarea 
                  rows={2}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 resize-none"
                  placeholder="Mekanın açık adresi..."
                  value={newVenue.address}
                  onChange={e => setNewVenue({...newVenue, address: e.target.value})}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {uploading ? 'Yükleniyor...' : 'Kaydet ve Yayınla'}
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
          {venues
            .filter(v => selectedFilter === 'Tümü' || v.category === selectedFilter)
            .map(venue => (
            <div key={venue.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden shrink-0 border border-slate-50 shadow-inner">
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
