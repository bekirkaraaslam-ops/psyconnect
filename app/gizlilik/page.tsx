import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Seansify',
  description: 'Seansify KVKK uyumlu gizlilik politikası ve kişisel veri işleme aydınlatma metni.',
}

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                <rect x="6" y="11" width="28" height="10" rx="3" fill="white" fillOpacity="0.3" />
                <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
              </svg>
            </div>
            <span className="font-semibold text-base" style={{ color: '#0d1f18' }}>Seansify</span>
          </Link>
          <Link href="/" className="text-sm" style={{ color: '#64748b' }}>Ana Sayfa</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#4a7c6f' }}>Gizlilik Politikası</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Son güncelleme: 17 Mayıs 2026 — KVKK Uyumlu Aydınlatma Metni</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#334155' }}>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu <strong>Seansify</strong>'dır.
              İletişim için: <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>2. Toplanan Kişisel Veriler</h2>
            <p className="mb-3">Seansify platformunu kullanırken aşağıdaki kişisel veriler işlenmektedir:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li><strong>Kimlik verileri:</strong> Ad, soyad, kullanıcı adı</li>
              <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası, WhatsApp numarası</li>
              <li><strong>Danışan verileri:</strong> Psikolog kullanıcılar tarafından girilen danışan adı, iletişim bilgileri ve randevu kayıtları</li>
              <li><strong>Randevu verileri:</strong> Tarih, saat, seans notları, ödev kayıtları</li>
              <li><strong>Ödeme verileri:</strong> Abonelik planı bilgileri (ödeme kartı bilgileri Seansify tarafından saklanmamakta; Lemon Squeezy altyapısı üzerinden işlenmektedir)</li>
              <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, oturum verileri, kullanım istatistikleri</li>
              <li><strong>Çerez verileri:</strong> Oturum çerezleri ve tercih çerezleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>3. Veri İşleme Amaçları</h2>
            <p className="mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Hizmetin sunulması ve kullanıcı hesabının yönetimi</li>
              <li>Randevu yönetimi ve WhatsApp hatırlatıcı iletiminin gerçekleştirilmesi</li>
              <li>Abonelik ve ödeme işlemlerinin yürütülmesi</li>
              <li>Teknik destek ve müşteri hizmetlerinin sağlanması</li>
              <li>Platformun güvenliğinin ve performansının korunması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin iyileştirilmesi amacıyla anonim istatistiksel analizler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>4. Hukuki İşleme Dayanakları</h2>
            <p className="mb-3">Verileriniz KVKK Madde 5 kapsamında şu hukuki dayanaklara göre işlenmektedir:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Sözleşmenin kurulması veya ifası için zorunlu olması</li>
              <li>Meşru menfaatlerimizin korunması (güvenlik, dolandırıcılık önleme)</li>
              <li>Açık rızanız (pazarlama iletişimleri için)</li>
              <li>Yasal yükümlülüklerimizin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>5. Saklama Süreleri</h2>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li><strong>Hesap verileri:</strong> Hesap silinmesine kadar + 3 yıl (yasal yükümlülük)</li>
              <li><strong>Randevu ve seans kayıtları:</strong> Son işlemden itibaren 5 yıl</li>
              <li><strong>Ödeme kayıtları:</strong> 10 yıl (Vergi Usul Kanunu gereği)</li>
              <li><strong>Log ve teknik veriler:</strong> 6 ay</li>
              <li><strong>Çerezler:</strong> Oturum çerezleri — tarayıcı kapatılınca; tercih çerezleri — 1 yıl</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>6. Veri Aktarımı</h2>
            <p className="mb-3">Verileriniz yalnızca aşağıdaki taraflara, hizmetin sunulması için zorunlu ölçüde aktarılmaktadır:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li><strong>Supabase Inc.:</strong> Veritabanı ve kimlik doğrulama altyapısı (ABD — SCCs kapsamında)</li>
              <li><strong>Lemon Squeezy:</strong> Ödeme işleme altyapısı</li>
              <li><strong>Netlify Inc.:</strong> Uygulama barındırma hizmeti</li>
              <li><strong>Railway Corp.:</strong> WhatsApp servisi barındırma</li>
            </ul>
            <p className="mt-3">Verileriniz pazarlama amacıyla üçüncü taraflarla paylaşılmamaktadır.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>7. Çerez Politikası</h2>
            <p className="mb-3">Seansify aşağıdaki çerez türlerini kullanmaktadır:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi için gereklidir, devre dışı bırakılamaz</li>
              <li><strong>Tercih çerezleri:</strong> Kullanıcı ayarlarını hatırlamak için kullanılır</li>
              <li><strong>Analitik çerezler:</strong> Platformun nasıl kullanıldığını anlamak için kullanılır (anonim)</li>
            </ul>
            <p className="mt-3">Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; ancak zorunlu çerezlerin engellenmesi hizmetin işleyişini olumsuz etkileyebilir.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>8. KVKK Madde 11 Kapsamında Haklarınız</h2>
            <p className="mb-3">KVKK'nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>Verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini talep etme</li>
              <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini talep etme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p className="mt-3">
              Haklarınızı kullanmak için <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a> adresine yazabilirsiniz.
              Talebiniz en geç 30 gün içinde sonuçlandırılacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>9. Veri Güvenliği</h2>
            <p>
              Verileriniz 256-bit SSL şifreleme ile iletilmekte ve Supabase altyapısı üzerinde güvenli şekilde saklanmaktadır.
              Yetkisiz erişimi önlemek için teknik ve idari tedbirler alınmaktadır. Veri ihlali tespiti halinde ilgili makamlar
              ve etkilenen kişiler yasal sürelerde bilgilendirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>10. Güncellemeler</h2>
            <p>
              Bu politika zaman zaman güncellenebilir. Önemli değişiklikler e-posta ile bildirilecektir.
              Güncel politikaya her zaman bu sayfadan ulaşabilirsiniz.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t mt-16" style={{ borderColor: '#e2eae7' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#94a3b8' }}>© 2026 Seansify. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/gizlilik" className="text-xs" style={{ color: '#4a7c6f' }}>Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="text-xs" style={{ color: '#64748b' }}>Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
