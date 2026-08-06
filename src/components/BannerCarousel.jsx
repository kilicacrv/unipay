import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';

import { supabase } from '../lib/supabase';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (!error && data && data.length > 0) {
      setBanners(data);
    }
  };

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleDragEnd = (e, { offset, velocity }) => {
    if (banners.length <= 1) return;
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (swipe > swipeConfidenceThreshold) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  if (banners.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6 -mb-6 relative z-20">
      <div className="relative h-[220px] md:h-[280px] rounded-[2rem] overflow-hidden bg-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group cursor-grab active:cursor-grabbing">
        
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0">
              <img 
                src={banners[currentIndex].image_url} 
                alt={banners[currentIndex].title}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentIndex].color_from} ${banners[currentIndex].color_to} opacity-90 mix-blend-multiply pointer-events-none`} />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pointer-events-none">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <span className="text-white/90 font-black tracking-widest text-[10px] md:text-xs uppercase bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                  Flaş Fırsat
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-1 md:mb-2">
                {banners[currentIndex].title}
              </h2>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-lg md:text-xl font-bold text-white/90 mb-1">
                    {banners[currentIndex].subtitle}
                  </p>
                  <p className="text-sm text-white/70 line-clamp-1 max-w-lg hidden md:block">
                    {banners[currentIndex].description}
                  </p>
                </div>
                
                <Link 
                  to={banners[currentIndex].link_url || '/mekanlar'}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:scale-105 transition-all shadow-xl shadow-black/20 w-max shrink-0 pointer-events-auto"
                  draggable={false}
                >
                  Hemen Keşfet <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute top-4 right-6 flex gap-1.5 z-30">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default BannerCarousel;
