import React, { useState } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const VerifyStudent = () => {
  const [file, setFile] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const ext = fileObj.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('student-cards').upload(fileName, fileObj, { contentType: fileObj.type });
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from('student-cards').getPublicUrl(fileName);
      const savedApplicant = JSON.parse(sessionStorage.getItem('kampuspay.comlicant') || '{}');

      const { error: dbError } = await supabase.from('applications').insert([{
        name: savedApplicant.name || 'Belirtilmedi',
        phone: savedApplicant.phone || 'Belirtilmedi',
        email: savedApplicant.email || null,
        university: savedApplicant.university || 'Belirtilmedi',
        card_url: urlData.publicUrl,
        status: 'bekliyor',
      }]);
      if (dbError) throw dbError;
      sessionStorage.removeItem('kampuspay.comlicant');
      setIsSubmitted(true);
    } catch (err) {
      setError('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-dark p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={36} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-3">İnceleniyor</h2>
          <p className="text-dark/70 leading-relaxed mb-8">
            Öğrenci kartın sistemimize yüklendi. Ekibimiz <strong>24 saat</strong> içinde belgeni inceleyip hesabını aktif edecek.
          </p>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <CheckCircle size={18} /> Ana Sayfaya Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-primary font-bold text-sm uppercase tracking-widest">Son Adım</span>
          <h1 className="text-4xl font-black tracking-tight mt-2 mb-3">Öğrenci Kartını Yükle</h1>
          <p className="text-dark/70 max-w-sm mx-auto text-sm">Kartının net bir fotoğrafını yükle, ekibimiz 24 saat içinde onaylasın.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-dark p-8">
          <label htmlFor="id-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            className={`block w-full h-60 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragging ? 'border-primary bg-primary/10' : file ? 'border-dark bg-secondary/20' : 'border-dark border-2 bg-white hover:bg-primary/5 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
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
            <div className="flex items-center gap-2 bg-red-50 border border-dark text-red-600 rounded-xl px-4 py-3 mt-4 text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!file || loading}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              file && !loading ? 'btn-primary' : 'bg-dark/10 text-dark/50 cursor-not-allowed'}`}>
            {loading ? <><Loader size={16} className="animate-spin" />Yükleniyor...</>
              : <><CheckCircle size={16} />{file ? 'Kartı Gönder ve Bitir' : 'Önce Kart Yükleyin'}</>}
          </button>
        </div>
        <p className="text-center text-xs text-dark/50 mt-5">Bilgileriniz güvenle saklanır ve yalnızca doğrulama için kullanılır.</p>
      </motion.div>
    </div>
  );
};

export default VerifyStudent;
