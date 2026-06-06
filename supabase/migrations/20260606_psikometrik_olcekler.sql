-- Psikometrik ölçekler: şablon tablosu + hasta yanıtları

create table if not exists scales (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  short_name    text not null,
  description   text,
  instructions  text,
  questions     jsonb not null,
  scoring_rules jsonb not null,
  created_at    timestamptz default now()
);

alter table scales enable row level security;
create policy "scales_public_read" on scales for select using (true);

create table if not exists scale_responses (
  id                   uuid primary key default gen_random_uuid(),
  psychologist_id      uuid not null references psychologists(id) on delete cascade,
  patient_id           uuid not null references patients(id) on delete cascade,
  scale_id             uuid not null references scales(id),
  appointment_id       uuid references appointments(id) on delete set null,
  token                text unique not null,
  answers              jsonb,
  total_score          integer,
  interpretation       text,
  interpretation_color text,
  sent_at              timestamptz default now(),
  filled_at            timestamptz,
  expires_at           timestamptz not null,
  created_at           timestamptz default now()
);

alter table scale_responses enable row level security;

create policy "scale_responses_psych_all" on scale_responses
  for all using (
    psychologist_id = (select id from psychologists where auth_user_id = auth.uid())
  );

create index if not exists scale_responses_token_idx on scale_responses (token);
create index if not exists scale_responses_patient_idx on scale_responses (patient_id, filled_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: 6 Ölçek
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. PHQ-9
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'phq9',
  'PHQ-9 Depresyon Ölçeği',
  'PHQ-9',
  'Depresyon belirtilerinin sıklığını ve şiddetini ölçer. 9 maddeli, 0-27 puan aralığı.',
  'Son 2 hafta içinde aşağıdaki sorunlardan ne sıklıkla rahatsız oldunuz?',
  $q$[
    {"text": "İşlere karşı ilgi veya zevk duyma konusunda azlık veya hiç olmama"},
    {"text": "Kendini kötü, bunalımlı veya umutsuz hissetme"},
    {"text": "Uykuya dalmada veya uykuyu sürdürmede güçlük ya da çok fazla uyuma"},
    {"text": "Kendini yorgun hissetme veya az enerjisi olma"},
    {"text": "İştahsızlık veya aşırı yeme"},
    {"text": "Kendiniz hakkında kötü hissetme — başarısız biri olduğunuzu ya da kendinizi veya ailenizi hayal kırıklığına uğrattığınızı düşünme"},
    {"text": "Gazete okuma ya da televizyon izleme gibi şeylere konsantre olmada güçlük"},
    {"text": "Diğerlerinin fark edebileceği kadar yavaş hareket etme ya da konuşma; ya da tam tersi — çok gergin veya tedirgin olma nedeniyle her zamankinden çok hareket etme"},
    {"text": "Kendinize zarar verme ya da ölmek isteme, ya da bir şekilde kendinize zarar verme düşüncesi"}
  ]$q$::jsonb,
  $s${
    "total_fn": "sum",
    "options": [
      {"value": 0, "label": "Hiç"},
      {"value": 1, "label": "Birkaç gün"},
      {"value": 2, "label": "Günlerin yarısından fazlası"},
      {"value": 3, "label": "Neredeyse her gün"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 4,  "label": "Minimal depresyon",     "color": "#16a34a"},
      {"min": 5,  "max": 9,  "label": "Hafif depresyon",        "color": "#84cc16"},
      {"min": 10, "max": 14, "label": "Orta depresyon",         "color": "#f59e0b"},
      {"min": 15, "max": 19, "label": "Orta-ağır depresyon",    "color": "#f97316"},
      {"min": 20, "max": 27, "label": "Ağır depresyon",         "color": "#ef4444"}
    ]
  }$s$::jsonb
);

