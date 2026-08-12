import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, UserCircle, Settings, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BusinessLayout = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/business' },
    { name: 'İndirimlerim', icon: <Tag size={20} />, path: '/business/discounts' },
    { name: 'Profil', icon: <UserCircle size={20} />, path: '/business/profile' },
    { name: 'Ayarlar', icon: <Settings size={20} />, path: '/business/settings' },
  ];
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState('İşletme');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name);
            }
        };
        fetchUser();
    }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-dark text-sm">Ü</div>
          <span className="font-bold text-slate-900 tracking-tight">İşletme Paneli</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-dark text-sm">Ü</div>
            <span className="font-bold text-slate-900">İşletme</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">İşletme Paneli</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <UserCircle size={24} />
            </div>
          </div>
        </header>
        
        <main className="p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 px-2 pb-safe">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BusinessLayout;
