import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => (
  <div className="min-h-screen bg-background py-16 px-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
      <div className="mb-10">
        <span className="text-primary font-bold text-sm uppercase tracking-widest">Yasal</span>
        <h1 className="text-4xl font-black tracking-tight mt-2 mb-3">Kullanım Koşulları</h1>
        <p className="text-slate-500 text-sm">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-12">
        {[
          {
            title: '1. Hizmetin Kapsamı',
            content: `Üni Pay, Konya Bosna bölgesindeki üniversite öğrencilerine yönelik anlaşmalı işletmelerde indirim imkânı sunan bir platformdur. Platform yalnızca geçerli öğrenci kimlik belgesiyle doğrulanmış kullanıcılara açıktır.`,
          },
          {
            title: '2. Üyelik Koşulları',
            content: `Platforma kaydolabilmek için:

• Türkiye'de bir üniversitede kayıtlı öğrenci olmanız gerekmektedir.
• Geçerli ve güncel bir öğrenci kimlik belgesi sunmanız zorunludur.
• 18 yaşından küçük kullanıcıların ebeveyn/vasi onayı alması gerekmektedir.
• Bir kullanıcı adına yalnızca bir hesap açılabilir. Çoklu hesap oluşturma yasaktır.`,
          },
          {
            title: '3. Kullanıcı Yükümlülükleri',
            content: `Üni Pay kullanıcıları aşağıdaki kurallara uymayı kabul eder:

• Sahte veya başkasına ait belge yüklemek kesinlikle yasaktır ve hukuki sonuçlar doğurabilir.
• İndirim QR kodu yalnızca hesap sahibi tarafından kullanılabilir; üçüncü kişilerle paylaşılamaz.
• Platformu kötüye kullanmak, sistemi kandırmaya çalışmak veya indirim hakkını haksız yollarla elde etmek hesabın kalıcı olarak askıya alınmasına neden olur.
• Üni Pay'e zarar verecek nitelikte eylemlerden kaçınılmalıdır.`,
          },
          {
            title: '4. Üni Pay\'in Hakları',
            content: `Üni Pay aşağıdaki hakları saklı tutar:

• Herhangi bir bildirimde bulunmaksızın platform özelliklerini değiştirme, kısıtlama veya sonlandırma hakkı.
• Kurallara aykırı davranan kullanıcıların hesabını askıya alma veya kalıcı olarak silme hakkı.
• Anlaşmalı işletme listesini önceden bildirmeksizin güncelleme hakkı.
• Doğrulama belgelerini yetkisiz kullanım şüphesi durumunda inceleme hakkı.`,
          },
          {
            title: '5. İndirimler ve İşletmeler',
            content: `• İndirim oranları, işletmeler tarafından belirlenir ve Üni Pay tarafından garanti edilmez.
• İşletmelerin anlaşmayı sonlandırması durumunda söz konusu mekanda indirim hakkı geçerliliğini yitirir.
• Üni Pay, işletmelerin sunduğu ürün veya hizmet kalitesinden sorumlu tutulamaz.
• İndirimler nakit iade veya başka bir değere dönüştürülemez.`,
          },
          {
            title: '6. Sorumluluk Sınırlaması',
            content: `Üni Pay, platformun kullanımından doğabilecek dolaylı, tesadüfi veya özel zararlardan sorumlu tutulamaz. Platform "olduğu gibi" sunulmaktadır ve sürekli erişim garanti edilmemektedir.`,
          },
          {
            title: '7. Değişiklikler',
            content: `Üni Pay, işbu kullanım koşullarını önceden bildirim yapmaksızın güncelleme hakkını saklı tutar. Güncel koşullar her zaman platform üzerinde yayınlanacaktır. Platformu kullanmaya devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.`,
          },
          {
            title: '8. Uygulanacak Hukuk',
            content: `Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlık halinde Konya mahkemeleri yetkilidir.`,
          },
          {
            title: '9. İletişim',
            content: `Kullanım koşullarına ilişkin sorularınız için:\n\n**E-posta:** info@unipay.app\n**Instagram:** @unipay.com.tr`,
          },
        ].map((section, i) => (
          <div key={i} className={i !== 0 ? 'mt-8 pt-8 border-t border-slate-100' : ''}>
            <h2 className="text-xl font-black text-dark mb-3">{section.title}</h2>
            <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {section.content.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default Terms;
