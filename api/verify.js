import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const sql = postgres(connectionString);

async function verifyTable() {
  try {
    const leads = await sql`SELECT * FROM waitlist_leads;`;
    console.log('Waitlist leads:', leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyTable();
