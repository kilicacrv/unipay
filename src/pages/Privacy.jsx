import React from 'react';
import { motion } from 'framer-motion';

const Privacy = () => (
  <div className="min-h-screen bg-background py-16 px-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
      <div className="mb-10">
        <span className="text-primary font-bold text-sm uppercase tracking-widest">Yasal</span>
        <h1 className="text-4xl font-black tracking-tight mt-2 mb-3">Gizlilik Politikası</h1>
        <p className="text-slate-500 text-sm">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-12 prose prose-slate max-w-none">
        {[
          {
            title: '1. Toplanan Bilgiler',
            content: `Üni Pay olarak hizmetlerimizi sunabilmek amacıyla aşağıdaki bilgileri toplamaktayız:

• **Kişisel Bilgiler:** Ad, soyad, telefon numarası ve üniversite bilgisi.
• **Öğrenci Belgesi:** Öğrencilik durumunuzu doğrulamak amacıyla yüklediğiniz öğrenci kimlik kartı görüntüsü.
• **Teknik Veriler:** IP adresi, tarayıcı türü, cihaz bilgisi ve platform kullanım verileri.

Bu bilgiler yalnızca size hizmet sunmak amacıyla kullanılır.`,
          },
          {
            title: '2. Bilgilerin Kullanımı',
            content: `Toplanan bilgiler aşağıdaki amaçlarla kullanılmaktadır:

• Öğrenci kimliğinizi doğrulamak ve hesabınızı oluşturmak.
• Anlaşmalı mekanlarla indirim hakkınızı paylaşmak.
• Sistem güvenliğini sağlamak ve sahte başvuruları engellemek.
• Platform hakkında bilgilendirme ve destek amaçlı iletişim kurmak.

Bilgileriniz üçüncü taraflarla ticari amaçlarla paylaşılmaz, satılmaz veya kiralanmaz.`,
          },
          {
            title: '3. Veri Saklama',
            content: `Kişisel verileriniz, hizmetimizden yararlanmaya devam ettiğiniz süre boyunca saklanır. Hesabınızı silmeniz durumunda verileriniz 30 gün içinde sistemden kalıcı olarak silinir. Öğrenci kimliği görüntüleri, doğrulama işleminin tamamlanmasının ardından 90 gün içinde güvenli biçimde silinir.`,
          },
          {
            title: '4. Veri Güvenliği',
            content: `Verileriniz, Supabase altyapısı üzerinde endüstri standardı şifreleme (TLS/SSL) ile korunmaktadır. Kimlik belgesi görüntüleri yalnızca yetkili Üni Pay yöneticileri tarafından erişilebilir özel depolama alanında saklanır. Güvenlik açıklarının önlenmesi için sistemlerimiz düzenli olarak denetlenmektedir.`,
          },
          {
            title: '5. Çerezler',
            content: `Üni Pay, oturum yönetimi ve kullanıcı deneyimini iyileştirmek amacıyla sınırlı sayıda teknik çerez kullanabilir. Bu çerezler kişisel bilgi içermez ve pazarlama amacıyla kullanılmaz.`,
          },
          {
            title: '6. Haklarınız',
            content: `KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:

• Verilerinize erişim talep etme.
• Yanlış veya eksik verilerin düzeltilmesini isteme.
• Verilerinizin silinmesini talep etme.
• Veri işlemeye itiraz etme.

Bu haklarınızı kullanmak için info@unipay.app adresine yazabilirsiniz.`,
          },
          {
            title: '7. İletişim',
            content: `Gizlilik politikamıza ilişkin sorularınız için:\n\n**E-posta:** info@unipay.app\n**Instagram:** @unipay.com.tr`,
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

export default Privacy;
