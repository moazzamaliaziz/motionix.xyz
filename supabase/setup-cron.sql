-- Enable required extensions (run first)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Sync GA4 every 6 hours
SELECT cron.schedule(
  'sync-ga4',
  '0 */6 * * *',
  FORMAT(
    'SELECT net.http_post(url := %L, headers := %L, body := %L::jsonb)',
    'https://qgroslpmtvjjninvmqkv.supabase.co/functions/v1/sync-ga4',
    '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncm9zbHBtdHZqam5pbnZtcWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ3MTc0MCwiZXhwIjoyMTAyMDQ3NzQwfQ.qz9hBczn7abtXs23iGp-VqU2h0Fa8WFHQtJhoD0I_TM"}',
    '{}'
  )::TEXT
);

-- Sync GSC daily at 2am UTC
SELECT cron.schedule(
  'sync-gsc',
  '0 2 * * *',
  FORMAT(
    'SELECT net.http_post(url := %L, headers := %L, body := %L::jsonb)',
    'https://qgroslpmtvjjninvmqkv.supabase.co/functions/v1/sync-gsc',
    '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncm9zbHBtdHZqam5pbnZtcWt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ3MTc0MCwiZXhwIjoyMTAyMDQ3NzQwfQ.qz9hBczn7abtXs23iGp-VqU2h0Fa8WFHQtJhoD0I_TM"}',
    '{}'
  )::TEXT
);
