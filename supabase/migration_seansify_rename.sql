-- Seansify: psyconnect_pending → seansify_pending enum rename
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'seansify_pending';
UPDATE appointments SET status = 'seansify_pending' WHERE status = 'psyconnect_pending';
