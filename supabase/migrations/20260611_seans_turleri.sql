ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS seans_turleri text[] DEFAULT '{online,yuzyuze}';
UPDATE psychologists SET seans_turleri = '{online,yuzyuze}' WHERE seans_turleri IS NULL;
