const { chromium } = require('@playwright/test')
const path = require('path')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 512, height: 512 })
  const filePath = path.resolve(__dirname, 'icon-export.html')
  await page.goto('file:///' + filePath.replace(/\\/g, '/'))
  await page.waitForTimeout(300)
  await page.screenshot({
    path: path.resolve(__dirname, 'seansify-icon-512.png'),
    clip: { x: 0, y: 0, width: 512, height: 512 },
    omitBackground: true,
  })
  await browser.close()
  console.log('Kaydedildi: demo/seansify-icon-512.png')
})()
