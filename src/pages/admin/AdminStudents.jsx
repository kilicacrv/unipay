import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Trash2, User, Phone, MapPin, Loader2, RefreshCw } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    // Öğrencileri başvurular tablosundan "onaylandi" durumunda olanları çekiyoruz
    // student_points tablosuyla birleştiriyoruz
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'onaylandi')
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error(appsError);
      setLoading(false);
      return;
    }

    // Her öğrenci için ekstra verileri çek (points) - optimize edilebilir ama şimdilik böyle
    const authIds = apps.map(app => app.auth_id).filter(Boolean);
    let pointsMap = {};
    
    if (authIds.length > 0) {
      const { data: pointsData } = await supabase
        .from('student_points')
        .select('user_id, total_points')
        .in('user_id', authIds);
        
      if (pointsData) {
        pointsData.forEach(p => {
          pointsMap[p.user_id] = p.total_points;
        });
      }
    }

    const studentsWithPoints = apps.map(app => ({
      ...app,
      points: pointsMap[app.auth_id] || 0
    }));

    setStudents(studentsWithPoints);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu öğrencinin kaydını silmek istediğinize emin misiniz?')) return;
    
    setDeletingId(id);
    const { error } = await supabase.from('applications').delete().eq('id', id);
    
    if (error) {
      alert('Silme işleminde hata oluştu: ' + error.message);
    } else {
      setStudents(students.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Öğrenci Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Sistemde onaylanmış olan kayıtlı öğrencileri listeleyin ve yönetin.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Öğrenci, okul veya tel ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button 
            onClick={fetchStudents}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 rounded-lg transition-colors"
            title="Yenile"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Öğrenci Bilgileri</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kampüs Puan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm">Öğrenciler yükleniyor...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <User size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Öğrenci bulunamadı</p>
                    <p className="text-xs mt-1">Kriterlere uygun kayıtlı öğrenci yok.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {student.name?.charAt(0) || 'Ö'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-800">{student.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {student.university || 'Belirtilmedi'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{student.email}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-100">
                        {student.points} KP
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(student.id)}
                        disabled={deletingId === student.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        {deletingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
