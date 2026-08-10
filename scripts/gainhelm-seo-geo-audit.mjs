#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

let config = {};
if (existsSync('seo-audit-config.json')) {
  try {
    config = JSON.parse(readFileSync('seo-audit-config.json', 'utf8'));
  } catch (err) {
    // Ignore config parsing errors
  }
}

function shouldIgnore(p, message, type) {
  if (!p) return false;
  const routeConfig = config?.overrides?.[p];
  if (!routeConfig) return false;
  const list = type === 'warning' ? routeConfig.ignoreWarnings : routeConfig.ignoreErrors;
  if (!list || !Array.isArray(list)) return false;

  const cleanMsg = message.startsWith(`${p}: `) ? message.slice(`${p}: `.length) : message;

  return list.some(rule => {
    if (cleanMsg.toLowerCase().trim() === rule.toLowerCase().trim()) return true;
    if (cleanMsg.toLowerCase().includes(rule.toLowerCase())) return true;
    const ruleSlug = rule.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const msgSlug = cleanMsg.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (msgSlug.includes(ruleSlug)) return true;
    const ruleSpace = rule.replace(/-/g, ' ');
    if (cleanMsg.toLowerCase().includes(ruleSpace.toLowerCase())) return true;
    return false;
  });
}

const base = process.env.BASE_URL || '';
const live = /^https?:\/\//.test(base);
const origin = (base || 'https://gainhelm.com').replace(/\/$/, '');
const errors = [];
const warnings = [];

async function textFor(path) {
  if (live) {
    const res = await fetch(origin + path, {
      headers: { 'User-Agent': 'GainhelmSEOGeoAudit/1.0' },
    });
    if (!res.ok) errors.push(`${path}: HTTP ${res.status}`);
    return await res.text();
  }
  const route = path === '/' ? 'index.html' : path.slice(1);
  let file = route.includes('.') ? route : `${route}.html`;
  if (!existsSync(file)) {
    const hyphenated = route.replace(/\//g, '-') + (route.includes('.') ? '' : '.html');
    if (existsSync(hyphenated)) {
      file = hyphenated;
    }
  }
  return readFileSync(file, 'utf8');
}

function attr(tag, name) {
  const dq = tag?.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  if (dq) return dq[1];
  const sq = tag?.match(new RegExp(`${name}='([^']*)'`, 'i'));
  if (sq) return sq[1];
  const m = tag?.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return m?.[1] || '';
}
function meta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  return attr(html.match(re)?.[0], 'content');
}
function href(html, rel) {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, 'i');
  return attr(html.match(re)?.[0], 'href');
}
function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Decodes common HTML entities for accurate title comparisons
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'");
}

// Normalizes whitespace and HTML entities of titles
function normalizeTitle(str) {
  return decodeHtmlEntities(str).replace(/\s+/g, ' ').trim();
}

// Determines if page is a trade-specific landing page or key route page
function isTargetPage(p) {
  return true;
}

// Maps trade pages and key routes to their respective trade keywords
const TRADE_KEYWORDS = {
  hvac: ['hvac', 'heating', 'ac', 'air conditioning', 'ventilating', 'cooling'],
  plumbing: ['plumb', 'plumbing', 'plumber', 'plumbers'],
  electrical: ['electr', 'electrical', 'electrician', 'electricians'],
  'septic-service': ['septic', 'septic-service'],
  'pest-control': ['pest', 'exterminator', 'pest-control'],
  'garage-door': ['garage', 'door', 'garage-door'],
  landscaping: ['landscape', 'landscaping', 'landscaper', 'lawn', 'mowing'],
  locksmith: ['locksmith', 'locksmiths'],
  handyman: ['handyman', 'handymen', 'handyperson'],
  'appliance-repair': ['appliance', 'repair', 'appliance-repair'],
  'carpet-cleaning': ['carpet', 'cleaning', 'rug', 'carpet-cleaning'],
  cleaning: ['cleaning', 'cleaner', 'cleaners'],
  'commercial-facilities': ['commercial', 'facilities', 'facility', 'commercial-facilities'],
  'emergency-restoration': ['emergency', 'restoration', 'mitigation', 'emergency-restoration'],
  'junk-removal': ['junk', 'removal', 'trash', 'junk-removal'],
  painting: ['paint', 'painting', 'painter', 'painters'],
  'pressure-washing': ['pressure', 'washing', 'power', 'pressure-washing'],
  roofing: ['roof', 'roofing', 'roofer', 'roofers'],
  'tree-service': ['tree', 'service', 'arborist', 'tree-service'],
  'pool-service': ['pool', 'service', 'spa', 'pool-service'],
  'restoration-job-management': ['restoration', 'water damage', 'restoration-job-management'],
};

