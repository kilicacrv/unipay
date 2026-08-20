import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, X, ArrowLeft, MapPin, Loader2, ImagePlus, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { venueId, venueName, discountRate, visitId } = state;

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!venueId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white p-4 flex items-center shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold ml-2 text-gray-900">Yeni Gönderi</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6"
          >
            <QrCode className="w-10 h-10 text-yellow-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Gönderi Oluşturulamıyor</h2>
          <p className="text-gray-600 mb-8 max-w-sm">
            Gönderi oluşturmak için önce bir mekanda QR okutmalısın. İndirim kazandıktan sonra deneyimini paylaşabilirsin!
          </p>
          <button
            onClick={() => navigate('/dashboard/qr')}
            className="bg-[#FFD600] text-gray-900 px-8 py-4 rounded-xl font-bold text-lg w-full max-w-sm shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <QrCode className="w-6 h-6" />
            QR Okutucuya Git
          </button>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Resim boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Lütfen bir fotoğraf seçin.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açmanız gerekiyor.');

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Kullanıcı';

      // 1. Upload image
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      // 3. Insert post
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          venue_id: venueId,
          visit_id: visitId,
          image_url: publicUrl,
          caption: caption.trim(),
          venue_name: venueName,
          discount_rate: discountRate,
          user_name: userName
        });

      if (insertError) throw insertError;

      navigate('/dashboard/kesfet');
    } catch (err) {
      console.error('Gönderi paylaşılırken hata:', err);
      setError(err.message || 'Gönderi paylaşılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold ml-2 text-gray-900">Yeni Gönderi</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col max-w-lg w-full mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Venue Badge */}
        <div className="mb-6 flex">
          <div className="bg-[#FFD600] bg-opacity-20 text-[#B39500] px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="w-4 h-4" />
            {venueName} <span className="opacity-70 mx-1">•</span> %{discountRate}
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          
          {previewUrl ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-square bg-black shadow-sm"
            >
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#FFD600] transition-colors bg-white group"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFD600] group-hover:bg-opacity-10 transition-colors">
                <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-[#FFD600] transition-colors" />
              </div>
              <span className="font-medium text-gray-600">Fotoğraf Seç veya Çek</span>
              <span className="text-sm text-gray-400 mt-2">Maks. 5MB</span>
            </button>
          )}
        </div>

        {/* Caption Input */}
        <div className="mb-8">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 200))}
            placeholder="Deneyimini paylaş..."
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#FFD600] focus:border-transparent transition-all"
          />
          <div className="text-right text-xs text-gray-400 mt-2 font-medium">
            {caption.length}/200
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-auto pb-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !image}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all
              ${isSubmitting || !image 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#FFD600] text-gray-900 active:scale-[0.98] hover:shadow-md'
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Paylaşılıyor...
              </>
            ) : (
              <>
                Paylaş 🚀
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
