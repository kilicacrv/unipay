import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Users, Store, MapPin, BarChart2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pt-20 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[5rem] z-30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-dark shadow-sm">Ü</div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Yönetim Paneli</h1>
                <p className="text-xs text-slate-500 font-medium">Kampüs Pay Kontrol Merkezi</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-[10rem] z-20 py-4 px-4 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link 
            to="/admin"
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${location.pathname === '/admin' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            <Users size={14} /> Başvurular
          </Link>
          <Link 
            to="/admin/venues"
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${location.pathname.includes('/admin/venues') ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            <MapPin size={14} /> Mekan Yönetimi
          </Link>
          <Link 
            to="/admin/analytics"
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${location.pathname.includes('/admin/analytics') ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            <BarChart2 size={14} /> Analitik
          </Link>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
