#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
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
  const file = route.includes('.') ? route : `${route}.html`;
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
function strip(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

async function main() {
  let sitemap = live ? await textFor('/sitemap.xml') : readFileSync('sitemap.xml', 'utf8');
  let robots = live ? await textFor('/robots.txt') : readFileSync('robots.txt', 'utf8');
  let llms = live ? await textFor('/llms.txt') : readFileSync('llms.txt', 'utf8');

  if (!/Sitemap:\s*https:\/\/gainhelm\.com\/sitemap\.xml/i.test(robots)) errors.push('robots.txt missing canonical sitemap declaration');
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'GoogleOther']) {
    if (!new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots)) warnings.push(`robots.txt missing explicit ${bot} stanza`);
  }

  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (!urls.length) errors.push('sitemap.xml has no <loc> URLs');
  const paths = urls.map(u => new URL(u).pathname === '/' ? '/' : new URL(u).pathname);
  console.log(`Auditing ${paths.length} sitemap routes (${live ? origin : 'local files'})`);

  const llmsLinks = new Set([...llms.matchAll(/https:\/\/gainhelm\.com[^\s)]+/g)].map(m => new URL(m[0]).pathname));
  for (const p of paths) if (!llmsLinks.has(p)) errors.push(`llms.txt missing sitemap route ${p}`);

  for (const p of paths) {
    const html = await textFor(p);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const desc = meta(html, 'description');
    const canonical = href(html, 'canonical');
    const robotsMeta = meta(html, 'robots');
    const h1s = [...html.matchAll(/<h1\b/gi)].length;
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const form = html.match(/<form[^>]+id=["']waitlist-form["'][^>]*>/i)?.[0] || '';
    const card = meta(html, 'twitter:card');
    const body = strip(html).slice(0, 220);

    if (!title || title.length > 70) errors.push(`${p}: missing/long title (${title.length})`);
    if (!desc || desc.length < 120 || desc.length > 180) warnings.push(`${p}: meta description outside 120-180 chars (${desc.length})`);
    if (canonical !== `https://gainhelm.com${p === '/' ? '/' : p}`) errors.push(`${p}: canonical mismatch ${canonical || '(missing)'}`);
    if (/noindex/i.test(robotsMeta)) errors.push(`${p}: robots meta contains noindex`);
    if (h1s !== 1) errors.push(`${p}: expected one H1, found ${h1s}`);
    if (!jsonLd.length) errors.push(`${p}: missing JSON-LD`);
    for (const [i, m] of jsonLd.entries()) { try { JSON.parse(m[1]); } catch { errors.push(`${p}: invalid JSON-LD block ${i + 1}`); } }
    if (!form) warnings.push(`${p}: no inline waitlist form; confirm alternate CTA path intentionally handles conversion`);
    if (form && !/action=["']\/waitlist["']/i.test(form)) warnings.push(`${p}: waitlist form lacks native /waitlist action`);
    if (form && !/method=["']post["']/i.test(form)) warnings.push(`${p}: waitlist form lacks method=post`);
    if (card && card !== 'summary') warnings.push(`${p}: twitter:card is ${card}, expected summary unless a real share image exists`);
    if (!/dispatch|scheduling|field service|waitlist/i.test(body)) warnings.push(`${p}: above-fold text may not state route intent early`);
    const localFile = p === '/' ? 'index.html' : `${basename(p)}.html`;
    if (!live && !existsSync(localFile)) errors.push(`${p}: sitemap route has no local ${localFile}`);
  }

  if (warnings.length) console.log('\nWarnings:\n' + warnings.map(w => `- ${w}`).join('\n'));
  if (errors.length) {
    console.error('\nFailures:\n' + errors.map(e => `- ${e}`).join('\n'));
    process.exit(1);
  }
  console.log('\nPASS: Gainhelm SEO/GEO route audit passed');
}

main().catch(err => { console.error(err); process.exit(1); });
