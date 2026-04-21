import postgres from 'postgres';

const sql = postgres("postgresql://postgres:ytMLkXmAHaZLChqnPXwBrNLBltkuewUF@shinkansen.proxy.rlwy.net:36525/railway");

async function createTable() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS waitlist_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      company TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`;
    console.log('Table waitlist_leads created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createTable();
