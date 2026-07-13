const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Rrakhi@0099',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database');

    const sql = fs.readFileSync(path.join(__dirname, 'supabase-migration.sql'), 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await client.query(stmt);
          console.log(`Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          if (err.code === '42710' || err.code === '42P07' || err.code === '23505') {
            console.log(`Statement ${i + 1}/${statements.length} skipped (${err.code}): ${err.message.substring(0, 80)}`);
          } else {
            console.error(`Statement ${i + 1}/${statements.length} failed: ${err.message.substring(0, 120)}`);
          }
        }
      }
    }

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
