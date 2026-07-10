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

const contractors = [
  {
    company_name: 'Chicago HVAC Pros',
    owner_name: 'John Miller',
    email: 'john@chicagohvacpros.com',
    city: 'Chicago',
    trade: 'hvac',
    pain: 'the constant phone tag trying to get technicians dispatched to the next job when they are in the middle of a call',
  },
  {
    company_name: 'Seattle Plumbing Experts',
    owner_name: 'Sarah Jenkins',
    email: 'sarah@seattleplumbexpert.com',
    city: 'Seattle',
    trade: 'plumbing',
    pain: 'having to call plumbers back and forth while they are under a sink or on the road just to update their schedule',
  },
  {
    company_name: 'Austin Electric & Power',
    owner_name: 'Michael Silva',
    email: 'michael@austinelectricpower.com',
    city: 'Austin',
    trade: 'electrical',
    pain: 'the technician scheduling friction and endless phone tag trying to coordinate dispatch times',
  },
  {
    company_name: 'Windy City Locksmiths',
    owner_name: 'David Alvarez',
    email: 'david@windycitylocksmiths.com',
    city: 'Chicago',
    trade: 'locksmith',
    pain: 'the chaos of emergency dispatching and playing phone tag with technicians to see who is available',
  },
  {
    company_name: 'Emerald City Cleaning Co',
    owner_name: 'Emily Davis',
    email: 'emily@emeraldcitycleaners.com',
    city: 'Seattle',
    trade: 'cleaning',
    pain: 'the headache of manual scheduling changes and trying to dispatch cleaners without constantly interrupting their work',
  },
  {
    company_name: 'Lone Star Landscaping',
    owner_name: 'Robert Garcia',
    email: 'robert@lonestarlandscaping.com',
    city: 'Austin',
    trade: 'landscaping',
    pain: 'the dispatcher playing phone tag to coordinate route changes and scheduling updates with crews in the field',
  },
  {
    company_name: 'Chicago Roofing Solutions',
    owner_name: 'Kevin Smith',
    email: 'kevin@chicagoroofingsolutions.com',
    city: 'Chicago',
    trade: 'roofing',
    pain: 'the difficulty of manual scheduling and dispatching teams on-site when details change last minute',
  },
  {
    company_name: 'Seattle Pest Control',
    owner_name: 'Linda Johnson',
    email: 'linda@seattlepestcontrol.net',
    city: 'Seattle',
    trade: 'pest_control',
    pain: 'the scheduling friction and phone tag when trying to coordinate appointment times between dispatchers and techs',
  },
  {
    company_name: 'Austin Emergency Restoration',
    owner_name: 'James Wilson',
    email: 'james@austinrestoration.com',
    city: 'Austin',
    trade: 'restoration',
    pain: 'the critical phone tag delays when trying to dispatch restoration teams to emergency jobs',
  },
  {
    company_name: 'Chicago Handyman Guild',
    owner_name: 'Thomas White',
    email: 'thomas@chicagohandymanguild.com',
    city: 'Chicago',
    trade: 'handyman',
    pain: 'the tedious phone tag and manual dispatching needed to coordinate multiple small jobs throughout the day',
  },
];

const statusPath = path.resolve('reports/contractor-outreach-status.json');

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
  if (!token || !fromEmail) {
    console.error('ERROR: ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL must be set in .env');
    process.exit(1);
  }

  let statusLog = {};
  if (fs.existsSync(statusPath)) {
    statusLog = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  console.log(`--- Contractor Outreach Sender (${isLive ? 'LIVE MODE' : 'DRY RUN MODE'}) ---`);
  console.log(`Sender: ${fromName} <${fromEmail}>\n`);

  let sentCount = 0;

  for (const lead of contractors) {
    if (statusLog[lead.email] === 'sent') {
      console.log(`[Skip] ${lead.email} - Already sent previously.`);
      continue;
    }

    const greeting = lead.owner_name ? `Hi ${lead.owner_name}` : 'Hi there';
    const cityString = lead.city ? ` in ${lead.city}` : '';

    const subject = `quick question about ${lead.company_name}'s scheduling`;
    const body = `${greeting},

I came across ${lead.company_name}${cityString} and wanted to reach out directly.

Most ${lead.trade} business owners I talk to are completely fed up with ${lead.pain}. Traditional scheduling apps are usually too clunky, and getting technicians to actually download and use a complicated app is a constant battle.

We built Gainhelm to solve this. It's a simple, agent-first dispatch assistant that handles your scheduling and sends jobs straight to your technicians via SMS—they don't need to download any app at all. Everything is routed via simple SMS text messages.

We're opening up spots on our waitlist right now. You can check it out and join at https://gainhelm.com.

Best,

Arif Coskun
Gainhelm Team`;

    console.log(`[Target] Preparing pitch for ${lead.email} (${lead.company_name})...`);

    if (isLive) {
      try {
        await sendZeptoMail({
          toEmail: lead.email,
          toName: lead.owner_name || lead.company_name,
          subject,
          body,
        });
        console.log(`SUCCESS: Sent to ${lead.email}`);
        statusLog[lead.email] = 'sent';
        fs.writeFileSync(statusPath, JSON.stringify(statusLog, null, 2), 'utf-8');
        sentCount++;
        // Throttle to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`FAILED: ${lead.email} - ${err.message}`);
        statusLog[lead.email] = `failed: ${err.message}`;
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
