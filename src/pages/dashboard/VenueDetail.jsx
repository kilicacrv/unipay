import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Smartphone, AtSign, Clock, Tag, Navigation, Share2, Loader2, Heart, MessageSquare, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [venue, setVenue] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasVisited, setHasVisited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    setLoading(true);
    // Fetch Venue
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (!venueError) setVenue(venueData);

    // Fetch Discounts
    const { data: discountData, error: discountError } = await supabase
      .from('discounts')
      .select('*')
      .eq('venue_id', id)
      .eq('is_active', true);

    if (!discountError) setDiscounts(discountData);

    // Fetch Reviews
    const { data: revData } = await supabase
      .from('reviews')
      .select('*')
      .eq('venue_id', id)
      .order('created_at', { ascending: false });
    if (revData) setReviews(revData);

    // Fetch Favorite Status & Visit Status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: favData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('venue_id', id)
        .single();
      setIsFavorite(!!favData);

      const { data: visitData } = await supabase
        .from('visits')
        .select('id')
        .eq('user_id', user.id)
        .eq('venue_id', id)
        .eq('status', 'onaylandi')
        .limit(1);
      
      setHasVisited(visitData && visitData.length > 0);
    } else {
      setCurrentUser(null);
    }

    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert('Favorilere eklemek için Kampüs Pay\'e giriş yapmalısınız.');
      navigate('/kayit');
      return;
    }

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('venue_id', id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: currentUser.id, venue_id: id });
      setIsFavorite(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.rating) return;
    
    await supabase.from('reviews').insert({
      venue_id: id,
      user_id: currentUser.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    });
    
    setShowReviewForm(false);
    setReviewForm({ rating: 5, comment: '' });
    fetchVenueDetails(); // Refresh details
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : venue?.rating || '5.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Detaylar Yükleniyor...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 font-bold mb-4">Mekan bulunamadı.</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold underline">Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 font-sans">
      {/* Image Gallery / Hero */}
      <div className="relative h-[45vh] bg-slate-100 overflow-hidden">
        <img src={venue.image_url || 'https://via.placeholder.com/800x600?text=Mekan'} className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000" alt={venue.name} />
        
        {/* Header Actions */}
        <div className="absolute top-8 inset-x-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all shadow-2xl"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button 
              onClick={toggleFavorite}
              className={`w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 transition-all shadow-2xl ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
            <button className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all shadow-2xl">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Floating Info Overlay */}
        <div className="absolute -bottom-1 inset-x-0 p-6 pt-20 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-dark text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{venue.category}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">{averageRating}</span>
                </div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{venue.name}</h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
             {venue.address || 'Bosna Hersek Mahallesi, Konya'}
          </p>
        </div>
      </div>

      <main className="p-6 space-y-10 max-w-lg mx-auto">
        {/* Actions Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          <button 
            onClick={() => {
              if (venue.google_maps_url) {
                window.open(venue.google_maps_url, '_blank');
              } else if (venue.lat && venue.lng) {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`, '_blank');
              } else if (venue.address) {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.address)}`, '_blank');
              }
            }}
            className="flex-1 min-w-[140px] bg-primary text-dark py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,214,0,0.3)] hover:scale-105 transition-all"
          >
            <Navigation size={18} strokeWidth={2.5} /> Yol Tarifi
          </button>
          {venue.phone && (
            <button 
              onClick={() => window.open(`tel:${venue.phone}`, '_self')}
              className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-all shrink-0"
            >
              <Smartphone size={22} />
            </button>
          )}
          {venue.instagram && (
            <button 
              onClick={() => window.open(`https://instagram.com/${venue.instagram.replace('@', '')}`, '_blank')}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm active:scale-90 transition-all shrink-0 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600"
            >
              <AtSign size={22} />
            </button>
          )}
        </div>

        {/* Discounts Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Aktif İndirimler
            </h2>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{discounts.length} FIRSAT</span>
          </div>
          <div className="space-y-4">
            {discounts.length > 0 ? discounts.map(discount => (
              <div key={discount.id} className="group bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 opacity-80">Öğrenciye Özel</p>
                  <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">{discount.title}</h3>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-3xl font-black text-white leading-none">%{discount.rate}</p>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter mt-1">İNDİRİM</p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              </div>
            )) : (
              <p className="text-sm font-bold text-slate-400 text-center py-6">Bu mekan için şu an aktif bir indirim bulunmuyor.</p>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-200 rounded-full" />
            İletişim & Konum
          </h2>
          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100 shadow-inner">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adres</p>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">{venue.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Çalışma Saatleri</p>
                <p className="text-sm font-bold text-slate-600">Her gün: <span className="text-slate-900">{venue.hours}</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
              Öğrenci Yorumları
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviews.length} YORUM</span>
          </div>

          {hasVisited && !showReviewForm && (
            <button 
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors mb-6"
            >
              <MessageSquare size={18} /> Değerlendirme Yaz
            </button>
          )}

          {showReviewForm && (
            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white mb-6 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <button onClick={() => setShowReviewForm(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={20} />
              </button>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Puanınız</h3>
              <div className="flex gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <Star 
                    key={star} 
                    size={28} 
                    className={`cursor-pointer transition-colors ${reviewForm.rating >= star ? 'text-amber-500' : 'text-white/20'}`} 
                    fill={reviewForm.rating >= star ? "currentColor" : "none"}
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                  />
                ))}
              </div>
              <textarea 
                placeholder="Mekan hakkında ne düşünüyorsunuz?"
                className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary mb-4 min-h-[100px]"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
              />
              <button 
                onClick={handleSubmitReview}
                className="w-full bg-primary text-dark py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <Send size={16} /> Gönder
              </button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                      <Star size={14} className="text-emerald-500" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Doğrulanmış Öğrenci</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(review.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{review.comment}</p>
                )}
              </div>
            )) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-100">
                <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Henüz Yorum Yok</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">İlk yorumu yapan sen ol!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating CTA */}
      <div className="fixed bottom-8 inset-x-6 z-50 max-w-lg mx-auto">
        <button 
          onClick={() => {
            if (!currentUser) {
              alert('İndirimi kullanmak için Kampüs Pay\'e ücretsiz kayıt olun.');
              navigate('/kayit');
            } else {
              const searchParams = new URLSearchParams(location.search);
              const ref = searchParams.get('ref');
              navigate(`/dashboard/scan${ref ? `?ref=${ref}` : ''}`);
            }
          }}
          className="w-full bg-slate-950 text-white py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10 group"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Tag size={20} className="text-primary" strokeWidth={2.5} />
          </div>
          Hemen İndirimini Al
        </button>
      </div>
    </div>
  );
};

export default VenueDetail;
