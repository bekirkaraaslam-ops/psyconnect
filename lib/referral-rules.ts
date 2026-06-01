export const REFERRAL_RULES = {
  pro: {
    discountPerReferral: 20,
    newUserDiscount: 10,
    freeThreshold: 5,
  },
  one: {
    discountPerReferral: 10,
    newUserDiscount: 10,
    freeThreshold: 10,
  },
  // eski plan adı — geriye dönük uyumluluk
  baslangic: {
    discountPerReferral: 10,
    newUserDiscount: 10,
    freeThreshold: 10,
  },
}

// Seansify One: 749 ₺ baz fiyat, %10 artışlı varyantlar
// Seansify Pro: 1.850 ₺ baz fiyat, %20 artışlı varyantlar
export const VARIANT_MAP: Record<string, Record<number, number>> = {
  one: {
    0:   1699647, // 749 ₺
    10:  1691392, // 674 ₺
    20:  1699630, // 599 ₺
    30:  1699633, // 524 ₺
    40:  1699636, // 449 ₺
    50:  1699637, // 374 ₺
    60:  1699639, // 299 ₺
    70:  1699641, // 224 ₺
    80:  1699642, // 149 ₺
    90:  1699643, // 74 ₺
    100: 1699644, // 0 ₺ (ücretsiz)
  },
  baslangic: {
    0:   1699647,
    10:  1691392,
    20:  1699630,
    30:  1699633,
    40:  1699636,
    50:  1699637,
    60:  1699639,
    70:  1699641,
    80:  1699642,
    90:  1699643,
    100: 1699644,
  },
  pro: {
    0:   1691401,
    20:  1699657,
    40:  1699658,
    60:  1699659,
    80:  1699660,
    100: 1699661,
  },
}
