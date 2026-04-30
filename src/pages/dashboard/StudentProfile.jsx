import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, GraduationCap, LogOut, ChevronRight, ShieldCheck, Bell, Zap, Star, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut, supabase } from '../../lib/supabase';

const ProfileItem = ({ icon, label, value, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-300" />
  </button>
);

const getTier = (pts) => {
  if (pts >= 200) return { name: 'Altın', color: 'text-amber-500', bg: 'bg-amber-50', icon: '🥇' };
  if (pts >= 100) return { name: 'Gümüş', color: 'text-slate-500', bg: 'bg-slate-100', icon: '🥈' };
  return { name: 'Bronz', color: 'text-orange-500', bg: 'bg-orange-50', icon: '🥉' };
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState({ name: '...', email: '...', phone: '', university: 'Selçuk Üniversitesi' });
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setStudent({
        name: user.user_metadata?.full_name || 'Öğrenci',
        email: user.email || '',
        phone: user.phone || '—',
        university: user.user_metadata?.university || 'Selçuk Üniversitesi'
      });

      const { data: pts } = await supabase
        .from('student_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();
      if (pts) setPoints(pts.total_points);

      const { data: hist } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (hist) setHistory(hist);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const tier = getTier(points);
  const nextTierPoints = points >= 200 ? 200 : points >= 100 ? 200 : 100;
  const progress = Math.min((points / nextTierPoints) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white border-b border-slate-200 p-8 text-center">
        <div className="w-24 h-24 bg-slate-900 rounded-3xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-xl">
          {student.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</h1>
        <p className="text-slate-500 font-bold text-sm mt-1">{student.university}</p>
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        {/* Points Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Sadakat Puanı</p>
                <p className="text-5xl font-black text-white tracking-tighter leading-none">{points}</p>
                <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">PUAN</p>
              </div>
              <div className={`${tier.bg} px-4 py-2 rounded-2xl flex items-center gap-2`}>
                <span className="text-xl">{tier.icon}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${tier.color}`}>{tier.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sonraki Seviye</p>
                <p className="text-[10px] font-black text-white/60">{points}/{nextTierPoints}</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16" />
        </div>

        {/* Points History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4 flex items-center gap-2">
              <History size={12} /> Puan Geçmişi
            </h2>
            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
              {history.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between p-5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Zap size={18} className="text-emerald-500" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{item.reason}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-black text-sm">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Kişisel Bilgiler</h2>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
            <ProfileItem icon={<User size={20} />} label="Tam Ad" value={student.name} />
            <ProfileItem icon={<Mail size={20} />} label="E-posta" value={student.email} />
            <ProfileItem icon={<Smartphone size={20} />} label="Telefon" value={student.phone || '—'} />
            <ProfileItem icon={<GraduationCap size={20} />} label="Üniversite" value={student.university} />
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Hesap Ayarları</h2>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm mb-6">
            <ProfileItem icon={<Bell size={20} />} label="Bildirimler" value="Açık" />
            <ProfileItem icon={<ShieldCheck size={20} />} label="Gizlilik" value="Yönet" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-rose-50 text-rose-600 p-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-100 transition-colors border border-rose-100"
        >
          <LogOut size={20} /> Çıkış Yap
        </button>
      </main>
    </div>
  );
};

export default StudentProfile;
