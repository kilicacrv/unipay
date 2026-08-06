import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, GraduationCap, LogOut, ShieldCheck, Zap, History, Edit, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut, supabase } from '../../lib/supabase';
import StudentBottomNav from '../../components/StudentBottomNav';

const getTier = (pts) => {
  if (pts >= 200) return { name: 'Altın', color: 'text-amber-500', bg: 'bg-amber-50', icon: '🥇' };
  if (pts >= 100) return { name: 'Gümüş', color: 'text-slate-500', bg: 'bg-slate-100', icon: '🥈' };
  return { name: 'Bronz', color: 'text-orange-500', bg: 'bg-orange-50', icon: '🥉' };
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState({ name: '', email: '', phone: '', university: '' });
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', university: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const currentStudent = {
        name: user.user_metadata?.full_name || 'Öğrenci',
        email: user.email || '',
        phone: user.phone || '',
        university: user.user_metadata?.university || 'Selçuk Üniversitesi'
      };
      setStudent(currentStudent);
      setEditForm(currentStudent);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        phone: editForm.phone,
        data: {
          full_name: editForm.name,
          university: editForm.university
        }
      });

      if (error) throw error;
      
      setStudent(editForm);
      setIsEditing(false);
    } catch (err) {
      alert("Bilgiler güncellenirken hata oluştu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tier = getTier(points);
  const nextTierPoints = points >= 200 ? 200 : points >= 100 ? 200 : 100;
  const progress = Math.min((points / nextTierPoints) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans relative">
      <header className="bg-white border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white text-lg font-black shadow-md">
            {student.name.charAt(0) || 'Ö'}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{student.name}</h1>
            <p className="text-slate-500 font-medium text-xs">{student.university}</p>
          </div>
        </div>
        <button 
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isEditing ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          {isEditing ? <X size={18} /> : <Edit size={18} />}
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5 mt-2">
        
        {isEditing ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Profili Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Üniversite</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={editForm.university} onChange={e => setEditForm({...editForm, university: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Telefon</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="5XXXXXXXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>

              <div className="pt-2">
                <button onClick={handleSave} disabled={saving} className="w-full bg-primary text-slate-900 font-black py-3.5 rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" /> : <><Check size={18} /> Kaydet</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Sadakat Puanı</p>
                    <p className="text-4xl font-black text-white tracking-tighter leading-none">{points}</p>
                  </div>
                  <div className={`${tier.bg} px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm`}>
                    <span className="text-sm">{tier.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>{tier.name}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sonraki Seviye</p>
                    <p className="text-[9px] font-black text-white/60">{points} / {nextTierPoints}</p>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-10 -mb-10" />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-posta</p>
                    <p className="text-sm font-bold text-slate-900">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Smartphone size={16} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telefon</p>
                    <p className="text-sm font-bold text-slate-900">{student.phone || 'Eklenmemiş'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><ShieldCheck size={16} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gizlilik</p>
                    <p className="text-sm font-bold text-slate-900">Yönet</p>
                  </div>
                </div>
              </div>

              {history.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                    <History size={12} /> Puan Geçmişi
                  </h2>
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                    {history.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                            <Zap size={14} fill="currentColor" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 capitalize leading-tight">{item.reason}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>
                        <span className="text-emerald-600 font-black text-xs">+{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-white text-rose-500 p-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors border border-slate-200 shadow-sm mt-4"
            >
              <LogOut size={16} /> Çıkış Yap
            </button>
          </>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
};

export default StudentProfile;
