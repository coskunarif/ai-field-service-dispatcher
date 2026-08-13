#!/usr/bin/env node
/**
 * Utility script to fetch and display the first customer in the waiting list.
 *
 * Usage:
 *   node scripts/get-first-waitlist-customer.mjs [--json]
 */

import postgres from 'postgres';
import fs from 'fs';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

async function getFirstCustomer() {
  const isJson = process.argv.includes('--json');
  let firstCustomer = null;
  let source = null;
  let sql = null;

  try {
    sql = postgres(connectionString, { connect_timeout: 5 });

    // 1. Check waitlist_leads table
    try {
      const waitlist = await sql`SELECT * FROM waitlist_leads ORDER BY created_at ASC LIMIT 1;`;
      if (waitlist.length > 0) {
        firstCustomer = waitlist[0];
        source = 'waitlist_leads (PostgreSQL Database)';
      }
    } catch {
      // Table might not exist or connection failed
    }

    // 2. Fallback to social_leads table if no waitlist_leads entry exists
    if (!firstCustomer) {
      try {
        const socialLeads =
          await sql`SELECT * FROM social_leads ORDER BY intent_score DESC, created_at ASC LIMIT 1;`;
        if (socialLeads.length > 0) {
          firstCustomer = socialLeads[0];
          source = 'social_leads (High-Intent Prospect Queue)';
        }
      } catch {
        // Table might not exist
      }
    }
  } catch {
    // Database connection error
  } finally {
    if (sql) {
      await sql.end();
    }
  }

  // 3. Fallback to First Customer Finder Analysis artifact if database yields no leads
  if (!firstCustomer && fs.existsSync('./outputs/first-customer-finder/analysis.json')) {
    try {
      const analysisData = JSON.parse(
        fs.readFileSync('./outputs/first-customer-finder/analysis.json', 'utf8')
      );
      if (analysisData.prospects && analysisData.prospects.length > 0) {
        firstCustomer = analysisData.prospects[0];
        source = 'first-customer-finder analysis report';
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  if (!firstCustomer) {
    if (isJson) {
      console.log(JSON.stringify({ error: 'No waiting list customers found' }));
    } else {
      console.log('No waiting list customers found.');
    }
    process.exit(0);
  }

  if (isJson) {
    console.log(JSON.stringify({ source, customer: firstCustomer }, null, 2));
  } else {
    console.log('\n======================================================');
    console.log('         FIRST CUSTOMER IN THE WAITING LIST          ');
    console.log('======================================================');
    console.log(`Source:        ${source}`);
    console.log(`Name:          ${firstCustomer.name || firstCustomer.title || 'N/A'}`);
    console.log(`Email / URL:   ${firstCustomer.email || firstCustomer.source_url || 'N/A'}`);
    console.log(
      `Company / Type:${firstCustomer.company || firstCustomer.type || firstCustomer.platform || 'N/A'}`
    );
    if (firstCustomer.snippet || firstCustomer.pain_signal) {
      console.log(`Pain Signal:   ${firstCustomer.snippet || firstCustomer.pain_signal}`);
    }
    if (firstCustomer.intent_score || firstCustomer.score) {
      console.log(`Intent Score:  ${firstCustomer.intent_score || firstCustomer.score}/100`);
    }
    if (firstCustomer.suggested_reply || firstCustomer.opener) {
      console.log(`Outreach Pitch:${firstCustomer.suggested_reply || firstCustomer.opener}`);
    }
    console.log(`Created At:    ${firstCustomer.created_at || firstCustomer.signal_date || 'N/A'}`);
    console.log('======================================================\n');
  }
}

getFirstCustomer();
