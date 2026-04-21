import postgres from 'postgres';

const sql = postgres("postgresql://postgres:ytMLkXmAHaZLChqnPXwBrNLBltkuewUF@shinkansen.proxy.rlwy.net:36525/railway");

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
