const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setViewportSize({ width: 1080, height: 1080 })

  const htmlPath = 'file:///' + path.resolve(__dirname, 'carousel-noshows.html').replace(/\\/g, '/')
  await page.goto(htmlPath)
  await page.waitForLoadState('networkidle')

  const outDir = path.resolve(__dirname, '../demo-output/carousel-noshows')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const slideCount = 7
  for (let i = 1; i <= slideCount; i++) {
    const el = await page.$(`#slide-${i}`)
    if (!el) { console.warn(`slide-${i} bulunamadı`); continue }
    const outPath = path.join(outDir, `slide-${i}.png`)
    await el.screenshot({ path: outPath })
    console.log(`✓ slide-${i}.png kaydedildi`)
  }

  await browser.close()
  console.log(`\nTüm slaytlar: ${outDir}`)
})()
