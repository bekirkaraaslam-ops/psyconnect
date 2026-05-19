import { test } from '@playwright/test'
import path from 'path'

test('Seansify Tam Ürün Demo', async ({ page }) => {
  // ── 1. GİRİŞ ──
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await page.fill('input[type="email"]', 'bekirkaraaslan28@icloud.com')
  await page.waitForTimeout(500)
  await page.fill('input[type="password"]', 'Mufc1969')
  await page.waitForTimeout(500)
  await page.click('button[type="submit"]')

  // Login sonrası yönlendirme bekle
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 })
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard')
  }
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // ── 2. HASTALAR ──
  await page.click('a[href="/patients"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // ── 3. YENİ HASTA ──
  await page.click('a[href="/patients/new"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await page.fill('input[name="name_surname"]', 'Zeynep Kaya')
  await page.waitForTimeout(600)
  await page.fill('input[name="phone_number"]', '0532 555 44 33')
  await page.waitForTimeout(600)
  await page.fill('input[name="date_of_birth"]', '1990-03-15')
  await page.waitForTimeout(600)
  await page.fill('textarea[name="notes"]', 'Anksiyete bozukluğu, haftalık seans')
  await page.waitForTimeout(800)

  // Anamnez toggle
  await page.locator('div.cursor-pointer:has-text("Anamnez Formu Gönderilsin mi?")').click()
  await page.waitForTimeout(2000)

  // İptal (submit etme)
  await page.click('button:has-text("İptal")')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  // ── 4. MEVCUT HASTA DETAYI ──
  try {
    await page.locator('a[href^="/patients/"]').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
  } catch {}

  // ── 5. RANDEVULAR ──
  await page.click('a[href="/appointments"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // ── 6. YENİ RANDEVU ──
  await page.click('a[href="/appointments/new"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Hasta seç
  try {
    const patientSelect = page.locator('select[name="patient_id"]')
    const options = await patientSelect.locator('option').all()
    if (options.length > 1) {
      const val = await options[1].getAttribute('value')
      if (val) await patientSelect.selectOption(val)
    }
  } catch {}
  await page.waitForTimeout(600)

  // Tarih (yarın 14:00)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)
  const dateStr = tomorrow.toISOString().slice(0, 16)
  await page.fill('input[name="appointment_date"]', dateStr)
  await page.waitForTimeout(2000)

  // Geri
  await page.click('button:has-text("İptal")')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // ── 7. TAKVİM ──
  await page.click('a[href="/calendar"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3500)

  // ── 8. WHATSAPP SAYFASI ──
  await page.click('a[href="/whatsapp"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(4000)

  // ── 9. AYARLAR ──
  await page.click('a[href="/settings"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // ── 10. WHATSAPP MOCKUP ──
  const mockupPath = path.resolve(__dirname, '../demo/whatsapp-mockup.html')
  await page.goto(`file:///${mockupPath.replace(/\\/g, '/')}`)
  await page.waitForTimeout(26000)
})
