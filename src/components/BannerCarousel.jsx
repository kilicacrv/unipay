import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
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
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (swipe > 10000) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
  };

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6 -mb-6 relative z-20">
      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] group cursor-grab active:cursor-grabbing">
        
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="w-full"
          >
            {/* ─── Desktop Layout: Yan yana ─── */}
            <div className="hidden md:flex h-[280px]">
              {/* Sol: Yazı Alanı */}
              <div className={`flex-1 bg-gradient-to-br ${banner.color_from} ${banner.color_to} p-10 flex flex-col justify-center relative overflow-hidden`}>
                {/* Dekoratif arka plan desenleri */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 w-max border border-white/20">
                    <Sparkles className="text-white w-3.5 h-3.5" />
                    <span className="text-white/95 font-black tracking-widest text-[10px] uppercase">
                      Kampüs Pay
                    </span>
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                    {banner.title}
                  </h2>
                  
                  <p className="text-base font-semibold text-white/85 mb-1">
                    {banner.subtitle}
                  </p>
                  
                  {banner.description && (
                    <p className="text-sm text-white/60 line-clamp-2 max-w-sm mb-5">
                      {banner.description}
                    </p>
                  )}
                  
                  <Link 
                    to={banner.link_url || '/mekanlar'}
                    className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3 rounded-2xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/15 w-max"
                    draggable={false}
                  >
                    Hemen Keşfet <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
              
              {/* Sağ: Görsel Alanı */}
              <div className="w-[45%] relative">
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                {/* Soldan sağa kayan gradient - görsel ile yazı arasında yumuşak geçiş */}
                <div className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r ${banner.color_from} ${banner.color_to} opacity-90`} style={{maskImage: 'linear-gradient(to right, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, black, transparent)'}} />
              </div>
            </div>

            {/* ─── Mobil Layout: Üstte Görsel, Altta Yazı ─── */}
            <div className="md:hidden flex flex-col">
              {/* Üst: Görsel */}
              <div className="relative h-[180px] overflow-hidden">
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                {/* Alttan yukarı kayan gradient - görsel ile yazı arasında yumuşak geçiş */}
                <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${banner.color_from} ${banner.color_to}`} style={{maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)'}} />
                
                {/* Indicators - mobilde görselin üstünde */}
                <div className="absolute top-4 right-4 flex gap-1.5 z-30">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? "w-6 bg-white shadow-md" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Alt: Yazı Alanı */}
              <div className={`bg-gradient-to-br ${banner.color_from} ${banner.color_to} p-5 pb-6 relative overflow-hidden`}>
                {/* Dekoratif daire */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full mb-3 w-max border border-white/20">
                    <Sparkles className="text-white w-3 h-3" />
                    <span className="text-white/95 font-black tracking-widest text-[9px] uppercase">
                      Kampüs Pay
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-1.5">
                    {banner.title}
                  </h2>
                  
                  <p className="text-sm font-semibold text-white/85 mb-1">
                    {banner.subtitle}
                  </p>
                  
                  {banner.description && (
                    <p className="text-xs text-white/60 line-clamp-2 mb-4">
                      {banner.description}
                    </p>
                  )}
                  
                  <Link 
                    to={banner.link_url || '/mekanlar'}
                    className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-lg shadow-black/10 text-sm w-max"
                    draggable={false}
                  >
                    Hemen Keşfet <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Desktop Indicators */}
        <div className="hidden md:flex absolute top-5 right-6 gap-1.5 z-30">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white shadow-md" : "w-1.5 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default BannerCarousel;
