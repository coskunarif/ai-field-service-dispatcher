import fs from 'fs';
import path from 'path';

// Load .env
try {
  const envPath = path.resolve('.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed
          .substring(idx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
} catch (e) {
  // Ignore
}

const token = process.env.ZEPTOMAIL_TOKEN;
const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'Alex';

const isLive = process.argv.includes('--live');

const leadsPath = path.resolve('reports/automated-outreach-leads.json');
const statusPath = path.resolve('reports/outreach-status.json');

async function sendZeptoMail({ toEmail, toName, subject, body }) {
  const url = 'https://api.zeptomail.com/v1.1/email';
  const payload = {
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: toEmail,
          name: toName,
        },
      },
    ],
    subject: subject,
    textbody: body,
    htmlbody: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.5;">${body}</div>`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token.startsWith('Zoho-enczapikey') ? token : `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

async function run() {
  if (!fs.existsSync(leadsPath)) {
    console.error('ERROR: reports/automated-outreach-leads.json not found. Run the scraper first.');
    process.exit(1);
  }

  if (!token || !fromEmail) {
    console.error('ERROR: ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL must be set in .env');
    process.exit(1);
  }

  const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
  let statusLog = {};
  if (fs.existsSync(statusPath)) {
    statusLog = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  console.log(`--- Outreach Sender (${isLive ? 'LIVE MODE' : 'DRY RUN MODE'}) ---`);
  console.log(`Sender: ${fromName} <${fromEmail}>\n`);

  let sentCount = 0;

  for (const lead of leads) {
    const targetEmail = lead.emails.length > 0 ? lead.emails[0] : null;

    if (!targetEmail) {
      console.log(`[Skip] ${lead.domain} - No email found.`);
      continue;
    }

    if (statusLog[targetEmail] === 'sent') {
      console.log(`[Skip] ${targetEmail} - Already sent previously.`);
      continue;
    }

    console.log(`[Target] Sending pitch to ${targetEmail} (${lead.domain})...`);

    // Parse pitch to separate subject and body
    const pitchLines = lead.pitch.split('\n');
    let subject = `Lightweight addition for your software list`;
    let bodyLines = [];
    let parsingBody = false;

    for (const line of pitchLines) {
      if (line.startsWith('Subject:')) {
        subject = line.replace('Subject:', '').trim();
        parsingBody = true;
        continue;
      }
      if (parsingBody) {
        bodyLines.push(line);
      }
    }
    const body = bodyLines.join('\n').trim();

    if (isLive) {
      try {
        await sendZeptoMail({
          toEmail: targetEmail,
          toName: targetEmail.split('@')[0],
          subject,
          body,
        });
        console.log(`SUCCESS: Sent to ${targetEmail}`);
        statusLog[targetEmail] = 'sent';
        fs.writeFileSync(statusPath, JSON.stringify(statusLog, null, 2), 'utf-8');
        sentCount++;
        // Throttle to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`FAILED: ${targetEmail} - ${err.message}`);
        statusLog[targetEmail] = `failed: ${err.message}`;
        fs.writeFileSync(statusPath, JSON.stringify(statusLog, null, 2), 'utf-8');
      }
    } else {
      console.log(`Subject: ${subject}`);
      console.log(`Body Snippet: ${body.substring(0, 150)}...\n`);
      sentCount++;
    }
  }

  console.log(`\nProcess completed. Total processed: ${sentCount}`);
  if (!isLive) {
    console.log('To actually send these emails, run the command with the --live flag.');
  }
}

run().catch(console.error);
