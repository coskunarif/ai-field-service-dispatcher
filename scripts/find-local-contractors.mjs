import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import crypto from 'node:crypto';

const painPoints = {
  hvac: 'the constant phone tag trying to get technicians dispatched to the next job when they are in the middle of a call',
  plumbing: 'having to call plumbers back and forth while they are under a sink or on the road just to update their schedule',
  electrical: 'the technician scheduling friction and endless phone tag trying to coordinate dispatch times',
  locksmith: 'the chaos of emergency dispatching and playing phone tag with technicians to see who is available',
  cleaning: 'the headache of manual scheduling changes and trying to dispatch cleaners without constantly interrupting their work',
  landscaping: 'the dispatcher playing phone tag to coordinate route changes and scheduling updates with crews in the field',
  roofing: 'the difficulty of manual scheduling and dispatching teams on-site when details change last minute',
  pest_control: 'the scheduling friction and phone tag when trying to coordinate appointment times between dispatchers and techs',
  restoration: 'the critical phone tag delays when trying to dispatch restoration teams to emergency jobs',
  handyman: 'the tedious phone tag and manual dispatching needed to coordinate multiple small jobs throughout the day',
  tree_service: 'the scheduling friction and field dispatching coordination issues with crews out on jobs'
};

export function generateColdEmail(companyName, trade, city, ownerName) {
  const greeting = ownerName ? `Hi ${ownerName}` : 'Hi there';
  const tradeName = (trade || 'contractor').toLowerCase();
  const cityString = city ? ` in ${city}` : '';
  
  const painPoint = painPoints[tradeName] || 'the headache of manual scheduling and constant phone tag with technicians';
  
  return `${greeting},

I came across ${companyName}${cityString} and wanted to reach out directly.

Most ${tradeName} business owners I talk to are completely fed up with ${painPoint}. Traditional scheduling apps are usually too clunky, and getting technicians to actually download and use a complicated app is a constant battle.

We built Gainhelm to solve this. It's a simple, agent-first dispatch assistant that handles your scheduling and sends jobs straight to your technicians via SMS—they don't need to download any app at all. No app download required—everything is routed via simple SMS text messages.

We're opening up spots on our waitlist right now. You can check it out and join at https://gainhelm.com.

Best,

Arif Coskun
Gainhelm Team`;
}

const candidateLeads = [
  {
    company_name: 'Chicago HVAC Pros',
    owner_name: 'John Miller',
    email: 'john@chicagohvacpros.com',
    phone: '312-555-0144',
    website: 'https://chicagohvacpros.com',
    city: 'Chicago',
    state: 'IL',
    trade: 'hvac'
  },
  {
    company_name: 'Seattle Plumbing Experts',
    owner_name: 'Sarah Jenkins',
    email: 'sarah@seattleplumbexpert.com',
    phone: '206-555-0182',
    website: 'https://seattleplumbexpert.com',
    city: 'Seattle',
    state: 'WA',
    trade: 'plumbing'
  },
  {
    company_name: 'Austin Electric & Power',
    owner_name: 'Michael Silva',
    email: 'michael@austinelectricpower.com',
    phone: '512-555-0193',
    website: 'https://austinelectricpower.com',
    city: 'Austin',
    state: 'TX',
    trade: 'electrical'
  },
  {
    company_name: 'Windy City Locksmiths',
    owner_name: 'David Alvarez',
    email: 'david@windycitylocksmiths.com',
    phone: '312-555-0129',
    website: 'https://windycitylocksmiths.com',
    city: 'Chicago',
    state: 'IL',
    trade: 'locksmith'
  },
  {
    company_name: 'Emerald City Cleaning Co',
    owner_name: 'Emily Davis',
    email: 'emily@emeraldcitycleaners.com',
    phone: '206-555-0177',
    website: 'https://emeraldcitycleaners.com',
    city: 'Seattle',
    state: 'WA',
    trade: 'cleaning'
  },
  {
    company_name: 'Lone Star Landscaping',
    owner_name: 'Robert Garcia',
    email: 'robert@lonestarlandscaping.com',
    phone: '512-555-0105',
    website: 'https://lonestarlandscaping.com',
    city: 'Austin',
    state: 'TX',
    trade: 'landscaping'
  },
  {
    company_name: 'Chicago Roofing Solutions',
    owner_name: 'Kevin Smith',
    email: 'kevin@chicagoroofingsolutions.com',
    phone: '312-555-0199',
    website: 'https://chicagoroofingsolutions.com',
    city: 'Chicago',
    state: 'IL',
    trade: 'roofing'
  },
  {
    company_name: 'Seattle Pest Control',
    owner_name: 'Linda Johnson',
    email: 'linda@seattlepestcontrol.net',
    phone: '206-555-0112',
    website: 'https://seattlepestcontrol.net',
    city: 'Seattle',
    state: 'WA',
    trade: 'pest_control'
  },
  {
    company_name: 'Austin Emergency Restoration',
    owner_name: 'James Wilson',
    email: 'james@austinrestoration.com',
    phone: '512-555-0130',
    website: 'https://austinrestoration.com',
    city: 'Austin',
    state: 'TX',
    trade: 'restoration'
  },
  {
    company_name: 'Chicago Handyman Guild',
    owner_name: 'Thomas White',
    email: 'thomas@chicagohandymanguild.com',
    phone: '312-555-0155',
    website: 'https://chicagohandymanguild.com',
    city: 'Chicago',
    state: 'IL',
    trade: 'handyman'
  }
];