-- 2. GAD-7
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'gad7',
  'GAD-7 Anksiyete Ölçeği',
  'GAD-7',
  'Yaygın anksiyete belirtilerini değerlendirir. 7 maddeli, 0-21 puan aralığı.',
  'Son 2 hafta içinde aşağıdaki sorunlardan ne sıklıkla rahatsız oldunuz?',
  $q$[
    {"text": "Gergin, endişeli veya sinirimin ucunda hissetme"},
    {"text": "Endişelerimi durduramama veya kontrol edememe"},
    {"text": "Farklı konular hakkında çok fazla endişelenme"},
    {"text": "Rahatlamada güçlük çekme"},
    {"text": "O kadar tedirgin olma ki, yerimde duramama"},
    {"text": "Kolayca sinirlenme veya tahriş olma"},
    {"text": "Korkunç bir şey olabilecekmiş gibi hissetme"}
  ]$q$::jsonb,
  $s${
    "total_fn": "sum",
    "options": [
      {"value": 0, "label": "Hiç"},
      {"value": 1, "label": "Birkaç gün"},
      {"value": 2, "label": "Günlerin yarısından fazlası"},
      {"value": 3, "label": "Neredeyse her gün"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 4,  "label": "Minimal anksiyete", "color": "#16a34a"},
      {"min": 5,  "max": 9,  "label": "Hafif anksiyete",   "color": "#84cc16"},
      {"min": 10, "max": 14, "label": "Orta anksiyete",    "color": "#f59e0b"},
      {"min": 15, "max": 21, "label": "Ağır anksiyete",    "color": "#ef4444"}
    ]
  }$s$::jsonb
);

-- 3. BAÖ (Beck Anksiyete Envanteri)
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'bao',
  'Beck Anksiyete Envanteri',
  'BAÖ',
  'Anksiyete belirtilerinin şiddetini ölçer. 21 maddeli, 0-63 puan aralığı.',
  'Aşağıda insanların kaygı belirtilerini tanımlamak için kullandıkları ifadeler yer almaktadır. Son bir hafta boyunca her belirti tarafından ne kadar rahatsız edildiğinizi belirtiniz.',
  $q$[
    {"text": "Uyuşma veya karıncalanma hissi"},
    {"text": "Sıcak basması"},
    {"text": "Bacaklarda titreme veya sarsılma"},
    {"text": "Gevşeyememe"},
    {"text": "En kötüsünün olacağına dair korku"},
    {"text": "Baş dönmesi veya sersemlik hissi"},
    {"text": "Kalp çarpıntısı"},
    {"text": "Dengesizlik hissi"},
    {"text": "Dehşete kapılma veya panik hissi"},
    {"text": "Sinirlilik"},
    {"text": "Boğulacakmış gibi hissetme"},
    {"text": "Ellerin titremesi"},
    {"text": "Vücutta titreme veya sarsılma"},
    {"text": "Kontrolü kaybetme korkusu"},
    {"text": "Nefes almada güçlük"},
    {"text": "Ölüm korkusu"},
    {"text": "Korkma hissi"},
    {"text": "Mide bulantısı veya karın ağrısı"},
    {"text": "Bayılacakmış gibi hissetme"},
    {"text": "Yüzün kızarması"},
    {"text": "Terleme (sıcaktan değil)"}
  ]$q$::jsonb,
  $s${
    "total_fn": "sum",
    "options": [
      {"value": 0, "label": "Hiç"},
      {"value": 1, "label": "Hafifçe — beni pek etkilemedi"},
      {"value": 2, "label": "Orta derecede — rahatsız edici ama katlanabildim"},
      {"value": 3, "label": "Şiddetli — buna katlanamadım"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 7,  "label": "Minimal anksiyete", "color": "#16a34a"},
      {"min": 8,  "max": 15, "label": "Hafif anksiyete",   "color": "#84cc16"},
      {"min": 16, "max": 25, "label": "Orta anksiyete",    "color": "#f59e0b"},
      {"min": 26, "max": 63, "label": "Ağır anksiyete",    "color": "#ef4444"}
    ]
  }$s$::jsonb
);

