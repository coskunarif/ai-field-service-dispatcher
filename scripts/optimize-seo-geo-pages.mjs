import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const rootDir = '/home/ubuntuadmin/projects/ai-field-service-dispatcher';

// Files to process: all .html files at the root, excluding index.html
const files = readdirSync(rootDir).filter(file => file.endsWith('.html') && file !== 'index.html');

console.log(`Found ${files.length} HTML files to optimize.`);

const tradeMap = {
  'hvac-dispatch-software': {
    trade: 'HVAC',
    desc: 'Gainhelm is a lightweight HVAC dispatch app and scheduling software designed to help small service teams organize technician assignments and schedule service calls via SMS/WhatsApp text messaging, eliminating office phone tag and spreadsheet chaos.',
  },
  'plumbing-dispatch-software': {
    trade: 'plumbing',
    desc: 'Gainhelm is a lightweight plumbing dispatch software and plumber scheduling app built for small plumbing teams to coordinate technician assignments, manage work-order handoffs, and schedule service calls via SMS text messaging without app setup friction.',
  },
  'electrical-dispatch-software': {
    trade: 'electrical',
    desc: 'Gainhelm is a lightweight electrical scheduling and electrician dispatch software designed for small electrician teams to assign service calls, track jobs on the dispatch board, and update technicians via simple SMS text messaging.',
  },
  'appliance-repair-dispatch-software': {
    trade: 'appliance repair',
    desc: 'Gainhelm is a lightweight appliance repair dispatch software and scheduling app built for small repair teams to schedule service requests, coordinate jobs, and dispatch technicians using simple app-less SMS text messages.',
  },
  'pest-control-dispatch-software': {
    trade: 'pest control',
    desc: 'Gainhelm is a lightweight pest control scheduling and dispatch software built for small service teams to schedule requests, coordinate jobs, and update exterminators via simple app-less SMS/WhatsApp messaging.',
  },
  'garage-door-dispatch-software': {
    trade: 'garage door',
    desc: 'Gainhelm is a lightweight garage door dispatch and scheduling software built for small repair teams to organize technician scheduling, manage work-order updates, and coordinate daily dispatches via simple SMS text messages.',
  },
  'cleaning-dispatch-software': {
    trade: 'cleaning',
    desc: 'Gainhelm is a lightweight cleaning dispatch and maid scheduling software built for residential and commercial cleaning crews to assign jobs, track cleaners, and manage scheduling via app-less SMS/WhatsApp text messages.',
  },
  'landscaping-dispatch-software': {
    trade: 'landscaping',
    desc: 'Gainhelm is a lightweight landscaping dispatch and lawn care scheduling software designed for small field crews to assign jobs, coordinate arborists, and update landscaping technicians via simple app-less SMS.',
  },
  'roofing-dispatch-software': {
    trade: 'roofing',
    desc: 'Gainhelm is a lightweight roofing dispatch and crew scheduling software built for small roofing contractors to assign service calls, manage jobs, and coordinate roofers via app-less SMS/WhatsApp messaging.',
  },
  'locksmith-dispatch-software': {
    trade: 'locksmith',
    desc: 'Gainhelm is a lightweight locksmith dispatch and scheduling software designed for small locksmith teams to coordinate emergency jobs, schedule service requests, and update field crews via app-less SMS text messages.',
  },
  'pool-service-dispatch-software': {
    trade: 'pool service',
    desc: 'Gainhelm is a lightweight pool service dispatch and scheduling software built for small pool maintenance teams to coordinate technician assignment and schedule maintenance visits via simple SMS text messaging.',
  },
  'commercial-facilities-dispatch-software': {
    trade: 'commercial facilities',
    desc: 'Gainhelm is a lightweight commercial facilities dispatch and job scheduling software designed for maintenance crews to schedule service calls, assign work orders, and coordinate technicians via simple SMS text messages.',
  },
  'septic-service-dispatch-software': {
    trade: 'septic service',
    desc: 'Gainhelm is a lightweight septic service dispatch and scheduling software designed for small septic teams to coordinate pumpings, assign work orders, and update technicians via simple app-less SMS.',
  },
  'emergency-restoration-dispatch-software': {
    trade: 'emergency restoration',
    desc: 'Gainhelm is a lightweight emergency restoration dispatch and crew scheduling software designed for disaster recovery teams to assign emergency calls, coordinate technicians, and route crews via app-less SMS/WhatsApp.',
  },
  'restoration-job-management-software': {
    trade: 'restoration job management',
    desc: 'Gainhelm is a lightweight restoration job management and dispatch software built for small restoration teams to organize incoming jobs, schedule service calls, and coordinate crews via app-less SMS/WhatsApp.',
  },
  'handyman-dispatch-software': {
    trade: 'handyman',
    desc: 'Gainhelm is a lightweight handyman dispatch and scheduling software designed for small contractor teams to schedule repair calls, assign jobs, and coordinate technicians via simple SMS text messaging.',
  },
  'carpet-cleaning-dispatch-software': {
    trade: 'carpet cleaning',
    desc: 'Gainhelm is a lightweight carpet cleaning dispatch and scheduling software built for small cleaning teams to schedule service requests, assign trucks, and update technicians via simple SMS text messaging.',
  },
  'tree-service-dispatch-software': {
    trade: 'tree service',
    desc: 'Gainhelm is a lightweight tree service crew scheduling and arborist dispatch software designed for small field crews to assign jobs, coordinate tree work, and update crews via simple app-less SMS.',
  },
  'painting-dispatch-software': {
    trade: 'painting',
    desc: 'Gainhelm is a lightweight painting dispatch and scheduling software designed for small painting crews to assign jobs, coordinate painter schedules, and send project updates via simple SMS text messaging.',
  },
  'pressure-washing-dispatch-software': {
    trade: 'pressure washing',
    desc: 'Gainhelm is a lightweight pressure washing dispatch and scheduling software designed for small exterior cleaning crews to schedule jobs, assign technicians, and coordinate daily dispatches via simple SMS text messaging.',
  },
  'junk-removal-dispatch-software': {
    trade: 'junk removal',
    desc: 'Gainhelm is a lightweight junk removal dispatch and truck scheduling software built for small hauling crews to organize daily routes, assign pickup locations, and update crews via simple SMS text messaging.',
  },
};

