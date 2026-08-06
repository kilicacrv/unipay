import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Map as MapIcon, List, Filter, Navigation, Star, User, Loader2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import StudentBottomNav from '../../components/StudentBottomNav';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VenueCard = ({ venue, isFavorite, onToggleFavorite, onClick }) => (
  <div 
    className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm cursor-pointer hover:border-primary transition-all relative group"
  >
    <div onClick={onClick} className="w-full aspect-square bg-slate-100 relative">
      <img src={venue.image_url || 'https://via.placeholder.com/400x400?text=Mekan'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={venue.name} />
      <div className="absolute top-2 left-2 bg-primary text-dark text-[9px] font-black px-2 py-1 rounded-lg shadow-sm uppercase tracking-widest">
        {venue.category}
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg">
        <Star size={10} className="fill-amber-400 text-amber-400" />
        <span className="text-[10px] font-black">{venue.rating}</span>
      </div>
    </div>
    
    <div className="p-3 flex-1 flex flex-col">
      <h3 onClick={onClick} className="font-black text-slate-900 text-sm tracking-tight mb-0.5 line-clamp-1">{venue.name}</h3>
      <p onClick={onClick} className="text-[9px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1 mb-2">{venue.address?.split(',')[0] || 'Bosna Hersek Mahallesi'}</p>
      
      <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100">
        <span onClick={onClick} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors">İncele</span>
        {venue.lat && venue.lng && (
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-primary hover:text-dark px-2 py-1 rounded-lg text-[9px] font-bold transition-colors"
          >
            <Navigation size={10} />
            Yol Tarifi
          </a>
        )}
      </div>
    </div>

    {/* Favorite Button */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(venue.id);
      }}
      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${isFavorite ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500'}`}
    >
      <Heart size={14} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
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
  const [currentUser, setCurrentUser] = useState(null);

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
      setCurrentUser(user);
      const { data: favData } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', user.id);
      if (favData) setFavorites(favData.map(f => f.venue_id));
    } else {
      setCurrentUser(null);
    }
    
    setLoading(false);
  };

  const toggleFavorite = async (venueId) => {
    if (!currentUser) {
      alert('Favorilere eklemek için Kampüs Pay\'e giriş yapmalısınız.');
      navigate('/kayit');
      return;
    }

    const isFav = favorites.includes(venueId);

    if (isFav) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('venue_id', venueId);
      
      if (!error) setFavorites(prev => prev.filter(id => id !== venueId));
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: currentUser.id, venue_id: venueId });
      
      if (!error) setFavorites(prev => [...prev, venueId]);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col relative font-sans overflow-hidden">
      {/* Search & Filters Overlay */}
      <div className="absolute top-12 inset-x-4 z-[1000] pointer-events-none">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Search Bar */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-full shadow-xl border border-white/40 p-1.5 flex items-center gap-2 pointer-events-auto">
            <div className="w-10 h-10 flex items-center justify-center text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Mekan veya kategori ara..." 
              className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
            />
            <button className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
              <Filter size={16} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto px-1 py-1">
            {['Tümü', 'Cafe', 'Restoran', 'Tatlı', 'Giyim', 'Eğlence', 'Kırtasiye', 'Kişisel Bakım', 'Teknoloji', 'Spor', 'Market', 'Eğitim'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white/90 backdrop-blur-md text-slate-500 border-white/40 hover:bg-white'}`}
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
        className="absolute bottom-24 right-4 z-[1000] bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all border border-white/10"
      >
        {view === 'map' ? <List size={22} /> : <MapIcon size={22} />}
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
                      onClick={() => navigate(`/mekan/${venue.id}`)}
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
            <div className="grid grid-cols-2 gap-4 pb-20">
              {venues.map(venue => (
                <VenueCard 
                  key={venue.id} 
                  venue={venue} 
                  isFavorite={favorites.includes(venue.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => navigate(`/mekan/${venue.id}`)} 
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Bottom Nav or Public Banner */}
      {currentUser ? (
        <StudentBottomNav />
      ) : (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-6 z-40 max-w-lg mx-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-center">
          <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Tüm indirimleri yakalamak için</p>
          <button 
            onClick={() => navigate('/kayit')} 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <User size={18} />
            Hemen Kayıt Ol
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-popup-content-wrapper { border-radius: 1.5rem !important; padding: 0 !important; overflow: hidden !important; border: 1px solid #f1f5f9 !important; shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
      `}} />
    </div>
  );
};

export default VenueExplore;
