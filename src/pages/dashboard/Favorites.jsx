import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight, Store, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const FavoriteItem = ({ venue, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl mb-4 hover:border-primary transition-all group"
  >
    <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
      <img src={venue.image_url || 'https://via.placeholder.com/400x400?text=Mekan'} className="w-full h-full object-cover" alt={venue.name} />
    </div>
    <div className="text-left flex-1">
      <h3 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{venue.name}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{venue.category}</p>
    </div>
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-dark transition-all">
      <ChevronRight size={18} />
    </div>
  </button>
);

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          venue_id,
          venues (*)
        `)
        .eq('user_id', user.id);
      
      if (!error) setFavorites(data.map(f => f.venues));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-10 flex justify-between items-end">
        <div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
            <Heart size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Favorilerim</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Takip ettiğin mekanlar.</p>
        </div>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center opacity-20">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-xs font-black uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map(venue => (
              <FavoriteItem 
                key={venue.id} 
                venue={venue} 
                onClick={() => navigate(`/mekan/${venue.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-8">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Heart size={40} />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Henüz favorin yok</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Mekanları favorilerine ekleyerek buraya kaydedebilirsin.</p>
            <button 
              onClick={() => navigate('/dashboard/explore')}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              Mekan Keşfet
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
