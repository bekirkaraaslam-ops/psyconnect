-- ── SOAP şablonu (hasta_notlari) ─────────────────────────────────────────────
ALTER TABLE hasta_notlari
  ADD COLUMN IF NOT EXISTS soap_s_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_o_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_a_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS soap_p_encrypted TEXT;

-- ── Mesai dışı koruma (psychologists) ────────────────────────────────────────
ALTER TABLE psychologists
  ADD COLUMN IF NOT EXISTS work_start_hour INTEGER DEFAULT 9,
  ADD COLUMN IF NOT EXISTS work_end_hour INTEGER DEFAULT 18;

-- ── Danışan geri kazanım (patients) ──────────────────────────────────────────
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS win_back_sent_at TIMESTAMPTZ;
