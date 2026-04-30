import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Map as MapIcon, List, Filter, Navigation, Star, ChevronRight, Tag, User, MapPin, Loader2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VenueCard = ({ venue, isFavorite, onToggleFavorite, onClick }) => (
  <div 
    className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex shadow-sm mb-4 active:scale-[0.98] transition-all cursor-pointer hover:border-primary relative"
  >
    <div onClick={onClick} className="w-28 h-28 bg-slate-100 shrink-0 relative">
      <img src={venue.image_url || 'https://via.placeholder.com/400x400?text=Mekan'} className="w-full h-full object-cover" alt={venue.name} />
      <div className="absolute top-2 left-2 bg-primary text-dark text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">
        {venue.category}
      </div>
    </div>
    
    <div className="p-4 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-1 pr-8">
        <h3 onClick={onClick} className="font-black text-slate-900 text-sm tracking-tight">{venue.name}</h3>
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={10} fill="currentColor" />
          <span className="text-[10px] font-black">{venue.rating}</span>
        </div>
      </div>
      <p onClick={onClick} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{venue.address?.split(',')[0] || 'Bosna Hersek Mahallesi'}</p>
      <div className="mt-auto flex justify-between items-center">
        <span onClick={onClick} className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg uppercase tracking-wider">İncele</span>
        <div onClick={onClick} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>

    {/* Favorite Button */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(venue.id);
      }}
      className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-white/80 backdrop-blur-md text-slate-400 border border-slate-100'}`}
    >
      <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
    </button>
  </div>
);

const VenueExplore = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('map');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [venues, setVenues] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Venues
    let query = supabase.from('venues').select('*');
    if (selectedCategory !== 'Tümü') {
      query = query.eq('category', selectedCategory);
    }
    const { data: venueData } = await query;
    if (venueData) setVenues(venueData);

    // Fetch Favorites
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: favData } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', user.id);
      if (favData) setFavorites(favData.map(f => f.venue_id));
    }
    
    setLoading(false);
  };

  const toggleFavorite = async (venueId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Lütfen giriş yapın.');

    const isFav = favorites.includes(venueId);

    if (isFav) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('venue_id', venueId);
      
      if (!error) setFavorites(prev => prev.filter(id => id !== venueId));
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, venue_id: venueId });
      
      if (!error) setFavorites(prev => [...prev, venueId]);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col relative font-sans overflow-hidden">
      {/* Search & Filters Overlay */}
      <div className="absolute top-6 inset-x-6 z-[1000] pointer-events-none">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-2 flex items-center gap-2 pointer-events-auto">
            <div className="w-12 h-12 flex items-center justify-center text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Mekan veya indirim ara..." 
              className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
            />
            <button className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Filter size={18} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto px-1">
            {['Tümü', 'Cafe', 'Restoran', 'Tatlı', 'Giyim'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-dark border-primary scale-105' : 'bg-white/80 backdrop-blur-md text-slate-500 border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <button 
        onClick={() => setView(view === 'map' ? 'list' : 'map')}
        className="absolute bottom-28 right-6 z-[1000] bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all border border-white/10"
      >
        {view === 'map' ? <List size={20} strokeWidth={2.5} /> : <MapIcon size={20} strokeWidth={2.5} />}
        {view === 'map' ? 'Liste Görünümü' : 'Harita Görünümü'}
      </button>

      {/* Map View */}
      {view === 'map' ? (
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
              <Loader2 className="text-slate-900 animate-spin" size={32} />
            </div>
          )}
          <MapContainer center={[37.9944, 32.5122]} zoom={15} className="h-full w-full grayscale-[0.3] brightness-105" zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {venues.map(venue => (
              <Marker key={venue.id} position={[venue.lat, venue.lng]}>
                <Popup className="custom-popup">
                  <div className="p-3 text-center">
                    <p className="font-black text-slate-900 text-sm mb-1">{venue.name}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest bg-slate-900 px-2 py-1 rounded-lg">Mekanı İncele</p>
                    <button 
                      onClick={() => navigate(`/venue/${venue.id}`)}
                      className="mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 underline"
                    >
                      Detaylara Git
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <main className="flex-1 p-6 pt-36 max-w-lg mx-auto w-full overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-end mb-8 px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Tüm Mekanlar</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{venues.length} MEKAN</span>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-xs font-black uppercase tracking-widest">Yükleniyor...</p>
            </div>
          ) : venues.length === 0 ? (
             <div className="text-center py-20">
               <p className="text-slate-400 font-bold">Bu kategoride mekan bulunamadı.</p>
             </div>
          ) : (
            venues.map(venue => (
              <VenueCard 
                key={venue.id} 
                venue={venue} 
                isFavorite={favorites.includes(venue.id)}
                onToggleFavorite={toggleFavorite}
                onClick={() => navigate(`/venue/${venue.id}`)} 
              />
            ))
          )}
        </main>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-5 flex justify-between items-center z-40 max-w-lg mx-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
          <Tag size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Fırsatlar</span>
        </div>
        <div onClick={() => navigate('/dashboard/favorites')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
          <Heart size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Favoriler</span>
        </div>
        <div onClick={() => navigate('/dashboard/explore')} className="flex flex-col items-center gap-1.5 text-slate-900 cursor-pointer">
          <MapPin size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Harita</span>
        </div>
        <div onClick={() => navigate('/dashboard/profile')} className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Profil</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-popup-content-wrapper { border-radius: 1.5rem !important; padding: 0 !important; overflow: hidden !important; border: 1px solid #f1f5f9 !important; shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
      `}} />
    </div>
  );
};

export default VenueExplore;
