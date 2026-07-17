import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Loader2, CheckCircle, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ManageDiscounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    rate: '',
    is_active: true,
  });

  useEffect(() => {
    fetchBusinessVenue();
  }, []);

  // Find the venue belonging to this business user
  const fetchBusinessVenue = async () => {
    setFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Look up the business_applications table to find user's venue
    const { data: bizApp } = await supabase
      .from('business_applications')
      .select('business_name')
      .eq('user_id', user.id)
      .eq('status', 'onaylandi')
      .single();

    if (bizApp) {
      // Match venue by business name
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name')
        .ilike('name', `%${bizApp.business_name}%`)
        .single();

      if (venue) {
        setVenueId(venue.id);
        fetchDiscounts(venue.id);
      } else {
        setFetching(false);
      }
    } else {
      setFetching(false);
    }
  };

  const fetchDiscounts = async (vid) => {
    setFetching(true);
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('venue_id', vid)
      .order('created_at', { ascending: false });
    if (!error) setDiscounts(data);
    setFetching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venueId) {
      alert('Mekanınız henüz sisteme eklenmemiş. Lütfen admin ile iletişime geçin.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('discounts').insert({
        title: formData.title,
        rate: formData.rate,
        is_active: formData.is_active,
        venue_id: venueId,
      });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setFormData({ title: '', rate: '', is_active: true });
        fetchDiscounts(venueId);
      }, 1800);
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (discount) => {
    const { error } = await supabase
      .from('discounts')
      .update({ is_active: !discount.is_active })
      .eq('id', discount.id);
    if (!error) fetchDiscounts(venueId);
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm('Bu indirimi silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('discounts').delete().eq('id', id);
    if (!error) fetchDiscounts(venueId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İndirim Yönetimi</h1>
          <p className="text-slate-500 font-medium">Aktif kampanyalarınızı yönetin ve yenilerini ekleyin.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} /> Yeni İndirim Ekle
        </button>
      </div>

      {/* No Venue Warning */}
      {!fetching && !venueId && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex items-start gap-4">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Mekanınız Henüz Sistemde Yok</h3>
            <p className="text-amber-700 text-sm font-medium leading-relaxed">
              İndirim ekleyebilmek için mekanınızın admin tarafından platforma eklenmesi gerekiyor. 
              Lütfen admin ile iletişime geçin.
            </p>
          </div>
        </div>
      )}

      {/* Discounts Grid */}
      {fetching ? (
        <div className="py-20 flex flex-col items-center opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div key={discount.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm group hover:shadow-xl transition-all">
              <div className="p-8 bg-slate-900 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-2">Öğrenciye Özel</p>
                  <h3 className="font-bold text-white text-lg leading-tight mb-4">{discount.title}</h3>
                  <span className="text-4xl font-black text-white tracking-tighter leading-none">%{discount.rate}</span>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              </div>
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(discount)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${discount.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${discount.is_active ? 'left-7' : 'left-1'}`} />
                  </button>
                  <span className={`text-xs font-black uppercase tracking-widest ${discount.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {discount.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <button
                  onClick={() => deleteDiscount(discount.id)}
                  className="w-10 h-10 bg-rose-50 text-rose-300 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!fetching && discounts.length === 0 && venueId && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Tag size={40} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Henüz İndirim Eklemediniz</h3>
              <p className="text-slate-400 font-medium text-sm mb-6">İlk kampanyanızı oluşturun, öğrencilere özel avantajlar sunun.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
              >
                İlk İndirimimi Ekle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Form */}
      {showForm && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Yeni İndirim Oluştur</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">İndirim Eklendi!</h3>
                  <p className="text-slate-500 font-medium">Kampanyanız yayında.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kampanya Başlığı</label>
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none"
                      placeholder="Örn: Tüm Kahvelerde Geçerli İndirim"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">İndirim Oranı (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 outline-none"
                      placeholder="Örn: 20"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Hemen Yayınla</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ekledikten sonra anında aktif olsun</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`w-14 h-7 rounded-full relative transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.is_active ? 'left-8' : 'left-1.5'}`} />
                    </button>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Tag size={18} />}
                      Yayınla
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDiscounts;
