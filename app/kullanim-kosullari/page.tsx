import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — Seansify',
  description: 'Seansify platform kullanım koşulları, abonelik ve hizmet şartları.',
}

export default function KullanimKosullariPage() {
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
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#4a7c6f' }}>Kullanım Koşulları</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Son güncelleme: 9 Haziran 2026</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#334155' }}>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>1. Hizmet Tanımı</h2>
            <p className="mb-3">
              Seansify, psikologlar ve ruh sağlığı uzmanları için tasarlanmış bir pratik yönetim ve danışan takip aracıdır.
              Platform; randevu yönetimi, danışan takibi, seans notları, WhatsApp hatırlatıcı sistemi ve otomatik
              randevu asistanı gibi özellikleri kapsamaktadır.
            </p>
            <p>
              Seansify, Türkiye'de faaliyet gösteren bir SaaS (yazılım hizmeti) ürünüdür. Hizmet, internet
              bağlantısı gerektiren bir web uygulaması olarak sunulmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>2. Üyelik Koşulları</h2>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Seansify'ı kullanabilmek için 18 yaşını doldurmuş olmanız gerekmektedir.</li>
              <li>Kayıt sırasında doğru ve güncel bilgi sağlamakla yükümlüsünüz.</li>
              <li>Hesabınızın güvenliğinden siz sorumlusunuz; şifrenizi kimseyle paylaşmayınız.</li>
              <li>Her kullanıcı yalnızca bir hesap oluşturabilir.</li>
              <li>Hesap bilgilerinizde yapılan yetkisiz değişiklikleri derhal bildirmelisiniz.</li>
              <li>Platform yalnızca mesleki amaçlarla kullanılabilir; kişisel sağlık danışmanlığı vermek yasaktır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>3. Abonelik ve Ödeme</h2>
            <p className="mb-3">Seansify iki abonelik planı sunmaktadır:</p>
            <ul className="space-y-2 list-disc list-inside ml-2 mb-4">
              <li><strong>Seansify One:</strong> 749 ₺/ay — Randevu yönetimi, danışan takibi ve seans notları</li>
              <li><strong>Seansify Pro:</strong> 1.850 ₺/ay — WhatsApp otomasyonu, otomatik randevu asistanı ve öncelikli destek dahil</li>
            </ul>
            <p className="mb-3">
              Ödemeler <strong>Lemon Squeezy</strong> altyapısı üzerinden güvenli biçimde işlenmektedir.
              Abonelik ücretleri aylık olarak otomatik yenilenir.
            </p>
            <p>
              Fiyatlar KDV dahildir. Seansify, fiyatları 30 gün önceden bildirerek değiştirme hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>4. İptal Politikası</h2>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Aboneliğinizi istediğiniz zaman, herhangi bir taahhüt olmaksızın iptal edebilirsiniz.</li>
              <li>İptal işlemi, mevcut fatura döneminin sonunda geçerli olur; erken iptal durumunda kalan süre için ücret iadesi yapılmaz.</li>
              <li>İptal sonrasında verilerinize 30 gün daha erişim sağlanır; bu süre içinde dışa aktarma işlemi yapabilirsiniz.</li>
              <li>Teknik bir hata veya hizmet kesintisinden kaynaklanan sorunlar için <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a> adresine başvurabilirsiniz.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>5. Yasal Yükümlülükler ve MBYS Sorumluluğu</h2>
            <p className="mb-3">
              Seansify, psikologlar ve ruh sağlığı uzmanları için geliştirilmiş bir pratik yönetim ve danışan takip aracıdır.
              Platform, T.C. Sağlık Bakanlığı tarafından zorunlu tutulan <strong>Muayene Bilgi Yönetim Sistemi (MBYS)</strong> entegrasyonunu
              sağlamamaktadır.
            </p>
            <p className="mb-3">
              MBYS kayıt yükümlülükleri ve ilgili mevzuat kapsamındaki tüm yasal sorumluluklar münhasıran
              <strong> kullanıcıya (psikolog / ruh sağlığı uzmanı)</strong> aittir. Seansify bu yükümlülükleri hiçbir şekilde üstlenmez.
            </p>
            <p>
              Kullanıcı, mesleki faaliyetlerini yürütürken T.C. Sağlık Bakanlığı başta olmak üzere ilgili tüm
              düzenleyici kurumlara karşı yasal yükümlülüklerini yerine getirmekten bizzat sorumludur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>6. Yasak Kullanımlar</h2>
            <p className="mb-3">Aşağıdaki eylemler kesinlikle yasaktır:</p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>Platformu yasa dışı amaçlarla kullanmak</li>
              <li>Başkalarının hesaplarına yetkisiz erişim sağlamaya çalışmak</li>
              <li>Otomatik araçlarla platforma aşırı yük bindirmek (scraping, DDoS vb.)</li>
              <li>Danışan verilerini izinsiz üçüncü taraflarla paylaşmak</li>
              <li>WhatsApp özelliklerini spam amaçlı kullanmak</li>
              <li>Platformu yeniden satmak veya alt lisanslama yapmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>7. Sorumluluk Sınırları</h2>
            <p className="mb-3">
              Seansify, teknik altyapının sürekliliği için azami özeni göstermekle birlikte aşağıdaki hususlarda
              sorumluluk kabul etmemektedir:
            </p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>WhatsApp API değişikliklerinden veya Meta politikalarından kaynaklanan kesintiler</li>
              <li>Kullanıcının hatalı veri girişinden doğan sonuçlar</li>
              <li>Üçüncü taraf hizmetlerinde (Supabase, Netlify, Railway) yaşanan teknik arızalar</li>
              <li>Mücbir sebep halleri (doğal afet, siber saldırı, yasal kısıtlamalar vb.)</li>
              <li>Platformun kullanılamamasından doğan dolaylı veya maddi zararlar</li>
              <li>Kullanıcının MBYS veya diğer yasal yükümlülüklerini yerine getirmemesinden kaynaklanan idari, hukuki veya mali sonuçlar</li>
            </ul>
            <p className="mt-3">
              Seansify'ın herhangi bir durumda azami sorumluluğu, son 3 aylık abonelik bedeliyle sınırlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>8. Fikri Mülkiyet</h2>
            <p className="mb-3">
              Platform üzerindeki tüm yazılım, tasarım, marka ve içerik Seansify'a aittir ve telif hukuku ile
              fikri mülkiyet mevzuatıyla korunmaktadır.
            </p>
            <p className="mb-3">
              Kullanıcılar, platforma yükledikleri verilerin (danışan kayıtları, notlar vb.) hukuki sorumluluğunu
              üstlenir. Bu veriler üzerindeki mülkiyet hakları kullanıcıya aittir.
            </p>
            <p>
              Seansify, anonim ve toplu istatistiksel verileri hizmet geliştirme amacıyla kullanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>9. Hizmet Değişiklikleri ve Fesih</h2>
            <p className="mb-3">
              Seansify, platformu geliştirme ve değiştirme hakkını saklı tutar. Önemli değişiklikler en az
              15 gün öncesinden e-posta yoluyla bildirilecektir.
            </p>
            <p>
              Kullanım koşullarının ihlali halinde Seansify, hesabı askıya alma veya kapatma hakkına sahiptir.
              Hesap kapatma kararları gerekçesiyle birlikte bildirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
            <p>
              Bu koşullar Türk hukukuna tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri yetkilidir.
              Çözüme kavuşturulamamış anlaşmazlıklar için öncelikle arabuluculuk yoluna başvurulacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#4a7c6f' }}>11. İletişim</h2>
            <p>
              Bu koşullarla ilgili sorularınız için:{' '}
              <a href="mailto:destek@seansify.com" className="underline" style={{ color: '#4a7c6f' }}>destek@seansify.com</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t mt-16" style={{ borderColor: '#e2eae7' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#94a3b8' }}>© 2026 Seansify. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/gizlilik" className="text-xs" style={{ color: '#64748b' }}>Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="text-xs" style={{ color: '#4a7c6f' }}>Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
