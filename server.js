import Fastify from 'fastify';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const fastify = Fastify({ logger: true });
const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const root = process.cwd();

const pages = {
  '/': 'index.html',
  '/hvac-dispatch-software': 'hvac-dispatch-software.html',
  '/hvac-dispatch-app-vs-spreadsheets': 'hvac-dispatch-app-vs-spreadsheets.html',
  '/how-to-choose-hvac-dispatch-app': 'how-to-choose-hvac-dispatch-app.html',
  '/plumbing-dispatch-software': 'plumbing-dispatch-software.html',
  '/field-service-scheduling': 'field-service-scheduling.html',
};

for (const [route, file] of Object.entries(pages)) {
  fastify.get(route, async (_request, reply) => {
    reply.type('text/html').send(readFileSync(join(root, file), 'utf8'));
  });
}

for (const asset of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  fastify.get(`/${asset}`, async (_request, reply) => {
    if (!existsSync(join(root, asset))) return reply.code(404).send('Not found');
    const mime = asset.endsWith('.xml') ? 'application/xml' : 'text/plain';
    reply.type(mime).send(readFileSync(join(root, asset), 'utf8'));
  });
}

fastify.post('/waitlist', async (request, reply) => {
  const { name, email, company } = request.body || {};
  if (!email) return reply.status(400).send({ error: 'Email is required' });
  if (!sql) return reply.status(500).send({ error: 'DATABASE_URL is required' });

  try {
    await sql`INSERT INTO waitlist_leads (name, email, company) VALUES (${name}, ${email}, ${company})`;
    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to save lead' });
  }
});

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
});
