import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const targetUrls = [
  'https://trycentral.com/blog/hvac-dispatch-software',
  'https://myquoteiq.com/best-dispatch-software-hvac-2026/',
  'https://www.fieldboss.com/blog/best-hvac-field-service-software/',
  'https://www.bdrco.com/blog/hvac-scheduling-software/',
  'https://fieldpathpro.com/blog/hvac-service-dispatch-software',
  'https://companycam.com/resources/blog/apps-software-for-plumbing-contractors',
  'https://www.equipter.com/equipter-articles/3-handy-hvac-dispatch-software-programs',
  'https://www.thryv.com/blog/8-best-scheduling-dispatch-software-for-plumbers/',
  'https://timeero.com/post/apps-plumbing-business',
  'https://planado.app/industries/plumbers',
  'https://www.getweave.com/how-a-plumbing-scheduling-software-offers-flexibility-in-unpredictable-jobs/',
  'https://www.ownedandoperated.com/post/why-you-need-a-dispatcher-in-your-hvac-plumbing-and-electrical-business',
  'https://www.businessgenieapp.com/industries/plumbing/dispatch-software',
];

// Helper to extract email addresses from page text
function findEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return Array.from(new Set(matches));
}

// Generate a personalized listicle pitch email
function generateListiclePitch(url, companyOrDomain, matchedEmails) {
  const isPlumbing =
    url.toLowerCase().includes('plumbing') || url.toLowerCase().includes('plumber');
  const isHvac = url.toLowerCase().includes('hvac');
  const tradeType = isPlumbing ? 'plumbing' : isHvac ? 'HVAC' : 'field service';

  const recipientEmail = matchedEmails.length > 0 ? matchedEmails[0] : `editor@${companyOrDomain}`;

  return `To: ${recipientEmail}
Subject: Lightweight addition for your ${tradeType} software list

Hi there,

I came across your guide comparing the best dispatch and scheduling software for ${tradeType} teams (${url}). It's a great breakdown of the complex platforms out there.

I wanted to suggest a new addition for your list: GainHelm (https://gainhelm.com).

Unlike heavy CRMs, GainHelm is built specifically for small teams (1-20 techs) who want hands-off, app-less scheduling. Technicians receive and accept job offers entirely via automated SMS or WhatsApp without having to download or log into an app, and the jobs sync automatically to the owner's Google Calendar.

We'd love to be included as a "simple, app-less alternative for small teams" in your next update. Happy to write a quick 150-word description or provide high-res screenshots if you'd like.

Best,
Arif Coskun
Founder, GainHelm`;
}

async function scrapeOutreachTargets() {
  console.log('Launching browser to find listicle emails...');
  const browser = await chromium.launch({ headless: true, args: ['--disable-ipv6'] });
  const context = await browser.newContext();

  const leads = [];

  for (const url of targetUrls) {
    console.log(`\nAnalyzing: ${url}...`);
    const page = await context.newPage();
    const domain = new URL(url).hostname.replace('www.', '');

    try {
      // Go to page
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Extract text content and mailto links
      const bodyText = await page.innerText('body');
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href.startsWith('mailto:'));
      });

      // Extract emails
      let emails = findEmails(bodyText);
      for (const href of hrefs) {
        const mail = href.replace('mailto:', '').split('?')[0].trim();
        if (mail) emails.push(mail);
      }
      emails = Array.from(new Set(emails.map(e => e.toLowerCase())));

      console.log(`Found emails: ${emails.length > 0 ? emails.join(', ') : 'None'}`);

      // Draft the pitch
      const pitch = generateListiclePitch(url, domain, emails);

      leads.push({
        url,
        domain,
        emails,
        pitch,
      });
    } catch (err) {
      console.error(`Failed to scrape ${url}:`, err.message);
      // Still add to leads list with a placeholder editor email
      const pitch = generateListiclePitch(url, domain, []);
      leads.push({
        url,
        domain,
        emails: [],
        pitch,
        error: err.message,
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Save JSON
  const reportsDir = path.resolve('reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'automated-outreach-leads.json'),
    JSON.stringify(leads, null, 2),
    'utf-8'
  );
  console.log(`Saved JSON output to: reports/automated-outreach-leads.json`);

  // Generate markdown report
  let report = `# GainHelm Automated Listicle Outreach Report\n`;
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  report += `This report lists outreach targets discovered by scanning the ranking listicles for HVAC/Plumbing scheduling. Pitch emails have been drafted for each editor.\n\n`;

  report += `| Domain | Target URL | Discovered Emails | Action Status |\n`;
  report += `| :--- | :--- | :--- | :--- |\n`;
  for (const lead of leads) {
    const emailStr =
      lead.emails.length > 0 ? lead.emails.join(', ') : `editor@${lead.domain} (Suggested)`;
    report += `| **${lead.domain}** | [Link](${lead.url}) | ${emailStr} | Ready to Send |\n`;
  }

  report += `\n## Drafted Outreach Emails\n\n`;
  for (const lead of leads) {
    report += `### Pitch to ${lead.domain}\n`;
    report += `**Page**: ${lead.url}\n\n`;
    report += `\`\`\`\n${lead.pitch}\n\`\`\`\n\n`;
    report += `---\n\n`;
  }

  fs.writeFileSync(path.join(reportsDir, 'automated-outreach-leads.md'), report, 'utf-8');
  console.log(`Saved Markdown report to: reports/automated-outreach-leads.md`);
}

scrapeOutreachTargets().catch(console.error);
