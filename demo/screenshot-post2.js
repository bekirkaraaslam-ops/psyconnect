const { chromium } = require('@playwright/test')
const path = require('path')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1080, height: 1080 })
  const filePath = path.resolve(__dirname, 'post-whatsapp-hatirlatici.html')
  await page.goto('file:///' + filePath.replace(/\\/g, '/'))
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.resolve(__dirname, 'post-whatsapp-hatirlatici.png'), clip: { x: 0, y: 0, width: 1080, height: 1080 } })
  await browser.close()
  console.log('Kaydedildi: demo/post-whatsapp-hatirlatici.png')
})()
