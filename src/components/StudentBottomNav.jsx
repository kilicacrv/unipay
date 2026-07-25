import React from 'react';
import { Tag, Heart, MapPin, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const getNavClass = (matchPath) => {
    const isActive = path === matchPath || (matchPath !== '/dashboard' && path.startsWith(matchPath));
    if (isActive) {
      return "flex flex-col items-center justify-center w-14 h-12 rounded-2xl bg-slate-900 text-white cursor-pointer transition-transform active:scale-95 shadow-md";
    }
    return "flex flex-col items-center justify-center w-14 h-12 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-all active:scale-95";
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-100 p-2 flex justify-between items-center z-40 rounded-[2rem] shadow-2xl">
      <div onClick={() => navigate('/dashboard')} className={getNavClass('/dashboard')}>
        <Tag size={18} strokeWidth={2.5} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Fırsatlar</span>
      </div>
      <div onClick={() => navigate('/dashboard/favorites')} className={getNavClass('/dashboard/favorites')}>
        <Heart size={18} strokeWidth={2.5} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Favoriler</span>
      </div>
      <div onClick={() => navigate('/dashboard/explore')} className={getNavClass('/dashboard/explore')}>
        <MapPin size={18} strokeWidth={2.5} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Harita</span>
      </div>
      <div onClick={() => navigate('/dashboard/profile')} className={getNavClass('/dashboard/profile')}>
        <User size={18} strokeWidth={2.5} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Profil</span>
      </div>
    </div>
  );
};

export default StudentBottomNav;
