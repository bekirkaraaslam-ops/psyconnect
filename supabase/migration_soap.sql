ALTER TABLE hasta_notlari
  ADD COLUMN IF NOT EXISTS soap_s_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_o_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_a_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_p_encrypted TEXT;
