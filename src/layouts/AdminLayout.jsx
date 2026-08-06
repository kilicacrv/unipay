import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Users, MapPin, BarChart2, LogOut, Bell, Zap, Activity, Image, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Başvurular', path: '/admin', icon: <Users size={18} /> },
    { name: 'Öğrenci Yönetimi', path: '/admin/students', icon: <Users size={18} /> },
    { name: 'Banner Yönetimi', path: '/admin/banners', icon: <Image size={18} /> },
    { name: 'Mekan Yönetimi', path: '/admin/venues', icon: <MapPin size={18} /> },
    { name: 'Analitik', path: '/admin/analytics', icon: <BarChart2 size={18} /> },
    { name: 'Flaş Kampanyalar', path: '/admin/flash-campaigns', icon: <Zap size={18} /> },
    { name: 'Duyurular', path: '/admin/notifications', icon: <Bell size={18} /> },
    { name: 'Sistem Logları', path: '/admin/logs', icon: <Activity size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans antialiased text-slate-900 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-xs">KP</div>
          <span className="font-bold text-sm">Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#ebeef1] border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50 mb-4 hidden md:flex">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-xs mr-3 shadow-sm">KP</div>
          <h1 className="text-sm font-bold tracking-tight text-slate-800">Kampüs Pay Admin</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-2">Yönetim</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.includes(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                  : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <div className={`${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User / Logout Area */}
        <div className="p-4 border-t border-slate-200/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-all"
          >
            <LogOut size={18} className="text-slate-500" /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 min-h-screen">
        {/* Shopify-style Header for the current page */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.includes(i.path)))?.name || 'Yönetim Paneli'}
            </h2>
          </div>
        </div>
        
        {/* Render Outlet */}
        <div className="pb-20">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
