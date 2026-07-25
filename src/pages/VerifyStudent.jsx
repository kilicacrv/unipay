import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const VerifyStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [appRecord, setAppRecord] = useState(null);
  
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('Selçuk Üniversitesi');
  
  const [file, setFile] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  
  const [submitStatus, setSubmitStatus] = useState(null); // 'onaylandi', 'bekliyor'
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isExpired = location.state?.expired;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (appData) {
        setAppRecord(appData);
        if (appData.phone && appData.phone !== 'Belirtilmedi') setPhone(appData.phone);
        if (appData.university && appData.university !== 'Belirtilmedi') setUniversity(appData.university);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(URL.createObjectURL(selected)); setFileObj(selected); setError(''); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) { setFile(URL.createObjectURL(dropped)); setFileObj(dropped); setError(''); }
  };

  const handleSubmit = async () => {
    if (!fileObj) {
      setError('Lütfen öğrenci belgenizi yükleyin.');
      return;
    }
    
    if (!phone || phone.length < 10) {
      setError('Lütfen geçerli bir telefon numarası girin.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      // Kartı Storage'a yükle
      const ext = fileObj.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('student-cards').upload(fileName, fileObj, { contentType: fileObj.type });
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('student-cards').getPublicUrl(fileName);

      const finalStatus = 'bekliyor';

      if (appRecord) {
        // Güncelle
        const { error: updateError } = await supabase.from('applications')
          .update({
            phone: phone,
            university: university,
            card_url: urlData.publicUrl,
            status: finalStatus,
            approved_at: null // Reset approval time if they are re-applying
          })
          .eq('id', appRecord.id);
        if (updateError) throw updateError;
      } else {
        // Yeni Kayıt (Örn: Google ile gelmiş ve application kaydı yok)
        const { error: insertError } = await supabase.from('applications').insert([{
          auth_id: user.id,
          name: user.user_metadata?.full_name || 'Öğrenci',
          phone: phone,
          email: user.email,
          university: university,
          card_url: urlData.publicUrl,
          status: finalStatus,
        }]);
        if (insertError) throw insertError;
      }
      
      setSubmitStatus(finalStatus);
    } catch (err) {
      setError(`İşlem başarısız: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 px-4 flex flex-col items-center">
        <Loader size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (submitStatus) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-32 pb-16 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Clock size={36} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter mb-3">İnceleniyor</h2>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium">
            Öğrenci kartınız sistemimize yüklendi. Ekibimiz en kısa sürede belgenizi inceleyip aktivasyonunuzu tamamlayacak.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Fırsatları İncelemeye Devam Et
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-32 pb-16 px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-lg">
        
        {isExpired && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">
              Öğrenci onayınızın 1 yıllık süresi dolmuş. Lütfen indirimleri kullanmaya devam etmek için güncel öğrenci belgenizi yükleyerek tekrar aktivasyon yapın.
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Son Adım</span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter mt-4 mb-3">Hesabınızı Doğrulayın</h1>
          <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
            Kampüs Pay indirimlerinden yararlanmak için son bir adım kaldı!
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-8 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Telefon Numarası</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5551234567"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Üniversite</label>
              <select 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium bg-white"
              >
                <option value="Selçuk Üniversitesi">Selçuk Üniversitesi</option>
                <option value="Necmettin Erbakan Üniversitesi">Necmettin Erbakan Üniversitesi</option>
                <option value="KTO Karatay Üniversitesi">KTO Karatay Üniversitesi</option>
                <option value="Konya Teknik Üniversitesi">Konya Teknik Üniversitesi</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Öğrenci Kartı (Zorunlu)</label>
            <label htmlFor="id-upload"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              className={`block w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-primary bg-primary/10' : file ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
              {file ? (
                <div className="relative w-full h-full flex items-center justify-center p-3">
                  <img src={file} alt="Preview" className="max-h-full max-w-full rounded-xl object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg">Değiştir</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Upload size={22} className="text-primary" />
                  </div>
                  <p className="font-semibold text-dark text-sm">Dosya seç veya sürükle bırak</p>
                  <p className="text-dark/50 text-xs">JPG, PNG, PDF · Maks 5MB</p>
                </div>
              )}
              <input id="id-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mt-4 text-sm font-medium">
              <AlertCircle size={15} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Daha Sonra
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={!file || submitting}
              className={`flex-[2] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                file && !submitting ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              {submitting ? <><Loader size={16} className="animate-spin" /> Yükleniyor... </>
                : <><CheckCircle size={16} /> Gönder ve Tamamla</>}
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">Bilgileriniz KVKK kurallarına uygun olarak şifrelenir ve yalnızca öğrenci doğrulama amacıyla kullanılır.</p>
      </motion.div>
    </div>
  );
};

export default VerifyStudent;
