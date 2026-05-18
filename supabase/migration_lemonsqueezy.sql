-- psychologists tablosuna yeni kolonlar ekle
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'baslangic', 'pro')),
  ADD COLUMN IF NOT EXISTS ls_customer_id text,
  ADD COLUMN IF NOT EXISTS ls_subscription_id text,
  ADD COLUMN IF NOT EXISTS ls_subscription_status text,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code text,
  ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0;

-- Referral tablosu
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  activated_at timestamptz,
  cancelled_at timestamptz,
  UNIQUE(referred_id)
);

-- Discount codes tablosu
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  ls_discount_id text,
  code text UNIQUE NOT NULL,
  percent_off integer NOT NULL,
  valid_until timestamptz,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Referral code otomatik oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(NEW.id::text || random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: yeni psikolog kaydında referral_code oluştur
DROP TRIGGER IF EXISTS set_referral_code ON psychologists;
CREATE TRIGGER set_referral_code
  BEFORE INSERT ON psychologists
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Mevcut kayıtlara referral_code ekle
UPDATE psychologists SET referral_code = upper(substring(md5(id::text || random()::text), 1, 8))
WHERE referral_code IS NULL;

-- RLS politikaları
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own discount codes" ON discount_codes
  FOR SELECT USING (psychologist_id = auth.uid());
