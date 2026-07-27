import React, { useState } from 'react';
import { Search, MapPin, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/mockData';
import { supabase } from '../lib/supabase';

const categoryMap = {
  all: null,
  cafe: 'KAFE',
  restaurant: 'RESTORAN',
  stationery: 'KIRTASİYE',
};

const tagColors = {
  KAFE: 'bg-indigo-50 text-indigo-600',
  BURGER: 'bg-orange-50 text-orange-600',
  KIRTASİYE: 'bg-amber-50 text-amber-600',
  'OYUN SALONU': 'bg-violet-50 text-violet-600',
  RESTORAN: 'bg-emerald-50 text-emerald-600',
};

const Venues = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('venues').select('*');
    if (!error && data) {
      setVenues(data);
    }
    setLoading(false);
  };

  const filtered = venues.filter((v) => {
    const venueName = v.name || '';
    const venueCat = v.category || '';
    const matchSearch = venueName.toLowerCase().includes(search.toLowerCase()) || venueCat.toLowerCase().includes(search.toLowerCase());
    
    // categoryMap uses uppercase categories (e.g. 'KAFE'), match with venueCat case-insensitively
    const matchCat = categoryMap[activeCategory] ? venueCat.toUpperCase() === categoryMap[activeCategory] : true;
    
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="gradient-hero pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-secondary font-bold text-sm uppercase tracking-widest mb-3"
          >
            Konya Bosna
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4"
          >
            Anlaşmalı Mekanlar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-300 text-lg mb-10 max-w-xl mx-auto"
          >
            Öğrenci kartınla indirim kazanabileceğin tüm mekanlar burada.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto flex gap-3"
          >
            <div className="flex-1 flex items-center bg-white rounded-xl border border-white/20 shadow-lg shadow-black/10 overflow-hidden focus-within:ring-2 focus-within:ring-white/40 transition-all duration-200">
              <div className="pl-4 pr-3 shrink-0 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mekan veya kategori ara..."
                className="flex-1 py-3.5 pr-4 font-medium text-dark outline-none placeholder:text-slate-400 bg-transparent text-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Sonuç bulunamadı.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((venue, index) => {
              const categoryUpper = (venue.category || '').toUpperCase();
              return (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="card p-6 group cursor-pointer"
                >
                  {/* Discount badge */}
                  <div className="flex justify-between items-start mb-5">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColors[categoryUpper] || 'bg-slate-100 text-slate-600'}`}>
                      {venue.category || 'Mekan'}
                    </span>
                    <span className="text-lg font-black text-secondary">%15</span>
                  </div>

                  <h3 className="text-xl font-black text-dark mb-2 group-hover:text-primary transition-colors">{venue.name}</h3>

                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-5">
                    <MapPin size={14} />
                    <span>{venue.address || 'Bosna Hersek'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={15} fill="currentColor" />
                      <span className="text-sm font-bold text-dark">{venue.rating || '4.5'}</span>
                    </div>
                    <button className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
                      Detay <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Venues;
