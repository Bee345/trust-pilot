ALTER TABLE reports ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_reports_search ON reports USING GIN(search_vector);

CREATE OR REPLACE TRIGGER reports_search_update
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(
    search_vector,
    'pg_catalog.english',
    business_name,
    description,
    phone
  );
