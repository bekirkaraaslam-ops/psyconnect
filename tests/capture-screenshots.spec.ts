import { test } from '@playwright/test'
import path from 'path'
import fs from 'fs'

test('Ekran görüntüsü al', async ({ page }) => {
  const dir = path.resolve(__dirname, '../demo/screenshots')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  // Login
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  await page.fill('input[type="email"]', 'bekirkaraaslan28@icloud.com')
  await page.fill('input[type="password"]', 'Mufc1969')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 })
  if (!page.url().includes('/dashboard')) await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(dir, '01-dashboard.png'), fullPage: false })

  // Hastalar
  await page.click('a[href="/patients"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(dir, '02-patients.png') })

  // Yeni hasta formu
  await page.click('a[href="/patients/new"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.fill('input[name="name_surname"]', 'Zeynep Kaya')
  await page.fill('input[name="phone_number"]', '0532 555 44 33')
  await page.fill('input[name="date_of_birth"]', '1990-03-15')
  await page.fill('textarea[name="notes"]', 'Anksiyete bozukluğu, haftalık seans planlandı')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(dir, '03-new-patient.png') })

  // Anamnez toggle aç
  await page.locator('div.cursor-pointer:has-text("Anamnez Formu Gönderilsin mi?")').click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(dir, '04-new-patient-anamnez.png') })

  // İptal
  await page.click('button:has-text("İptal")')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  // İlk hasta detayı
  try {
    const firstPatient = page.locator('a[href^="/patients/"]').first()
    await firstPatient.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(dir, '05-patient-detail.png') })
  } catch {}

  // Randevular
  await page.click('a[href="/appointments"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(dir, '06-appointments.png') })

  // Yeni randevu
  await page.click('a[href="/appointments/new"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  try {
    const sel = page.locator('select[name="patient_id"]')
    const opts = await sel.locator('option').all()
    if (opts.length > 1) {
      const v = await opts[1].getAttribute('value')
      if (v) await sel.selectOption(v)
    }
  } catch {}
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(14, 0, 0, 0)
  await page.fill('input[name="appointment_date"]', tomorrow.toISOString().slice(0, 16))
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(dir, '07-new-appointment.png') })
  await page.click('button:has-text("İptal")')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // Takvim
  await page.click('a[href="/calendar"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(dir, '08-calendar.png') })

  // WhatsApp
  await page.click('a[href="/whatsapp"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(dir, '09-whatsapp.png') })

  // Ayarlar
  await page.click('a[href="/settings"]')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(dir, '10-settings.png') })
})
