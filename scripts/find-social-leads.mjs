#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SUBREDDITS = ['sweatystartup', 'smallbusiness', 'HVAC', 'plumbing', 'lawncare'];
const KEYWORDS = ['scheduling', 'dispatch', 'software', 'spreadsheet', 'jobber'];

async function fetchRedditLeads() {
  console.log('Searching Reddit for active scheduling and dispatch discussions...');
  const leads = [];

  for (const sub of SUBREDDITS) {
    for (const kw of KEYWORDS) {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=on&sort=new&t=year`;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'GainhelmLeadFinder/1.0' }
        });
        if (!res.ok) continue;
        const data = await res.json();
        const posts = data.data?.children || [];
        
        for (const post of posts) {
          const { title, permalink, num_comments, selftext, score, created_utc } = post.data;
          // Filter out low relevance posts
          const bodyLower = (title + ' ' + selftext).toLowerCase();
          if (bodyLower.includes('schedule') || bodyLower.includes('dispatch') || bodyLower.includes('software')) {
            leads.push({
              subreddit: sub,
              keyword: kw,
              title,
              url: `https://reddit.com${permalink}`,
              comments: num_comments,
              score,
              date: new Date(created_utc * 1000).toLocaleDateString(),
              snippet: selftext.slice(0, 200) + '...'
            });
          }
        }
      } catch (err) {
        console.error(`Error querying r/${sub} for "${kw}":`, err.message);
      }
    }
  }

  // Deduplicate by URL
  const uniqueLeads = Array.from(new Map(leads.map(item => [item.url, item])).values());
  // Sort by date (newest first)
  uniqueLeads.sort((a, b) => b.created_utc - a.created_utc);

  return uniqueLeads;
}

async function main() {
  const leads = await fetchRedditLeads();
  console.log(`Found ${leads.length} relevant discussions.`);

  let report = `# Gainhelm Social Lead Report\n`;
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  report += `Use the links below to join the discussions and share Gainhelm using our templates.\n\n`;
  report += `| Subreddit | Date | Comments | Score | Title & Link |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const lead of leads.slice(0, 30)) {
    report += `| r/${lead.subreddit} | ${lead.date} | ${lead.comments} | ${lead.score} | [${lead.title.replace(/\|/g, '\\|')}](${lead.url}) |\n`;
  }

  const outputPath = join(process.cwd(), 'reports', 'social-leads.md');
  writeFileSync(outputPath, report, 'utf8');
  console.log(`\nSuccess! Saved lead report to: ${outputPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
