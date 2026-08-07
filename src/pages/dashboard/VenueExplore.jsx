import React, { useState, useEffect } from 'react';
import { Search, Navigation, Star, User, Loader2, Heart, MapPin, Store, Coffee, Utensils, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import StudentBottomNav from '../../components/StudentBottomNav';

/* ── Category icons ── */
const CAT_ICONS = {
  'Cafe':          <Coffee size={13} />,
  'Restoran':      <Utensils size={13} />,
  'Tatlı':         <Sparkles size={13} />,
  'Giyim':         <Store size={13} />,
  'Eğlence':       <Sparkles size={13} />,
  'Kırtasiye':     <Store size={13} />,
  'Kişisel Bakım': <Sparkles size={13} />,
  'Teknoloji':     <Store size={13} />,
  'Spor':          <Sparkles size={13} />,
  'Market':        <Store size={13} />,
  'Eğitim':        <Store size={13} />,
};

/* ── Single venue card ── */
const VenueCard = ({ venue, isFavorite, onToggleFavorite, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex gap-4 items-stretch shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-[0.99] group"
  >
    {/* Thumbnail */}
    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative overflow-hidden bg-slate-100">
      <img
        src={venue.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&q=80'}
        alt={venue.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Category badge */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white px-1.5 py-0.5 rounded-lg">
        <span className="text-white/80">{CAT_ICONS[venue.category]}</span>
        <span className="text-[9px] font-black uppercase tracking-wider">{venue.category}</span>
      </div>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-1 flex-1">{venue.name}</h3>
          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(venue.id); }}
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all
              ${isFavorite ? 'bg-rose-500 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
          >
            <Heart size={12} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </button>
        </div>

        {venue.address && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={10} className="text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{venue.address.split(',')[0]}</p>
          </div>
        )}

        {/* Discount badge */}
        {venue.discount && (
          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-2 py-0.5 rounded-lg">
            <Sparkles size={9} />
            <span className="text-[10px] font-black">{venue.discount}</span>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-black text-amber-700">{venue.rating || '–'}</span>
        </div>

        {venue.lat && venue.lng ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
          >
            <Navigation size={9} />
            Yol Tarifi
          </a>
        ) : (
          <span className="text-[10px] font-bold text-primary">İncele →</span>
        )}
      </div>
    </div>
  </div>
);

/* ── Main component ── */
const VenueExplore = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const CATEGORIES = ['Tümü', 'Cafe', 'Restoran', 'Tatlı', 'Giyim', 'Eğlence', 'Kırtasiye', 'Kişisel Bakım', 'Teknoloji', 'Spor', 'Market', 'Eğitim'];

  useEffect(() => { fetchData(); }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('venues').select('*');
    if (selectedCategory !== 'Tümü') query = query.eq('category', selectedCategory);
    const { data: venueData } = await query;
    if (venueData) setVenues(venueData);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: favData } = await supabase.from('favorites').select('venue_id').eq('user_id', user.id);
      if (favData) setFavorites(favData.map(f => f.venue_id));
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  const toggleFavorite = async (venueId) => {
    if (!currentUser) { navigate('/kayit'); return; }
    const isFav = favorites.includes(venueId);
    if (isFav) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('venue_id', venueId);
      if (!error) setFavorites(prev => prev.filter(id => id !== venueId));
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: currentUser.id, venue_id: venueId });
      if (!error) setFavorites(prev => [...prev, venueId]);
    }
  };

  /* Client-side search filter */
  const filtered = venues.filter(v =>
    !searchQuery ||
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-xl border-b border-slate-100 px-4 pt-4 pb-3 space-y-3">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Mekanlar</h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {loading ? 'Yükleniyor...' : `${filtered.length} mekan bulundu`}
            </p>
          </div>
          {selectedCategory !== 'Tümü' && (
            <button
              onClick={() => setSelectedCategory('Tümü')}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full hover:bg-slate-200 transition-all"
            >
              <X size={10} /> Filtreyi Temizle
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mekan veya kategori ara..."
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap border transition-all
                ${selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full pb-28 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-300">
            <Loader2 size={36} className="animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">Yükleniyor</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
              <Store size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              {searchQuery ? `"${searchQuery}" için sonuç bulunamadı` : 'Bu kategoride mekan yok'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Tümü'); }}
              className="text-xs font-bold text-primary underline"
            >
              Tümünü göster
            </button>
          </div>
        ) : (
          filtered.map(venue => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isFavorite={favorites.includes(venue.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => navigate(`/mekan/${venue.id}`)}
            />
          ))
        )}
      </main>

      {/* ── Bottom ── */}
      {currentUser ? (
        <StudentBottomNav />
      ) : (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-4 z-40">
          <p className="text-[11px] font-bold text-slate-400 text-center mb-2 uppercase tracking-widest">
            Tüm indirimleri yakalamak için
          </p>
          <button
            onClick={() => navigate('/kayit')}
            className="w-full max-w-sm mx-auto flex bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl"
          >
            <User size={16} />
            Hemen Kayıt Ol
          </button>
        </div>
      )}
    </div>
  );
};

export default VenueExplore;
