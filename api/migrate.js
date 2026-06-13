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

    await sql`CREATE TABLE IF NOT EXISTS social_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform VARCHAR(50) NOT NULL,
      source_url TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      snippet TEXT NOT NULL,
      intent_score INTEGER DEFAULT 50,
      status VARCHAR(50) DEFAULT 'discovered',
      suggested_reply TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS social_leads_source_url_idx ON social_leads (source_url);`;
    console.log('Table social_leads created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createTable();
