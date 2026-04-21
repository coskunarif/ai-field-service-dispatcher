
import Fastify from 'fastify';
import postgres from 'postgres';

const fastify = Fastify({ logger: true });
const sql = postgres(process.env.DATABASE_URL!);

fastify.post('/waitlist', async (request, reply) => {
  const { name, email, company } = request.body as any;
  if (!email) {
    return reply.status(400).send({ error: 'Email is required' });
  }

  try {
    await sql`
      INSERT INTO waitlist_leads (name, email, company)
      VALUES (${name}, ${email}, ${company})
    `;
    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to save lead' });
  }
});

fastify.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
});
