require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const REQUIRED_TABLES = [
  { name: 'users', column: 'id' },
  { name: 'reports', column: 'id' },
  { name: 'report_upvotes', column: 'report_id' },
  { name: 'verifications', column: 'id' },
  { name: 'audit_logs', column: 'id' },
];

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    process.stderr.write('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env\n');
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const missing = [];

  for (const { name, column } of REQUIRED_TABLES) {
    const { error } = await supabase.from(name).select(column).limit(1);
    if (error && error.code !== 'PGRST116') {
      missing.push(`${name} (${error.message})`);
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