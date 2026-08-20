import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Plus, Trash2, Edit, Save, X, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

const AdminVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Tümü');
  const [editingVenue, setEditingVenue] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editUploading, setEditUploading] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

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
    google_maps_url: '',
    owner_email: '',
    owner_password: ''
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
    // Pattern 1: @lat,lng in URL
    const regex1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match1 = url.match(regex1);
    if (match1) return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
    
    // Pattern 2: ?q=lat,lng
    const regex2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match2 = url.match(regex2);
    if (match2) return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
    
    // Pattern 3: /place/lat,lng
    const regex3 = /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match3 = url.match(regex3);
    if (match3) return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) };
    
    // Pattern 4: ll=lat,lng
    const regex4 = /ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match4 = url.match(regex4);
    if (match4) return { lat: parseFloat(match4[1]), lng: parseFloat(match4[2]) };
    
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
      
      // Remove temporary fields before insert
      delete venueToInsert.owner_email;
      delete venueToInsert.owner_password;

      // 4. Create Auth User (Optional but Recommended)
      if (newVenue.owner_email && newVenue.owner_password) {
        // Create a temporary client to avoid logging the admin out
        const { createClient } = await import('@supabase/supabase-js');
        const tempAuth = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data: authData, error: authError } = await tempAuth.auth.signUp({
          email: newVenue.owner_email,
          password: newVenue.owner_password,
          options: {
            data: { role: 'business', full_name: newVenue.name }
          }
        });

        if (authError) {
          console.error("Auth User Creation Error:", authError);
          throw new Error("Hesap oluşturulamadı: " + authError.message);
        }
      }

      console.log("Checking session before insert...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session ? session.user.email : "NO SESSION");

      console.log("Inserting venue:", venueToInsert);
      const { data: insertedVenue, error } = await supabase.from('venues').insert(venueToInsert).select();
      
      if (error) {
        console.error("Insert Error Details:", error);
        throw new Error("Venues Insert Hata: " + error.message);
      }

      setIsAdding(false);
      setNewVenue({ name: '', category: 'Cafe', lat: 37.99, lng: 32.51, image_url: '', address: '', phone: '', instagram: '', rating: 4.5, google_maps_url: '', owner_email: '', owner_password: '' });
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

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setEditForm({
      name: venue.name || '',
      category: venue.category || 'Cafe',
      address: venue.address || '',
      phone: venue.phone || '',
      instagram: venue.instagram || '',
      google_maps_url: venue.google_maps_url || '',
      rating: venue.rating || 4.5
    });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    setEditUploading(true);
    try {
      let updateData = { ...editForm };

      // Görsel değiştirildiyse yükle
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `venues/${fileName}`;
        const { error: upErr } = await supabase.storage.from('business-assets').upload(filePath, editImageFile);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('business-assets').getPublicUrl(filePath);
        updateData.image_url = publicUrl;
      }

      // Google Maps linkinden koordinat çek
      const coords = parseGoogleMapsLink(editForm.google_maps_url);
      if (coords) {
        updateData.lat = coords.lat;
        updateData.lng = coords.lng;
      }

      const { error } = await supabase.from('venues').update(updateData).eq('id', editingVenue.id);
      if (error) throw error;

      alert('Mekan başarıyla güncellendi!');
      setEditingVenue(null);
      fetchVenues();
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setEditUploading(false);
    }
  };

  return (
    <>
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mekan Yönetimi</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Sisteme yeni mekan ekleyin veya mevcutları düzenleyin.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['Tümü', 'Cafe', 'Restoran', 'Tatlı', 'Giyim', 'Eğlence', 'Kişisel Bakım', 'Teknoloji', 'Kırtasiye', 'Spor', 'Market', 'Eğitim'].map(cat => (
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
                    <option>Kişisel Bakım</option>
                    <option>Teknoloji</option>
                    <option>Kırtasiye</option>
                    <option>Spor</option>
                    <option>Market</option>
                    <option>Eğitim</option>
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

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  İşletme Hesabı (Giriş Bilgileri)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Giriş E-postası</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 shadow-sm"
                      placeholder="ornek@mekan.com"
                      value={newVenue.owner_email}
                      onChange={e => setNewVenue({...newVenue, owner_email: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Şifre Belirle</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 shadow-sm"
                      placeholder="Mekan123!"
                      value={newVenue.owner_password}
                      onChange={e => setNewVenue({...newVenue, owner_password: e.target.value})}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-3 ml-1">
                  E-posta ve Şifre girerseniz, işletme için otomatik hesap açılır ve giriş yapabilir.
                </p>
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
                <button 
                  onClick={() => openEditModal(venue)}
                  className="flex-1 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  <Edit size={18} />
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

      {/* Düzenleme Modalı */}
      {editingVenue && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setEditingVenue(null)} />
          
          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Mekanı Düzenle</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingVenue.name}</p>
              </div>
              <button onClick={() => setEditingVenue(null)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateVenue} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mekan Adı</label>
                  <input 
                    required type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                  <select 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 appearance-none"
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                  >
                    <option>Cafe</option><option>Restoran</option><option>Tatlı</option><option>Giyim</option><option>Eğlence</option><option>Kişisel Bakım</option><option>Teknoloji</option><option>Kırtasiye</option><option>Spor</option><option>Market</option><option>Eğitim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Maps Linki</label>
                <input 
                  type="url" 
                  placeholder="https://www.google.com/maps/..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  value={editForm.google_maps_url}
                  onChange={e => setEditForm({...editForm, google_maps_url: e.target.value})}
                />
                <p className="text-[9px] font-medium text-slate-400 mt-2 ml-1">Link girerseniz koordinatlar otomatik güncellenir.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adres</label>
                <textarea 
                  rows={2}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 resize-none"
                  value={editForm.address}
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefon</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    placeholder="0532 000 00 00"
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instagram</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    placeholder="@mekanadi"
                    value={editForm.instagram}
                    onChange={e => setEditForm({...editForm, instagram: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mekan Görseli Değiştir</label>
                <div 
                  onClick={() => document.getElementById('edit-venue-image').click()}
                  className="border-2 border-dashed border-slate-100 rounded-3xl p-6 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-32"
                >
                  {editImagePreview ? (
                    <div className="flex items-center gap-3">
                      <img src={editImagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                      <span className="text-sm font-bold text-emerald-600">Yeni görsel seçildi</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="text-slate-300 mb-2 mx-auto" size={32} />
                      <span className="text-xs font-bold text-slate-400">Değiştirmek için tıklayın (opsiyonel)</span>
                    </div>
                  )}
                  <input id="edit-venue-image" type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingVenue(null)}
                  className="flex-1 px-6 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={editUploading}
                  className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {editUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editUploading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminVenues;