function getPageTradeKeywords(p) {
  const keyRoutes = {
    '/': ['field service', 'dispatch', 'scheduling', 'waitlist', 'technician'],
    '/field-service-scheduling': ['field service', 'scheduling', 'dispatch', 'technician'],
    '/mobile-dispatch-board': ['mobile', 'dispatch', 'board', 'ipad', 'tablet', 'technician'],
  };
  if (keyRoutes[p]) return keyRoutes[p];

  if (p.includes('alternative')) {
    return [
      'alternative',
      'dispatch',
      'scheduling',
      'field service',
      'technician',
      'contractor',
      'software',
      'servicetitan',
      'jobber',
      'housecall',
      'servicefusion',
      'buildops',
      'fieldedge',
    ];
  }
  if (p.includes('tool')) {
    return [
      'tool',
      'leads',
      'queue',
      'generator',
      'marketing',
      'facebook',
      'contractor',
      'dispatch',
      'scheduling',
    ];
  }
  if (
    p.includes('hvac-dispatch-app') ||
    p.includes('how-to-choose-hvac') ||
    p.includes('how-hvac-dispatch')
  ) {
    return [
      'hvac',
      'dispatch',
      'scheduling',
      'app',
      'software',
      'spreadsheets',
      'phone tag',
      'techs',
    ];
  }
  if (p.includes('how-to-automate-after-hours-plumbing-dispatch')) {
    return ['plumbing', 'plumber', 'dispatch', 'emergency', 'after-hours', 'sms', 'calendar'];
  }
  if (p.includes('how-to-sync-google-calendar-with-technician-dispatch')) {
    return [
      'google',
      'calendar',
      'dispatch',
      'technician',
      'sync',
      'hvac',
      'plumbing',
      'scheduling',
    ];
  }

  const tradeMatch = p.match(/^\/([a-z-]+)-(?:dispatch-software|job-management-software)$/);
  if (tradeMatch) {
    const tradeSlug = tradeMatch[1];
    const extraKeywords = TRADE_KEYWORDS[tradeSlug] || [];
    const words = tradeSlug.split('-');
    return Array.from(new Set([tradeSlug, ...words, ...extraKeywords]));
  }
  return [];
}

// Recursively finds all FAQPage blocks within a JSON-LD object/graph
function findFAQPages(obj) {
  const faqPages = [];
  function traverse(item) {
    if (!item || typeof item !== 'object') return;
    if (Array.isArray(item)) {
      item.forEach(traverse);
      return;
    }
    if (item['@type'] === 'FAQPage') {
      faqPages.push(item);
    }
    for (const key of Object.keys(item)) {
      traverse(item[key]);
    }
  }
  traverse(obj);
  return faqPages;
}

// Recursively finds all WebPage blocks within a JSON-LD object/graph
function findWebPages(obj) {
  const webPages = [];
  function traverse(item) {
    if (!item || typeof item !== 'object') return;
    if (Array.isArray(item)) {
      item.forEach(traverse);
      return;
    }
    if (item['@type'] === 'WebPage') {
      webPages.push(item);
    }
    for (const key of Object.keys(item)) {
      traverse(item[key]);
    }
  }
  traverse(obj);
  return webPages;
}