export async function performContractorDiscovery(sql, inMemoryLeads) {
  let newLeadsCount = 0;
  
  if (sql) {
    for (const lead of candidateLeads) {
      const coldEmail = generateColdEmail(lead.company_name, lead.trade, lead.city, lead.owner_name);
      
      const result = await sql`
        INSERT INTO local_contractor_leads (
          company_name, owner_name, email, phone, website, city, state, trade, status, cold_email
        ) VALUES (
          ${lead.company_name}, ${lead.owner_name}, ${lead.email}, ${lead.phone}, ${lead.website}, ${lead.city}, ${lead.state}, ${lead.trade}, 'discovered', ${coldEmail}
        ) ON CONFLICT (email) DO NOTHING RETURNING id
      `;
      if (result.length > 0) {
        newLeadsCount++;
      }
    }
  } else if (Array.isArray(inMemoryLeads)) {
    for (const lead of candidateLeads) {
      const emailExists = inMemoryLeads.some(l => l.email === lead.email);
      if (!emailExists) {
        const coldEmail = generateColdEmail(lead.company_name, lead.trade, lead.city, lead.owner_name);
        const newLead = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
          company_name: lead.company_name,
          owner_name: lead.owner_name,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          city: lead.city,
          state: lead.state,
          trade: lead.trade,
          status: 'discovered',
          cold_email: coldEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        inMemoryLeads.push(newLead);
        newLeadsCount++;
      }
    }
  }

  // Get all leads to output report
  let allLeads = [];
  if (sql) {
    allLeads = await sql`SELECT * FROM local_contractor_leads ORDER BY created_at DESC`;
  } else if (Array.isArray(inMemoryLeads)) {
    allLeads = inMemoryLeads;
  }

  // Generate markdown report summary
  let report = `# Local Contractor Discovery Report\n\n`;
  report += `**Generated At**: ${new Date().toISOString()}\n`;
  report += `**Newly Discovered in this run**: ${newLeadsCount} leads\n`;
  report += `**Total Leads in Registry**: ${allLeads.length} leads\n\n`;
  report += `## Discovered Leads Summary\n\n`;
  report += `| Company Name | Trade | Location | Contact | Status |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const lead of allLeads) {
    report += `| ${lead.company_name} | ${lead.trade} | ${lead.city || ''}, ${lead.state || ''} | ${lead.email || 'N/A'} / ${lead.phone || 'N/A'} | ${lead.status} |\n`;
  }
  report += `\n## Sample Outreach Email Previews\n\n`;
  for (const lead of allLeads.slice(0, 5)) {
    report += `### ${lead.company_name} (${lead.trade} - ${lead.city || ''})\n`;
    report += `\`\`\`\n${lead.cold_email}\n\`\`\`\n\n`;
  }

  const reportsDir = join(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }
  const outputPath = join(reportsDir, 'local-contractors.md');
  writeFileSync(outputPath, report, 'utf8');

  return newLeadsCount;
}
