import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const VerifyStudent = () => {
  const [file, setFile] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null); // 'onaylandi', 'bekliyor'
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(''); // Doğrulama durum mesajı
  const [error, setError] = useState('');

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
    if (!fileObj) return;
    setLoading(true); setError('');
    try {
      const savedApplicant = JSON.parse(sessionStorage.getItem('kampuspay.comlicant') || '{}');

      // 1. Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: savedApplicant.email,
        password: savedApplicant.password,
        options: {
          data: {
            role: 'student',
            full_name: savedApplicant.name,
            university: savedApplicant.university
          }
        }
      });

      if (authError) throw authError;

      // 2. Kartı Storage'a yükle
      const ext = fileObj.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('student-cards').upload(fileName, fileObj, { contentType: fileObj.type });
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('student-cards').getPublicUrl(fileName);

      setAiStatus('Belgeniz taranıyor...');
      
      // 3. Akıllı Doğrulama ile Onay (Gemini Vision API)
      let finalStatus = 'bekliyor';
      try {
        const verifyRes = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: urlData.publicUrl,
            name: savedApplicant.name,
            university: savedApplicant.university
          })
        });

        const verifyResult = await verifyRes.json();
        
        if (verifyRes.ok) {
          if (verifyResult.valid) {
            finalStatus = 'onaylandi';
          } else {
            throw new Error(verifyResult.reason || 'Kimlik doğrulanamadı, lütfen daha net bir belge yükleyin.');
          }
        } else {
          console.warn('AI Verification Error:', verifyResult.error);
          throw new Error(verifyResult.error || 'Doğrulama sunucusuna şu anda ulaşılamıyor.');
        }
      } catch (aiErr) {
        throw new Error(aiErr.message.includes('Sistem') ? aiErr.message : 'Belge doğrulama sürecinde bir aksaklık oldu. Lütfen tekrar deneyin.');
      }

      setAiStatus('Sisteme kaydediliyor...');

      // 4. Başvuru tablosuna ekle
      const { error: dbError } = await supabase.from('applications').insert([{
        auth_id: authData.user?.id, // Auth user ID'sini buraya kaydediyoruz
        name: savedApplicant.name || 'Belirtilmedi',
        phone: savedApplicant.phone || 'Belirtilmedi',
        email: savedApplicant.email || null,
        university: savedApplicant.university || 'Belirtilmedi',
        card_url: urlData.publicUrl,
        status: finalStatus,
      }]);
      
      if (dbError) throw dbError;
      
      sessionStorage.removeItem('kampuspay.comlicant');
      setSubmitStatus(finalStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAiStatus('');
    }
  };

  if (submitStatus) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12 text-center max-w-md w-full">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${submitStatus === 'onaylandi' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
            {submitStatus === 'onaylandi' ? <CheckCircle size={36} /> : <Clock size={36} />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter mb-3">
            {submitStatus === 'onaylandi' ? 'Hesabınız Onaylandı!' : 'İnceleniyor'}
          </h2>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium">
            {submitStatus === 'onaylandi' 
               ? 'Öğrenci belgeniz akıllı sistemimiz tarafından saniyeler içinde başarıyla doğrulandı. Artık indirimleri kullanmaya başlayabilirsiniz.'
               : 'Öğrenci kartınız sistemimize yüklendi. Ekibimiz 24 saat içinde belgenizi inceleyip hesabınızı aktif edecek.'}
          </p>
          <Link to="/" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
            <CheckCircle size={18} /> Ana Sayfaya Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Son Adım</span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter mt-4 mb-3">Öğrenci Kartını Yükle</h1>
          <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">Akıllı doğrulama sistemimiz belgenizi tarayarak saniyeler içinde hesabınızı aktifleştirecektir.</p>
        </div>
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-8">
          <label htmlFor="id-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            className={`block w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
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

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mt-4 text-sm font-medium">
              <AlertCircle size={15} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!file || loading}
            className={`mt-6 w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              file && !loading ? 'bg-primary text-slate-900 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {loading ? <><Loader size={16} className="animate-spin" /> {aiStatus || 'Yükleniyor...'} </>
              : <><CheckCircle size={16} />{file ? 'Kartı Gönder ve Onayla' : 'Önce Kart Yükleyin'}</>}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">Akıllı doğrulama sistemimiz KVKK kurallarına uygun olarak belgenizi tarar ve verilerinizi kaydetmeden doğrular.</p>
      </motion.div>
    </div>
  );
};

export default VerifyStudent;