-- 4. PCL-5 (PTSD Kontrol Listesi)
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'pcl5',
  'PCL-5 PTSD Kontrol Listesi',
  'PCL-5',
  'Travma sonrası stres bozukluğu belirtilerini değerlendirir. 20 maddeli, 0-80 puan aralığı.',
  'Aşağıda stresli yaşantılardan sonra zaman zaman yaşanan sorunlar listelenmektedir. Son bir ay içinde bu sorunlardan ne ölçüde rahatsız oldunuz?',
  $q$[
    {"text": "Stresli yaşantıya ilişkin anılar, zihinsel imgeler veya düşünceler tekrar tekrar zihninize üşüşüyor"},
    {"text": "Stresli yaşantıya ilişkin rahatsız edici rüyalar görüyorsunuz"},
    {"text": "Sanki stresli yaşantı yeniden gerçekleşiyormuş gibi hissediyorsunuz (flashback)"},
    {"text": "Stresli yaşantıyı hatırlatan şeylerle karşılaştığınızda çok bunalımlı veya mutsuz oluyorsunuz"},
    {"text": "Stresli yaşantıyı hatırlatan şeylerle karşılaştığınızda güçlü fiziksel tepkiler yaşıyorsunuz (kalp çarpıntısı, terleme vb.)"},
    {"text": "Stresli yaşantıya ilişkin anıları, düşünceleri veya duyguları akıldan silmeye çalışıyorsunuz"},
    {"text": "Stresli yaşantıyı hatırlatan kişilerden, yerlerden veya durumlardan uzak durmaya çalışıyorsunuz"},
    {"text": "Stresli yaşantının önemli bir bölümünü hatırlamakta güçlük çekiyorsunuz"},
    {"text": "Kendiniz, başkaları veya dünya hakkında güçlü olumsuz inançlarınız var (örn. 'Ben kötüyüm', 'Hiçbir şeye güvenilmez')"},
    {"text": "Stresli yaşantının yaşanmasında kendinizi veya başkasını suçluyorsunuz"},
    {"text": "Olumsuz duygular içinde bulunuyorsunuz (korku, dehşet, öfke, suçluluk veya utanç)"},
    {"text": "Daha önce zevk aldığınız aktivitelere katılmakta büyük ölçüde ilgisizlik yaşıyorsunuz"},
    {"text": "Başkalarından uzak veya kopukluk hissediyorsunuz"},
    {"text": "Olumlu duygular yaşamakta güçlük çekiyorsunuz (mutluluk veya sevgi duymakta güçlük)"},
    {"text": "Sanki duygusuzlaşmış ya da uyuşmuş gibiydiniz"},
    {"text": "Çevrenizdeki her şeye çok dikkat ediyor, uyanık ve hazır durumda oluyorsunuz"},
    {"text": "Çok gergin veya ürkek oluyorsunuz; kolayca irkiliyorsunuz"},
    {"text": "Yoğunlaşmakta güçlük çekiyorsunuz"},
    {"text": "Uyku güçlüğü yaşıyorsunuz (uykuya dalmak, uykuda kalmak veya huzursuz uyku)"},
    {"text": "Sinirli veya öfkeli davranışlarda bulunuyorsunuz, saldırgan tepkiler veriyorsunuz"}
  ]$q$::jsonb,
  $s${
    "total_fn": "sum",
    "options": [
      {"value": 0, "label": "Hiç"},
      {"value": 1, "label": "Biraz"},
      {"value": 2, "label": "Orta derecede"},
      {"value": 3, "label": "Oldukça fazla"},
      {"value": 4, "label": "Aşırı derecede"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 32, "label": "PTSD olası değil",  "color": "#16a34a"},
      {"min": 33, "max": 80, "label": "Olası PTSD",        "color": "#ef4444"}
    ]
  }$s$::jsonb
);

