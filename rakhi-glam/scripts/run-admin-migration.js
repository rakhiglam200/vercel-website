const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xbsemoiztwvhvpkzhqyz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic2Vtb2l6dHd2aHZwa3pocXl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkzNjk3NCwiZXhwIjoyMDk5NTEyOTc0fQ.eXYD6Q0mwDs8LWflp32MZXNJfqaiz10fD2ROecJHUto';

async function runSql(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.text();
  return { status: res.status, data };
}

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-migration-admin.sql'), 'utf8');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${statements.length} statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt.trim()) continue;
    
    try {
      const result = await runSql(stmt);
      if (result.status === 200) {
        console.log(`[${i + 1}/${statements.length}] OK`);
      } else if (result.status === 404) {
        // exec_sql function doesn't exist, try direct approach
        console.log(`[${i + 1}/${statements.length}] exec_sql not found (status ${result.status})`);
        console.log('The exec_sql RPC function does not exist in your Supabase project.');
        console.log('\nPlease run the migration manually:');
        console.log('1. Go to https://supabase.com/dashboard → your project → SQL Editor');
        console.log('2. Paste the contents of supabase-migration-admin.sql');
        console.log('3. Click "Run"\n');
        
        // Print the SQL for manual execution
        console.log('--- SQL to run ---');
        console.log(stmt + ';');
        console.log('--- End SQL ---\n');
      } else {
        console.log(`[${i + 1}/${statements.length}] Status ${result.status}: ${result.data.substring(0, 120)}`);
      }
    } catch (err) {
      console.error(`[${i + 1}/${statements.length}] Error: ${err.message}`);
    }
  }
}

runMigration();
