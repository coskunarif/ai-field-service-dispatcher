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
    const res = await fetch(origin + path, { headers: { 'User-Agent': 'GainhelmSEOGeoAudit/1.0' } });
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

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function isTargetPage(p) {
  const keyRoutes = ['/', '/field-service-scheduling', '/mobile-dispatch-board'];
  if (keyRoutes.includes(p)) return true;
  if (p.endsWith('-dispatch-software') || p.endsWith('-job-management-software')) return true;
  return false;
}

const TRADE_KEYWORDS = {
  'hvac': ['hvac', 'heating', 'air conditioning', 'ac', 'cooling'],
  'plumbing': ['plumbing', 'plumber'],
  'electrical': ['electrical', 'electrician'],
  'appliance-repair': ['appliance', 'repair'],
  'pest-control': ['pest', 'exterminator'],
  'garage-door': ['garage', 'door'],
  'cleaning': ['cleaning', 'cleaner'],
  'landscaping': ['landscaping', 'landscaper', 'lawn', 'mowing'],
  'roofing': ['roofing', 'roofer'],
  'locksmith': ['locksmith'],
  'pool-service': ['pool', 'spa'],
  'commercial-facilities': ['commercial', 'facilities', 'facility'],
  'septic-service': ['septic'],
  'emergency-restoration': ['restoration', 'emergency', 'mitigation'],
  'restoration-job-management': ['restoration', 'water damage'],
  'handyman': ['handyman', 'handyperson'],
  'carpet-cleaning': ['carpet', 'rug', 'cleaning'],
  'tree-service': ['tree', 'arborist'],
  'painting': ['painting', 'painter'],
  'pressure-washing': ['pressure', 'power', 'washing'],
  'junk-removal': ['junk', 'trash', 'removal']
};

function getPageTradeKeywords(p) {
  const keyRoutes = {
    '/': ['field service', 'dispatch', 'scheduling', 'waitlist', 'technician'],
    '/field-service-scheduling': ['field service', 'scheduling', 'dispatch', 'technician'],
    '/mobile-dispatch-board': ['mobile', 'dispatch', 'board', 'ipad', 'tablet', 'technician']
  };
  if (keyRoutes[p]) return keyRoutes[p];

  const tradeMatch = p.match(/^\/([a-z-]+)-(?:dispatch-software|job-management-software)$/);
  if (tradeMatch) {
    const tradeSlug = tradeMatch[1];
    const words = tradeSlug.split('-');
    const extraKeywords = TRADE_KEYWORDS[tradeSlug] || [];
    return Array.from(new Set([tradeSlug, ...words, ...extraKeywords]));
  }
  return [];
}

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
    if (item['@graph'] && Array.isArray(item['@graph'])) {
      item['@graph'].forEach(traverse);
    }
  }
  traverse(obj);
  return faqPages;
}

async function main() {
  let sitemap = readFileSync('sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const paths = urls.map(u => new URL(u).pathname === '/' ? '/' : new URL(u).pathname);
  console.log(`Auditing ${paths.length} sitemap routes...`);

  for (const p of paths) {
    let html;
    try {
      html = await textFor(p);
    } catch (e) {
      errors.push(`${p}: failed to read file`);
      continue;
    }

    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const ogTitle = meta(html, 'og:title');
    const twitterTitle = meta(html, 'twitter:title');

    const normTitle = decodeEntities(title).replace(/\s+/g, ' ').trim();
    const normOgTitle = decodeEntities(ogTitle).replace(/\s+/g, ' ').trim();
    const normTwitterTitle = decodeEntities(twitterTitle).replace(/\s+/g, ' ').trim();

    // Check title consistency
    if (title) {
      if (!ogTitle) {
        errors.push(`${p}: missing og:title`);
      } else if (normOgTitle !== normTitle) {
        errors.push(`${p}: og:title mismatch (expected "${normTitle}", found "${normOgTitle}")`);
      }

      if (!twitterTitle) {
        errors.push(`${p}: missing twitter:title`);
      } else if (normTwitterTitle !== normTitle) {
        errors.push(`${p}: twitter:title mismatch (expected "${normTitle}", found "${normTwitterTitle}")`);
      }
    }

    // Check JSON-LD and FAQPage
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

    if (isTargetPage(p)) {
      let maxTradeSpecificFaqs = 0;
      const kws = getPageTradeKeywords(p);

      for (const [i, m] of jsonLd.entries()) {
        try {
          const parsed = JSON.parse(m[1]);
          const faqPages = findFAQPages(parsed);
          for (const faq of faqPages) {
            let tradeSpecificFaqs = 0;
            if (faq.mainEntity && Array.isArray(faq.mainEntity)) {
              for (const qa of faq.mainEntity) {
                const qText = qa.name || '';
                const aText = qa.acceptedAnswer?.text || '';
                
                // Check if trade-specific
                const isTradeSpec = kws.some(kw => {
                  const kwLower = kw.toLowerCase();
                  return qText.toLowerCase().includes(kwLower) || aText.toLowerCase().includes(kwLower);
                });
                
                if (isTradeSpec) {
                  tradeSpecificFaqs++;
                }
              }
            }
            if (tradeSpecificFaqs > maxTradeSpecificFaqs) {
              maxTradeSpecificFaqs = tradeSpecificFaqs;
            }
          }
        } catch (e) {
          // ignore parsing error as it's caught elsewhere
        }
      }

      if (maxTradeSpecificFaqs === 0) {
        errors.push(`${p}: missing FAQPage block with trade-specific questions and answers`);
      } else if (maxTradeSpecificFaqs < 3) {
        errors.push(`${p}: FAQPage has only ${maxTradeSpecificFaqs} trade-specific Q&As, expected at least 3 (keywords: ${kws.join(', ')})`);
      }
    }
  }

  const filteredErrors = errors.filter(e => {
    const match = e.match(/^(\/[^:]*): (.*)$/);
    if (match) {
      return !shouldIgnore(match[1], e, 'error');
    }
    return true;
  });

  if (filteredErrors.length) {
    console.error('\nFailures:\n' + filteredErrors.map(e => `- ${e}`).join('\n'));
    console.log(`\nTotal failures: ${filteredErrors.length}`);
  } else {
    console.log('\nPASS: All proposed checks passed!');
  }
}

main().catch(console.error);