async function main() {
  let sitemap = live ? await textFor('/sitemap.xml') : readFileSync('sitemap.xml', 'utf8');
  let robots = live ? await textFor('/robots.txt') : readFileSync('robots.txt', 'utf8');
  let llms = live ? await textFor('/llms.txt') : readFileSync('llms.txt', 'utf8');

  if (!/Sitemap:\s*https:\/\/gainhelm\.com\/sitemap\.xml/i.test(robots))
    errors.push('robots.txt missing canonical sitemap declaration');
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'GoogleOther']) {
    if (!new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots))
      warnings.push(`robots.txt missing explicit ${bot} stanza`);
  }

  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (!urls.length) errors.push('sitemap.xml has no <loc> URLs');
  const paths = urls.map(u => (new URL(u).pathname === '/' ? '/' : new URL(u).pathname));
  console.log(`Auditing ${paths.length} sitemap routes (${live ? origin : 'local files'})`);

  const llmsLinks = new Set(
    [...llms.matchAll(/https:\/\/gainhelm\.com[^\s)]+/g)].map(m => new URL(m[0]).pathname)
  );
  for (const p of paths) if (!llmsLinks.has(p)) errors.push(`llms.txt missing sitemap route ${p}`);

  for (const p of paths) {
    const html = await textFor(p);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const desc = meta(html, 'description');
    const canonical = href(html, 'canonical');
    const robotsMeta = meta(html, 'robots');
    const h1s = [...html.matchAll(/<h1\b/gi)].length;
    const jsonLd = [
      ...html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      ),
    ];
    const form = html.match(/<form[^>]+id=["']waitlist-form["'][^>]*>/i)?.[0] || '';
    const card = meta(html, 'twitter:card');
    const body = strip(html).slice(0, 220);

    if (!title || title.length > 70) errors.push(`${p}: missing/long title (${title.length})`);
    if (!desc || desc.length < 120 || desc.length > 180)
      warnings.push(`${p}: meta description outside 120-180 chars (${desc.length})`);
    if (canonical !== `https://gainhelm.com${p === '/' ? '/' : p}`)
      errors.push(`${p}: canonical mismatch ${canonical || '(missing)'}`);
    if (/noindex/i.test(robotsMeta)) errors.push(`${p}: robots meta contains noindex`);
    if (h1s !== 1) errors.push(`${p}: expected one H1, found ${h1s}`);
    if (!jsonLd.length) errors.push(`${p}: missing JSON-LD`);
    for (const [i, m] of jsonLd.entries()) {
      try {
        JSON.parse(m[1]);
      } catch {
        errors.push(`${p}: invalid JSON-LD block ${i + 1}`);
      }
    }
    if (!form)
      warnings.push(
        `${p}: no inline waitlist form; confirm alternate CTA path intentionally handles conversion`
      );
    if (form && !/action=["']\/waitlist["']/i.test(form))
      warnings.push(`${p}: waitlist form lacks native /waitlist action`);
    if (form && !/method=["']post["']/i.test(form))
      warnings.push(`${p}: waitlist form lacks method=post`);
    if (card && card !== 'summary')
      warnings.push(
        `${p}: twitter:card is ${card}, expected summary unless a real share image exists`
      );
    if (!/dispatch|scheduling|field service|waitlist/i.test(body))
      warnings.push(`${p}: above-fold text may not state route intent early`);
    let localFile = p === '/' ? 'index.html' : `${basename(p)}.html`;
    if (!live && !existsSync(localFile)) {
      const hyphenated = p.slice(1).replace(/\//g, '-') + '.html';
      if (existsSync(hyphenated)) {
        localFile = hyphenated;
      }
    }
    if (!live && !existsSync(localFile))
      errors.push(`${p}: sitemap route has no local ${localFile}`);

    // Title alignment check for landing pages
    if (isTargetPage(p)) {
      const ogTitle = meta(html, 'og:title');
      const twitterTitle = meta(html, 'twitter:title');
      const normTitle = normalizeTitle(title);

      if (!ogTitle) {
        errors.push(`${p}: missing og:title`);
      } else {
        const normOgTitle = normalizeTitle(ogTitle);
        if (normOgTitle !== normTitle) {
          errors.push(`${p}: og:title mismatch (expected "${normTitle}", found "${normOgTitle}")`);
        }
      }

      if (!twitterTitle) {
        errors.push(`${p}: missing twitter:title`);
      } else {
        const normTwitterTitle = normalizeTitle(twitterTitle);
        if (normTwitterTitle !== normTitle) {
          errors.push(
            `${p}: twitter:title mismatch (expected "${normTitle}", found "${normTwitterTitle}")`
          );
        }
      }
    }

    // WebPage validation (author and dateModified)
    let webPagesFound = [];
    for (const m of jsonLd) {
      try {
        const parsed = JSON.parse(m[1]);
        const webPages = findWebPages(parsed);
        webPagesFound.push(...webPages);
      } catch (e) {
        // already handled by invalid JSON-LD check
      }
    }
    if (!webPagesFound.length) {
      errors.push(`${p}: missing WebPage schema in JSON-LD`);
    } else {
      for (const wp of webPagesFound) {
        const author = wp.author;
        const authorName =
          typeof author === 'string'
            ? author
            : author && typeof author === 'object'
              ? author.name
              : '';
        if (authorName !== 'Coskun Arif') {
          errors.push(
            `${p}: WebPage author must be "Coskun Arif" (found "${authorName || 'missing'}")`
          );
        }
        if (!wp.dateModified) {
          errors.push(`${p}: WebPage missing dateModified`);
        }
      }
    }

    // FAQPage validation check for landing pages
    if (isTargetPage(p)) {
      let maxTradeSpecificFaqs = 0;
      const kws = getPageTradeKeywords(p);

      for (const m of jsonLd) {
        try {
          const parsed = JSON.parse(m[1]);
          const faqPages = findFAQPages(parsed);
          for (const faq of faqPages) {
            let tradeSpecificFaqs = 0;
            if (faq.mainEntity && Array.isArray(faq.mainEntity)) {
              for (const qa of faq.mainEntity) {
                const qText = qa.name || '';
                const aText = qa.acceptedAnswer?.text || '';
                if (qText.trim() && aText.trim()) {
                  const combined = (qText + ' ' + aText).toLowerCase();
                  const isTradeSpec = kws.some(kw => combined.includes(kw.toLowerCase()));
                  if (isTradeSpec) {
                    tradeSpecificFaqs++;
                  }
                }
              }
            }
            if (tradeSpecificFaqs > maxTradeSpecificFaqs) {
              maxTradeSpecificFaqs = tradeSpecificFaqs;
            }
          }
        } catch (e) {
          // JSON parsing errors are already handled by baseline checks
        }
      }

      if (maxTradeSpecificFaqs === 0) {
        errors.push(`${p}: missing FAQPage block with trade-specific questions and answers`);
      } else if (maxTradeSpecificFaqs < 3) {
        errors.push(
          `${p}: FAQPage has only ${maxTradeSpecificFaqs} trade-specific Q&As, expected at least 3 (keywords: ${kws.join(', ')})`
        );
      }
    }
  }

  const filteredWarnings = warnings.filter(w => {
    const match = w.match(/^(\/[^:]*): (.*)$/);
    if (match) {
      return !shouldIgnore(match[1], w, 'warning');
    }
    return true;
  });

  const filteredErrors = errors.filter(e => {
    const match = e.match(/^(\/[^:]*): (.*)$/);
    if (match) {
      return !shouldIgnore(match[1], e, 'error');
    }
    return true;
  });

  if (filteredWarnings.length)
    console.log('\nWarnings:\n' + filteredWarnings.map(w => `- ${w}`).join('\n'));
  if (filteredErrors.length) {
    console.error('\nFailures:\n' + filteredErrors.map(e => `- ${e}`).join('\n'));
    process.exit(1);
  }
  console.log('\nPASS: Gainhelm SEO/GEO route audit passed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
