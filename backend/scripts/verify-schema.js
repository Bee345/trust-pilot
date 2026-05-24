// Run: node scripts/verify-schema.js
// Confirms the Supabase schema has all required tables.
// If it fails, run the Phase 2 SQL from IMPLEMENTATION_PLAN.md in Supabase SQL Editor.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const REQUIRED_TABLES = ['users', 'reports', 'report_upvotes', 'verifications', 'audit_logs'];

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    process.stderr.write('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env\n');
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const missing = [];

  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      missing.push(`${table} (${error.message})`);
    }
  }

  if (missing.length > 0) {
    process.stderr.write(`Schema verification FAILED. Missing or broken tables:\n  ${missing.join('\n  ')}\n`);
    process.stderr.write('Action: Run the Phase 2 SQL migrations in Supabase SQL Editor.\n');
    process.exit(1);
  }

  process.stdout.write('Schema verified: all tables exist.\n');
}

main();
