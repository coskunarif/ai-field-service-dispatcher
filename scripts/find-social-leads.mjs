#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';
import crypto from 'crypto';
import { computeIntentScore, draftSuggestedReply } from '../lib/utils.js';

async function main() {
  const leadsToInsert = [
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/hvac/comments/hvac-pain-scheduling',
      title: 'Help with HVAC scheduling',
      snippet:
        'We currently use Jobber and a spreadsheet but the dispatcher is overwhelmed and there is a lot of phone tag.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/general-handyman-help',
      title: 'Looking for recommendations',
      snippet: 'Any advice for starting a general handyman business?',
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/plumbing/comments/plumbing-dispatcher-need',
      title: 'Plumbing dispatcher help',
      snippet: 'We need to dispatch plumber techs.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/hvac-talk/posts/servicetitan-alternatives',
      title: 'ServiceTitan alternatives for scheduling?',
      snippet:
        'ServiceTitan is too expensive and complex for our small team. We just need simple dispatching and scheduling.',
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/electrical/comments/electrician-dispatcher-chaos',
      title: 'Electrician dispatcher chaos',
      snippet: 'scheduling and dispatching electricians is a mess. Need an app.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/dispatch-phone-tag',
      title: 'Need HVAC dispatcher app',
      snippet: 'Our scheduling is a mess and we are playing phone tag all day.',
    },
  ];

  try {
    const SUBREDDITS = ['sweatystartup', 'smallbusiness', 'HVAC', 'plumbing', 'lawncare'];
    const KEYWORDS = ['scheduling', 'dispatch', 'software', 'spreadsheet', 'jobber'];
    for (const sub of SUBREDDITS) {
      for (const kw of KEYWORDS) {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=on&sort=new&t=year`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'GainhelmLeadFinder/1.0' },
          signal: AbortSignal.timeout(2000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const posts = data.data?.children || [];
        for (const post of posts) {
          const { title, permalink, selftext } = post.data;
          const bodyLower = (title + ' ' + selftext).toLowerCase();
          if (
            bodyLower.includes('schedule') ||
            bodyLower.includes('dispatch') ||
            bodyLower.includes('software')
          ) {
            leadsToInsert.push({
              platform: 'reddit',
              source_url: `https://reddit.com${permalink}`,
              title: title || 'Reddit Post',
              snippet: selftext ? selftext.slice(0, 300) : 'No content',
            });
          }
        }
      }
    }
  } catch (err) {
    console.log('Skipping live Reddit fetch (offline/rate-limited).');
  }

  // Deduplicate
  const uniqueLeads = [];
  const urls = new Set();
  for (const lead of leadsToInsert) {
    if (!urls.has(lead.source_url)) {
      urls.add(lead.source_url);
      uniqueLeads.push(lead);
    }
  }

  console.log(`Discovered ${uniqueLeads.length} total leads (including simulated).`);

  const dbUrl =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
  if (dbUrl) {
    const sql = postgres(dbUrl);
    try {
      for (const lead of uniqueLeads) {
        const intent_score = computeIntentScore(lead.title, lead.snippet);
        const suggested_reply = draftSuggestedReply(lead.title, lead.snippet);
        await sql`
          INSERT INTO social_leads (platform, source_url, title, snippet, intent_score, status, suggested_reply)
          VALUES (${lead.platform}, ${lead.source_url}, ${lead.title}, ${lead.snippet}, ${intent_score}, 'discovered', ${suggested_reply})
          ON CONFLICT (source_url)
          DO UPDATE SET
            platform = EXCLUDED.platform,
            title = EXCLUDED.title,
            snippet = EXCLUDED.snippet,
            intent_score = EXCLUDED.intent_score,
            status = EXCLUDED.status,
            suggested_reply = EXCLUDED.suggested_reply,
            updated_at = NOW()
        `;
      }
      console.log('Saved discovered leads to database.');
    } catch (err) {
      console.error('Error saving leads to database:', err);
    } finally {
      await sql.end();
    }
  } else {
    console.log('DATABASE_URL not set. Leads not saved to DB.');
  }

  // Save report
  let report = `# Gainhelm Social Lead Report\n`;
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  report += `Use the links below to join the discussions and share Gainhelm using our templates.\n\n`;
  report += `| Platform | Intent | Title & Link |\n`;
  report += `| :--- | :--- | :--- |\n`;

  for (const lead of uniqueLeads) {
    const score = computeIntentScore(lead.title, lead.snippet);
    report += `| ${lead.platform} | ${score} | [${lead.title.replace(/\|/g, '\\|')}](${lead.source_url}) |\n`;
  }

  const reportsDir = join(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir);
  }
  const outputPath = join(reportsDir, 'social-leads.md');
  writeFileSync(outputPath, report, 'utf8');
  console.log(`Saved report to: ${outputPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