for (const file of files) {
  const filePath = join(rootDir, file);
  let content = readFileSync(filePath, 'utf8');

  // 1. Add RSL link tag inside <head> if not present
  if (!content.includes('href="/rsl.xml"')) {
    const headEnd = content.indexOf('</head>');
    if (headEnd !== -1) {
      content =
        content.slice(0, headEnd) +
        '  <link rel="license" type="application/rsl+xml" href="/rsl.xml">\n' +
        content.slice(headEnd);
    }
  }

  // 2. Add E-E-A-T note to the footer copyright div if not present
  if (!content.includes('Verified by Coskun Arif')) {
    content = content.replace(
      '© 2026 Gainhelm. Built for field service dispatch.',
      '© 2026 Gainhelm. Built for field service dispatch. • Verified by Coskun Arif, Field Service Expert'
    );
    // Also check other variations:
    content = content.replace(
      'Built for field service dispatch.</div>',
      'Built for field service dispatch. • Verified by Coskun Arif, Field Service Expert</div>'
    );
  }

  // 3. Update JSON-LD application/ld+json schemas to add author & dateModified to WebPage
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  content = content.replace(jsonLdRegex, (match, p1) => {
    try {
      const json = JSON.parse(p1.trim());
      let modified = false;
      const updateWebPageObj = obj => {
        if (obj && obj['@type'] === 'WebPage') {
          obj.author = {
            '@type': 'Person',
            name: 'Coskun Arif',
            jobTitle: 'Field Service Expert',
          };
          obj.datePublished = obj.datePublished || '2026-05-19';
          obj.dateModified = '2026-06-26';
          modified = true;
        }
      };

      if (json['@graph'] && Array.isArray(json['@graph'])) {
        for (const item of json['@graph']) {
          updateWebPageObj(item);
        }
      } else {
        updateWebPageObj(json);
      }

      if (modified) {
        return `<script type="application/ld+json">${JSON.stringify(json, null, 2)}</script>`;
      }
    } catch (e) {
      console.error(`Error parsing JSON-LD in ${file}:`, e.message);
    }
    return match;
  });

  // 4. Opening paragraph citability audit
  const nameWithoutExt = file.replace('.html', '');
  if (tradeMap[nameWithoutExt]) {
    const data = tradeMap[nameWithoutExt];
    const heroCopyStart = content.indexOf('<div class="hero-copy">');
    if (heroCopyStart !== -1) {
      const nextParagraphStart = content.indexOf('<p', heroCopyStart);
      const nextParagraphEnd = content.indexOf('</p>', nextParagraphStart);
      if (
        nextParagraphStart !== -1 &&
        nextParagraphEnd !== -1 &&
        nextParagraphStart < content.indexOf('<form', heroCopyStart)
      ) {
        const tagStartEnd = content.indexOf('>', nextParagraphStart);
        content = content.slice(0, tagStartEnd + 1) + data.desc + content.slice(nextParagraphEnd);
        console.log(`Optimized paragraph for ${file}`);
      }
    }
  }

  writeFileSync(filePath, content, 'utf8');
}

console.log('All static HTML pages optimized successfully.');
