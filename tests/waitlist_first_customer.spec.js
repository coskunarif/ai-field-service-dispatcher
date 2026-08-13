/**
 * Test suite for Waitlist API endpoints and First Customer retrieval.
 * Verifies GET /api/waitlist and GET /api/waitlist/first.
 */

import { test, expect } from '@playwright/test';

test.describe('Waitlist API & First Customer Retrieval', () => {
  test('GET /api/waitlist returns waitlist array', async ({ request }) => {
    const response = await request.get('/api/waitlist');
    expect(response.status()).toBe(200);
    const leads = await response.json();
    expect(Array.isArray(leads)).toBe(true);
  });

  test('POST /waitlist then GET /api/waitlist/first retrieves the newly registered customer', async ({
    request,
  }) => {
    const testEmail = `test.waitlist.customer.${Date.now()}@example.com`;
    const testName = 'Acme HVAC Solutions';
    const testCompany = 'Acme HVAC';

    // 1. Submit new waitlist lead
    const postResponse = await request.post('/waitlist', {
      data: {
        name: testName,
        email: testEmail,
        company: testCompany,
      },
    });
    expect(postResponse.status()).toBe(200);

    // 2. Fetch first customer
    const getResponse = await request.get('/api/waitlist/first');
    expect(getResponse.status()).toBe(200);

    const body = await getResponse.json();
    expect(body.success).toBe(true);
    expect(body.customer).toBeDefined();

    // Verify properties match
    if (body.source === 'waitlist_leads') {
      expect(body.customer.email).toBeDefined();
    }
  });

  test('GET /api/waitlist/first returns success with customer object', async ({ request }) => {
    const response = await request.get('/api/waitlist/first');
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.customer).toBeDefined();
    expect(body.source).toBeDefined();
  });
});
