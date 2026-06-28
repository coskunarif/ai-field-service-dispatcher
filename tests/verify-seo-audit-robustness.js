import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const TEST_DIR = join(process.cwd(), 'tests', 'temp-audit-test');
const AUDIT_SCRIPT = join(process.cwd(), 'scripts', 'gainhelm-seo-geo-audit.mjs');

function setupTestDir() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
}

function runAudit(env = {}) {
  try {
    const stdout = execSync(`node ${AUDIT_SCRIPT}`, {
      cwd: TEST_DIR,
      env: { ...process.env, ...env },
      stdio: 'pipe',
    });
    return { code: 0, stdout: stdout.toString(), stderr: '' };
  } catch (err) {
    return {
      code: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : '',
      error: err.message
    };
  }
}

function writeMockFiles(files) {
  for (const [filename, content] of Object.entries(files)) {
    writeFileSync(join(TEST_DIR, filename), content);
  }
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// ----------------------------------------------------
// TEST CASES
// ----------------------------------------------------

test('Scenario 1: Missing sitemap.xml', () => {
  setupTestDir();
  // Write robots and llms, but no sitemap
  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/'
  });

  const result = runAudit();
  console.log(`\n--- Scenario 1 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stderr: ${result.stderr}`);
  console.log(`Stdout: ${result.stdout}`);
  
  if (result.stderr.includes('ENOENT') || result.error?.includes('ENOENT')) {
    console.log('Result: CRASHED with ENOENT (FAIL - script did not handle missing sitemap gracefully)');
  } else {
    console.log('Result: Did not crash with ENOENT (PASS)');
  }
});

test('Scenario 2: Missing local HTML file for sitemap route', () => {
  setupTestDir();
  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/\nhttps://gainhelm.com/nonexistent',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
  <url><loc>https://gainhelm.com/nonexistent</loc></url>
</urlset>`,
    'index.html': `<html><head><title>Gainhelm Home</title><meta name="description" content="Gainhelm is an advanced field service dispatch software for various trades." /><link rel="canonical" href="https://gainhelm.com/" /><meta name="robots" content="index, follow" /></head><body><h1>Gainhelm</h1><script type="application/ld+json">{"@type": "FAQPage"}</script></body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 2 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stderr: ${result.stderr}`);
  console.log(`Stdout: ${result.stdout}`);

  if (result.stderr.includes('ENOENT') || result.error?.includes('ENOENT')) {
    console.log('Result: CRASHED with ENOENT (FAIL - crashed inside textFor instead of collecting error at line 211)');
  } else {
    console.log('Result: Handled file existence check gracefully (PASS)');
  }
});

test('Scenario 3: Malformed HTML - spaces around attributes', () => {
  setupTestDir();
  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
</urlset>`,
    // Space before '=' in meta description and link canonical
    'index.html': `<html><head><title>Gainhelm Home</title>
<meta name = "description" content = "Gainhelm is an advanced field service dispatch software for various trades." />
<link rel = "canonical" href = "https://gainhelm.com/" />
<meta name="robots" content="index, follow" /></head>
<body><h1>Gainhelm</h1>
<script type="application/ld+json">{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "field service", "acceptedAnswer": {"@type": "Answer", "text": "dispatch"}}]}</script>
</body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 3 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stdout: ${result.stdout}`);

  const hasDescriptionError = result.stdout.includes('meta description outside 120-180');
  const hasCanonicalError = result.stdout.includes('canonical mismatch');
  console.log(`Has description error: ${hasDescriptionError}`);
  console.log(`Has canonical error: ${hasCanonicalError}`);
  if (hasDescriptionError || hasCanonicalError) {
    console.log('Result: FAIL - script failed to parse HTML with spaces around attributes');
  } else {
    console.log('Result: PASS');
  }
});

