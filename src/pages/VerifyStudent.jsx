import React, { useState } from 'react';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const VerifyStudent = () => {
  const [file, setFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleSubmit = () => {
    if (file) setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={36} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-3">İnceleniyor</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            Öğrenci kartın sistemimize yüklendi. Ekibimiz <strong>24 saat</strong> içinde belgeni inceleyip hesabını aktif edecek.
          </p>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            Ana Sayfaya Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <span className="text-primary font-bold text-sm uppercase tracking-widest">Son Adım</span>
          <h1 className="text-4xl font-black tracking-tight mt-2 mb-3">Öğrenci Kartını Yükle</h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            Sadece üniversite öğrencilerine özel bu ağa katılmak için öğrenci kartının net bir fotoğrafını yükle.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Upload Area */}
          <label
            htmlFor="id-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`block w-full h-60 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragging ? 'border-primary bg-indigo-50' : file ? 'border-secondary bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-primary hover:bg-indigo-50'
            }`}
          >
            {file ? (
              <div className="relative w-full h-full flex items-center justify-center p-3">
                <img src={file} alt="Preview" className="max-h-full max-w-full rounded-xl object-contain" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg">Değiştir</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Upload size={22} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-dark text-sm">Dosya seç veya sürükle bırak</p>
                  <p className="text-slate-400 text-xs mt-1">JPG, PNG, PDF · Maks 5MB</p>
                </div>
              </div>
            )}
            <input id="id-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
              file
                ? 'btn-primary'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={18} />
            {file ? 'Kartı Gönder ve Bitir' : 'Önce Kart Yükleyin'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Bilgileriniz güvenle saklanır ve yalnızca doğrulama için kullanılır.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyStudent;
