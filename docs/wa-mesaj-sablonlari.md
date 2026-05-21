# WhatsApp Mesaj Şablonları

Sistemdeki tüm otomatik WhatsApp mesajlarının örnekleri.
Değişkenler `{süslü_parantez}` ile gösterilmiştir.

---

## 1. Karşılama Mesajı
**Ne zaman gönderilir:** Yeni hasta sisteme eklendiğinde, ~2 dakika sonra otomatik.
**Kaynak:** `netlify/functions/send-welcomes.ts`

```
Merhaba {hasta_adı} 🌿

{psikolog_adı} kliniğine hoş geldiniz. Bundan sonra randevularınızla ilgili tüm
bildirimler bu hat üzerinden WhatsApp ile iletilecek.

📅 Randevu almak için:
"randevu" yazmanız yeterli. Size müsait günler sunulur; birini seçtikten sonra
adınızı ve soyadınızı yazarsanız randevunuz oluşturulur.

🔔 Hatırlatıcılar:
Randevunuzdan önce otomatik hatırlatma alırsınız. Gelen mesajda "ONAYLA" veya
"İPTAL" yazarak randevunuzu tek adımda yönetebilirsiniz.

Bu hat otomatik bildirim sistemi üzerinden çalışır. Psikologunuzla doğrudan
iletişim için lütfen kliniği arayın.

Seansify
```

---

## 2. Randevu Hatırlatıcısı — Yüz Yüze
**Ne zaman gönderilir:** Randevudan 23–25 saat önce, saatte bir çalışan cron ile.
**Kaynak:** `netlify/functions/send-reminders.ts`

```
Sayın {hasta_adı},

15 Mayıs tarihinde saat *14:30*'da *Dr. Ayşe Kaya* ile randevunuz
bulunmaktadır (3. seans / 10 seanslık paket).

📍 *Konum:* https://maps.google.com/...

✅ Onaylamak için *EVET* yazın
❌ İptal etmek için *İPTAL* yazın
```

---

## 3. Randevu Hatırlatıcısı — Online
**Ne zaman gönderilir:** Aynı cron, randevu türü online ise.

```
Sayın {hasta_adı},

15 Mayıs tarihinde saat *14:30*'da *Dr. Ayşe Kaya* ile randevunuz
bulunmaktadır (3. seans / 10 seanslık paket).

🔗 *Online Görüşme Linki:* https://meet.google.com/...

✅ Onaylamak için *EVET* yazın
❌ İptal etmek için *İPTAL* yazın
```

---

## 4. Randevu Hatırlatıcısı — İlk Seans (Hoş Geldiniz Eki)
**Ne zaman gönderilir:** İlk seans olan randevularda hatırlatıcıdan sonra ek mesaj.
Psikolog panelinde `hosgeldiniz_mesaji` alanı doluysa gönderilir.

```
[Hatırlatıcı mesajı gönderilir, ardından 10–25 saniye gecikme sonrası:]

{psikologun özel hoş geldiniz mesajı}

Örnek:
"İlk seansımıza hoş geldiniz. Ofisimize gelirken asansörü kullanabilirsiniz,
3. katta sizi karşılayacağım. Görüşmemiz yaklaşık 50 dakika sürecek. — Dr. Ayşe"
```

---

## 5. Anamnez Form Linki
**Ne zaman gönderilir:** İlk randevudan önce, `anamnez_scheduled_at` geçince.
**Kaynak:** `netlify/functions/send-reminders.ts` (alt bölüm) + `netlify/functions/anamnez-scheduler.ts`

```
Merhaba {hasta_adı}, yarınki seans öncesinde psikoloğunuzun sizi daha iyi
tanıyabilmesi için aşağıdaki kısa formu doldurmanızı rica ediyoruz 📋

https://seansify.app/anamnez/{token}

Link 7 gün geçerlidir.
```

---

## 6. Chatbot — Randevu Oluşturma Akışı
**Durum:** Henüz kodda yok, aşağıdaki tasarım önerisidir.
Hasta "randevu" yazdığında bot devreye girer.

### Adım 1 — Başlatma
Hasta: `randevu`

```
📅 Randevu talebinizi aldım.

Uygun olduğunuz günleri seçin (birden fazla yazabilirsiniz):

1️⃣ Pazartesi
2️⃣ Salı
3️⃣ Çarşamba
4️⃣ Perşembe
5️⃣ Cuma

Örnek: *1 3* (Pazartesi ve Çarşamba)
```

### Adım 2 — Gün Seçimi
Hasta: `2 4`

```
Salı ve Perşembe için müsait saatler:

🗓 *Salı, 20 Mayıs*
• 10:00
• 14:00
• 16:00

🗓 *Perşembe, 22 Mayıs*
• 11:00
• 15:30

Tercih ettiğiniz saati yazın. Örnek: *Salı 14:00*
```

### Adım 3 — Saat Seçimi
Hasta: `Salı 14:00`

```
*Salı, 20 Mayıs — 14:00* seçildi.

Son olarak adınızı ve soyadınızı yazar mısınız?
```

### Adım 4 — İsim Onayı
Hasta: `Ahmet Yılmaz`

```
✅ Randevunuz oluşturuldu!

📋 *Özet:*
👤 Ahmet Yılmaz
📅 Salı, 20 Mayıs — 14:00
👩‍⚕️ Dr. Ayşe Kaya

Randevunuzdan 24 saat önce otomatik hatırlatma alacaksınız.
```

### Adım 5 — Onaylama (Hatırlatıcıya yanıt)
Hasta: `EVET`

```
✅ Randevunuz onaylandı. Görüşmek üzere!
```

### Adım 5 (alternatif) — İptal
Hasta: `İPTAL`

```
❌ Randevunuz iptal edildi.

Yeni randevu almak için tekrar *randevu* yazabilirsiniz.
```

---

## 7. Bekleme Listesi — Teklif Mesajı
**Ne zaman gönderilir:** İptal edilen randevu yerine bekleme listesindeki hastaya.
**Kaynak:** `app/api/waiting-list/cascade/route.ts`

```
Merhaba {hasta_adı},

Bekleme listenizle eşleşen bir randevu açıldı 🎉

📅 *{tarih} — {saat}*
👩‍⚕️ *{psikolog_adı}*

Bu randevuyu almak ister misiniz?
✅ *EVET* yazın (24 saat içinde)
❌ İstemiyorsanız *HAYIR* yazın
```

---

## 8. Ev Ödevi Gönderimi
**Ne zaman gönderilir:** Psikolog "ev ödevi gönder" butonuna bastığında manuel.
**Kaynak:** `app/api/hasta-notlari/send-homework/route.ts`

```
Merhaba {hasta_adı} 🌱

{psikolog_adı} bir ev ödevi paylaştı:

{ev_odevi_metni}

Bir sonraki seansımızda konuşacağız. İyi çalışmalar!
```
