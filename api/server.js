import Fastify from 'fastify';
import { Firestore } from '@google-cloud/firestore';
const fastify = Fastify({ logger: true });
const db = new Firestore();
const allowedOrigins = new Set(['https://gainhelm.com', 'https://www.gainhelm.com']);
fastify.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
        reply.header('Access-Control-Allow-Origin', origin);
        reply.header('Vary', 'Origin');
        reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (request.method === 'OPTIONS') {
        return reply.code(204).send();
    }
});
fastify.post('/waitlist', async (request, reply) => {
    const { name, email, company } = request.body;
    if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
    }
    try {
        const docRef = db.collection('waitlist_leads').doc(email.toLowerCase().trim());
        await docRef.create({
            email: email.toLowerCase().trim(),
            name: name || null,
            company: company || null,
            created_at: new Date()
        });
        return { success: true };
    }
    catch (err) {
        fastify.log.error(err);
        // Firestore error code 6 is ALREADY_EXISTS
        if (err.code === 6) {
            return reply.status(400).send({ error: 'Email already registered' });
        }
        return reply.status(500).send({ error: 'Failed to save lead' });
    }
});
fastify.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000, host: '0.0.0.0' }, (err) => {
    if (err)
        throw err;
});
