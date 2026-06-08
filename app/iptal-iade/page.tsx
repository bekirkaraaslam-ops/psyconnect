import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İptal ve İade Koşulları — Seansify',
  description: 'Seansify abonelik iptali ve iade politikası.',
}

export default function IptalIadePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
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
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#4a7c6f' }}>İptal ve İade Koşulları</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Son güncelleme: 21 Mayıs 2026</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#334155' }}>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>1. Genel Bilgi</h2>
            <p className="mb-3">
              Seansify, Türkiye'de faaliyet gösteren bir SaaS (yazılım hizmeti) platformudur. Hizmet tamamen
              dijital ortamda sunulmakta olup 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
              Sözleşmeler Yönetmeliği kapsamındaki yükümlülükler bu sayfada açıklanmaktadır.
            </p>
            <p>
              Seansify abonelikleri, mesleki kullanım amaçlı ticari nitelikli sözleşmelerdir. Yine de aşağıdaki
              koşullar şeffaflık ilkesi doğrultusunda kullanıcılarımızla paylaşılmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>2. Abonelik İptali</h2>
            <ul className="space-y-3 list-disc list-inside ml-2">
              <li>
                Aboneliğinizi istediğiniz zaman, herhangi bir taahhüt veya ceza olmaksızın iptal edebilirsiniz.
              </li>
              <li>
                İptal işlemi mevcut fatura döneminin sonunda geçerli hale gelir. İptal tarihinden sonraki döneme
                ait ücret tahsil edilmez.
              </li>
              <li>
                İptal sırasında aktif abonelik dönemin geri kalanı boyunca platforma erişiminiz kesintisiz devam eder.
              </li>
              <li>
                Abonelik dönemi sona erdikten sonra hesabınız 30 gün boyunca salt okunur modda tutulur; bu süre
                içinde verilerinizi (hasta kayıtları, seans notları vb.) dışa aktarabilirsiniz.
              </li>
              <li>
                30 günlük saklama süresi sonunda hesap ve ilgili veriler kalıcı olarak silinir.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>3. Cayma Hakkı</h2>
            <p className="mb-3">
              Mesafeli Sözleşmeler Yönetmeliği uyarınca, dijital içerik ve hizmet aboneliklerinde tüketicinin
              açık onayıyla hizmetin ifasına başlanması halinde cayma hakkı kullanılamaz.
            </p>
            <p className="mb-3">
              Seansify'a abone olurken ödeme adımında "Hizmetin hemen başlamasını ve cayma hakkımın
              sona ermesini onaylıyorum" şeklinde açık onay alınmaktadır. Bu onay verildikten sonra cayma hakkı
              kullanılamaz.
            </p>
            <p>
              Bununla birlikte, hizmetin ilk 48 saatinde teknik bir nedenden dolayı hiç kullanamadıysanız
              <a href="mailto:destek@seansify.com" className="underline ml-1" style={{ color: '#4a7c6f' }}>destek@seansify.com</a>'a
              başvurarak değerlendirme talebinde bulunabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>4. İade Koşulları</h2>
            <p className="mb-3">Aşağıdaki durumlarda ücret iadesi yapılmaz:</p>
            <ul className="space-y-2 list-disc list-inside ml-2 mb-4">
              <li>Abonelik döneminin başlamasının ardından yapılan iptal talepleri</li>
              <li>Hizmetin kullanılmamış olması (sisteme giriş yapılmamış olsa dahi)</li>
              <li>WhatsApp API değişikliklerinden kaynaklanan geçici kesintiler</li>
              <li>Kullanıcı hatası veya ihmalinden doğan sorunlar</li>
            </ul>
            <p className="mb-3">Aşağıdaki durumlarda kısmi veya tam iade değerlendirilebilir:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>
                Seansify kaynaklı teknik bir arıza nedeniyle hizmetin 72 saatten uzun süre erişilemez
                hale gelmesi
              </li>
              <li>
                Çift ödeme veya sistem hatası kaynaklı hatalı tahsilat
              </li>
            </ul>
            <p className="mt-4">
              İade talepleri{' '}
              <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a>
              {' '}adresine iletilmelidir. Talepler en geç 5 iş günü içinde yanıtlanır. Onaylanan iadeler,
              ödeme yapılan yönteme bağlı olarak 5–14 iş günü içinde gerçekleştirilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>5. Plan Değişikliği</h2>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>
                Daha üst bir plana geçiş anlık olarak etkinleşir; fark tutarı o ayki dönem üzerinden orantılı
                biçimde hesaplanır.
              </li>
              <li>
                Daha alt bir plana geçiş mevcut dönem sonunda geçerli olur; aktif dönem için iade yapılmaz.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>6. Ücretsiz Deneme</h2>
            <p>
              Seansify'ın sunduğu ücretsiz deneme süresi kapsamında herhangi bir ücret tahsil edilmez.
              Deneme süresi sona ermeden önce aboneliği iptal etmeniz halinde ücretlendirilmezsiniz.
              Deneme süresi sonunda otomatik olarak ücretli aboneliğe geçiş yapılır; bu geçiş öncesinde
              e-posta ile bildirim gönderilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>7. İletişim</h2>
            <p>
              İptal, iade veya fatura konularındaki sorularınız için:{' '}
              <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a>
            </p>
            <p className="mt-2" style={{ color: '#64748b' }}>
              Yanıt süresi: iş günlerinde en geç 24 saat.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t mt-16" style={{ borderColor: '#e2eae7' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#94a3b8' }}>© 2026 Seansify. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/gizlilik" className="text-xs" style={{ color: '#64748b' }}>Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="text-xs" style={{ color: '#64748b' }}>Kullanım Koşulları</Link>
            <Link href="/iptal-iade" className="text-xs" style={{ color: '#4a7c6f' }}>İptal ve İade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