test('Scenario 4: Malformed HTML - missing quotes', () => {
  setupTestDir();
  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
</urlset>`,
    // No quotes for name/property
    'index.html': `<html><head><title>Gainhelm Home</title>
<meta name=description content="Gainhelm is an advanced field service dispatch software for various trades." />
<link rel=canonical href="https://gainhelm.com/" />
<meta name=robots content="index, follow" /></head>
<body><h1>Gainhelm</h1>
<script type="application/ld+json">{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "field service", "acceptedAnswer": {"@type": "Answer", "text": "dispatch"}}]}</script>
</body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 4 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stdout: ${result.stdout}`);

  const hasDescriptionError = result.stdout.includes('meta description outside 120-180');
  const hasCanonicalError = result.stdout.includes('canonical mismatch');
  console.log(`Has description error: ${hasDescriptionError}`);
  console.log(`Has canonical error: ${hasCanonicalError}`);
  if (hasDescriptionError || hasCanonicalError) {
    console.log('Result: FAIL - script failed to parse HTML with missing quotes around attributes');
  } else {
    console.log('Result: PASS');
  }
});

test('Scenario 5: JSON-LD structure type mismatch (Crash)', () => {
  setupTestDir();
  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
</urlset>`,
    // JSON-LD has name as an object instead of string
    'index.html': `<html><head><title>Gainhelm Home</title>
<meta name="description" content="Gainhelm is an advanced field service dispatch software for various trades." />
<link rel="canonical" href="https://gainhelm.com/" />
<meta name="robots" content="index, follow" /></head>
<body><h1>Gainhelm</h1>
<script type="application/ld+json">{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": { "key": "field service" },
      "acceptedAnswer": { "@type": "Answer", "text": "dispatch" }
    }
  ]
}</script>
</body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 5 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stderr: ${result.stderr}`);
  console.log(`Stdout: ${result.stdout}`);

  if (result.stderr.includes('TypeError') || result.error?.includes('TypeError')) {
    console.log('Result: CRASHED with TypeError (FAIL - script did not validate JSON-LD types before calling string methods)');
  } else {
    console.log('Result: Handled type mismatch gracefully (PASS)');
  }
});

test('Scenario 6: JSON-LD deeply nested object (DoS / Stack Overflow)', () => {
  setupTestDir();
  
  // Construct deeply nested JSON string directly
  let nestedStr = '{"@type": "FAQPage"}';
  for (let i = 0; i < 6000; i++) {
    nestedStr = `{"child": ${nestedStr}}`;
  }

  writeMockFiles({
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
</urlset>`,
    'index.html': `<html><head><title>Gainhelm Home</title>
<meta name="description" content="Gainhelm is an advanced field service dispatch software for various trades." />
<link rel="canonical" href="https://gainhelm.com/" />
<meta name="robots" content="index, follow" /></head>
<body><h1>Gainhelm</h1>
<script type="application/ld+json">${nestedStr}</script>
</body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 6 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stderr: ${result.stderr}`);
  console.log(`Stdout: ${result.stdout}`);
  
  if (result.stderr.includes('Maximum call stack size exceeded') || result.error?.includes('Maximum call stack size exceeded')) {
    console.log('Result: CRASHED with Stack Overflow (FAIL - recursive findFAQPages without depth limit)');
  } else {
    // If the error was swallowed, it will report "missing FAQPage block" instead of showing that it hit a stack size limit
    console.log('Result: RangeError was swallowed by try-catch block (FAIL - hides engine limit/error)');
  }
});

test('Scenario 7: Malformed config file (Type crash in shouldIgnore)', () => {
  setupTestDir();
  writeMockFiles({
    'seo-audit-config.json': `{
      "overrides": {
        "/": {
          "ignoreWarnings": [123, null]
        }
      }
    }`,
    'robots.txt': 'User-agent: *\nSitemap: https://gainhelm.com/sitemap.xml\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: PerplexityBot\nUser-agent: GoogleOther\n',
    'llms.txt': 'https://gainhelm.com/',
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
</urlset>`,
    'index.html': `<html><head><title>Gainhelm Home</title>
<meta name="description" content="Gainhelm is an advanced field service dispatch software for various trades." />
<link rel="canonical" href="https://gainhelm.com/" />
<meta name="robots" content="index, follow" /></head>
<body><h1>Gainhelm</h1>
<script type="application/ld+json">{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "field service", "acceptedAnswer": {"@type": "Answer", "text": "dispatch"}}]}</script>
</body></html>`
  });

  const result = runAudit();
  console.log(`\n--- Scenario 7 Results ---`);
  console.log(`Exit code: ${result.code}`);
  console.log(`Stderr: ${result.stderr}`);
  console.log(`Stdout: ${result.stdout}`);

  if (result.stderr.includes('TypeError') || result.error?.includes('TypeError')) {
    console.log('Result: CRASHED with TypeError (FAIL - script did not validate that rule is a string before calling toLowerCase/replace)');
  } else {
    console.log('Result: Handled malformed config values gracefully (PASS)');
  }
});

// Run all tests
console.log('Starting verification harness for gainhelm-seo-geo-audit.mjs...\n');
for (const t of tests) {
  t.fn();
}

// Clean up
if (existsSync(TEST_DIR)) {
  rmSync(TEST_DIR, { recursive: true, force: true });
}