-- 5. ISI (Uykusuzluk Şiddet İndeksi)
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'isi',
  'ISI Uykusuzluk Şiddet İndeksi',
  'ISI',
  'Uykusuzluk şiddetini ve günlük yaşama etkisini değerlendirir. 7 maddeli, 0-28 puan aralığı.',
  'Son 2 haftada uyku sorunlarınızın şiddetini değerlendiriniz.',
  $q$[
    {"text": "Uykuya dalmada güçlük"},
    {"text": "Uykuyu sürdürmede güçlük (gece uyanmaları)"},
    {"text": "Çok erken uyanma sorunu"},
    {"text": "Mevcut uyku düzeninizden memnuniyet"},
    {"text": "Uyku sorununuzun gündüz işlevselliğinizi (yorgunluk, konsantrasyon, bellek, ruh hali) ne ölçüde etkilediğini düşünüyorsunuz?"},
    {"text": "Uyku sorununun yaşam kalitenizi düşürdüğünü başkaları tarafından ne ölçüde fark edildiğini düşünüyorsunuz?"},
    {"text": "Mevcut uyku sorunuzdan ne ölçüde endişe veya rahatsızlık duyuyorsunuz?"}
  ]$q$::jsonb,
  $s${
    "total_fn": "sum",
    "options": [
      {"value": 0, "label": "Hiç / Yok"},
      {"value": 1, "label": "Hafif"},
      {"value": 2, "label": "Orta"},
      {"value": 3, "label": "Şiddetli"},
      {"value": 4, "label": "Çok şiddetli"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 7,  "label": "Klinik önemi yok",           "color": "#16a34a"},
      {"min": 8,  "max": 14, "label": "Subklinik uykusuzluk",       "color": "#84cc16"},
      {"min": 15, "max": 21, "label": "Orta şiddetli uykusuzluk",   "color": "#f59e0b"},
      {"min": 22, "max": 28, "label": "Ağır uykusuzluk",            "color": "#ef4444"}
    ]
  }$s$::jsonb
);

-- 6. Rosenberg Öz-Saygı Ölçeği
insert into scales (slug, name, short_name, description, instructions, questions, scoring_rules) values (
  'rosenberg',
  'Rosenberg Öz-Saygı Ölçeği',
  'ROSENBERG',
  'Genel öz-saygı düzeyini ölçer. 10 maddeli, 0-30 puan aralığı. Yüksek puan = yüksek öz-saygı.',
  'Aşağıdaki ifadeleri okuyarak kendinize ne ölçüde uyduğunu belirtiniz.',
  $q$[
    {"text": "En azından diğer insanlar kadar değer taşıdığımı hissediyorum"},
    {"text": "Bir dizi iyi özelliğe sahip olduğumu düşünüyorum"},
    {"text": "Genel olarak başarısız biri olduğumu düşünmeye eğilimliyim"},
    {"text": "Diğer insanların yapabildiği kadar iyi işler çıkarabiliyorum"},
    {"text": "Övünecek çok az şeyim var"},
    {"text": "Kendime karşı olumlu tutum içindeyim"},
    {"text": "Genel olarak kendimden memnunum"},
    {"text": "Kendime daha fazla saygı duymayı diliyorum"},
    {"text": "Zaman zaman kendimi kesinlikle değersiz hissediyorum"},
    {"text": "Zaman zaman iyi bir işe yaramadığımı düşünüyorum"}
  ]$q$::jsonb,
  $s${
    "total_fn": "rosenberg",
    "positive_items": [0, 1, 3, 5, 6],
    "negative_items": [2, 4, 7, 8, 9],
    "options": [
      {"value": 0, "label": "Kesinlikle katılıyorum"},
      {"value": 1, "label": "Katılıyorum"},
      {"value": 2, "label": "Katılmıyorum"},
      {"value": 3, "label": "Kesinlikle katılmıyorum"}
    ],
    "cutoffs": [
      {"min": 0,  "max": 15, "label": "Düşük öz-saygı", "color": "#ef4444"},
      {"min": 16, "max": 25, "label": "Orta öz-saygı",  "color": "#f59e0b"},
      {"min": 26, "max": 30, "label": "Yüksek öz-saygı","color": "#16a34a"}
    ]
  }$s$::jsonb
);
