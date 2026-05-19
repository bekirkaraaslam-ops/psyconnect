import { test } from '@playwright/test'
import path from 'path'

test('Sunum Kaydı', async ({ page }) => {
  const presentationPath = path.resolve(__dirname, '../demo/presentation.html')
  await page.goto(`file:///${presentationPath.replace(/\\/g, '/')}`)
  // Toplam süre: 4+5+4.5+5+5+5+4.5+5+5+28+5 = ~76 saniye, 82s bekle
  await page.waitForTimeout(82000)
})
