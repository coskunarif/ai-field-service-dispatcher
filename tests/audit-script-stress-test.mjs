import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

// Helper to write mock files
function writeMockFiles(files) {
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(name, content, 'utf8');
  }
}

// Helper to clean up mock files
function cleanMockFiles(files) {
  for (const name of Object.keys(files)) {
    if (existsSync(name)) {
      unlinkSync(name);
    }
  }
}

// Helper to run the audit script and capture output
function runAudit(args = '') {
  try {
    const stdout = execSync(`node scripts/gainhelm-seo-geo-audit.mjs ${args}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, BASE_URL: '' } // Local mode
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return { code: err.status, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
}

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// -------------------------------------------------------------
// Test Case 1: Missing crucial files (sitemap/robots/llms)
// -------------------------------------------------------------
test('Missing crucial files (sitemap/robots/llms) causes crash', () => {
  // Move aside existing files if they exist
  const filesToBackup = ['sitemap.xml', 'robots.txt', 'llms.txt', 'seo-audit-config.json'];
  const backups = {};
  for (const f of filesToBackup) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
      unlinkSync(f);
    }
  }

  try {
    const res = runAudit();
    // It should exit with code 1 due to ENOENT
    if (res.code !== 1) {
      throw new Error(`Expected exit code 1, got ${res.code}`);
    }
    const output = res.stdout + '\n' + res.stderr;
    if (!output.includes('ENOENT')) {
      throw new Error(`Expected ENOENT error in output, got: ${output}`);
    }
  } finally {
    // Restore backups
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 2: Missing local page file listed in sitemap
// -------------------------------------------------------------
test('Missing local HTML file listed in sitemap causes ENOENT crash instead of graceful failure list', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://gainhelm.com/</loc></url>
  <url><loc>https://gainhelm.com/non-existent-page</loc></url>
</urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/\n- https://gainhelm.com/non-existent-page',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">{"@type": "FAQPage", "mainEntity": []}</script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
    // Notice we do NOT create non-existent-page.html
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    if (res.code !== 1) {
      throw new Error(`Expected exit code 1, got ${res.code}`);
    }
    const output = res.stdout + '\n' + res.stderr;
    const hasEnoent = output.includes('ENOENT');
    if (!hasEnoent) {
      throw new Error(`Expected ENOENT error on readFileSync, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 3: Title tags with attributes or space handling
// -------------------------------------------------------------
test('Title with attributes fails matching and reports missing title', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title data-rh="true">Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">{"@type": "FAQPage", "mainEntity": []}</script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    const output = res.stdout + '\n' + res.stderr;
    if (!output.includes('missing/long title')) {
      throw new Error(`Expected "missing/long title" failure due to attributes in <title>, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 4: Spaces around meta equals sign or quotes omitted
// -------------------------------------------------------------
test('Meta description with spaces or missing quotes causes false failure/warning', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name = "description" content = "Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">{"@type": "FAQPage", "mainEntity": []}</script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    const output = res.stdout + '\n' + res.stderr;
    if (!output.includes('meta description outside 120-180 chars')) {
      throw new Error(`Expected warning due to space in meta name/content, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 5: H1 in comments or scripts is counted
// -------------------------------------------------------------
test('H1 tags inside comments or scripts cause false multiple H1 failures', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">{"@type": "FAQPage", "mainEntity": []}</script>
</head>
<body>
  <h1>Gainhelm</h1>
  <!-- <h1>Commented H1</h1> -->
</body></html>`,
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    const output = res.stdout + '\n' + res.stderr;
    if (!output.includes('expected one H1, found 2')) {
      throw new Error(`Expected "expected one H1, found 2" failure due to commented H1, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 6: JSON-LD Object/Array Type Crash Swallowed
// -------------------------------------------------------------
test('JSON-LD FAQPage with non-string name property has TypeError swallowed and fails gracefully but incorrectly', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": ["This is an array, not a string"],
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Valid answer"
        }
      }
    ]
  }
  </script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    const output = res.stdout + '\n' + res.stderr;
    // We expect the script to exit with code 1, but NOT due to an unhandled TypeError (the TypeError was swallowed).
    // Instead it fails with "missing FAQPage block" error.
    if (res.code !== 1) {
      throw new Error(`Expected exit code 1, got ${res.code}`);
    }
    if (output.includes('TypeError')) {
      throw new Error(`TypeError was not swallowed! Got: ${output}`);
    }
    if (!output.includes('missing FAQPage block with trade-specific questions and answers')) {
      throw new Error(`Expected FAQPage failure message due to swallowed TypeError, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 7: JSON-LD FAQPage Null Entity Crash Swallowed
// -------------------------------------------------------------
test('JSON-LD FAQPage with null entity inside mainEntity has TypeError swallowed and fails gracefully but incorrectly', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/',
    'index.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      null
    ]
  }
  </script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    const res = runAudit();
    const output = res.stdout + '\n' + res.stderr;
    // We expect the script to exit with code 1, but NOT due to an unhandled TypeError (the TypeError was swallowed).
    if (res.code !== 1) {
      throw new Error(`Expected exit code 1, got ${res.code}`);
    }
    if (output.includes('TypeError')) {
      throw new Error(`TypeError was not swallowed! Got: ${output}`);
    }
    if (!output.includes('missing FAQPage block with trade-specific questions and answers')) {
      throw new Error(`Expected FAQPage failure message due to swallowed TypeError, got: ${output}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// -------------------------------------------------------------
// Test Case 8: Colons in Route Paths
// -------------------------------------------------------------
test('Colons in route paths cause shouldIgnore to truncate the path prefix', () => {
  const mockFiles = {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://gainhelm.com/test:route</loc></url></urlset>`,
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gainhelm.com/sitemap.xml',
    'llms.txt': 'Gainhelm\n- https://gainhelm.com/test:route',
    'test-route.html': `<!DOCTYPE html><html>
<head>
  <title>Gainhelm - Dispatch</title>
  <meta name="description" content="Gainhelm is an AI field service dispatcher. This description is long enough to meet the 120 character limit.">
  <link rel="canonical" href="https://gainhelm.com/test:route">
  <script type="application/ld+json">{"@type": "FAQPage", "mainEntity": []}</script>
</head>
<body><h1>Gainhelm</h1></body></html>`,
    'seo-audit-config.json': `{
      "overrides": {
        "/test": {
          "ignoreWarnings": [],
          "ignoreErrors": ["missing/long title"]
        }
      }
    }`
  };

  const backups = {};
  for (const f of Object.keys(mockFiles)) {
    if (existsSync(f)) {
      backups[f] = execSync(`cat ${f}`);
    }
  }

  try {
    writeMockFiles(mockFiles);
    // Since we ignore "missing/long title" on /test, but the path is /test:route,
    // if the path is parsed as /test (truncated before colon), the error will be ignored.
    // Let's make /test:route have an invalid title.
    const htmlWithBadTitle = mockFiles['test-route.html'].replace('Gainhelm - Dispatch', '');
    writeFileSync('test-route.html', htmlWithBadTitle, 'utf8');

    const res = runAudit();
    // If the path was correctly handled, the error "missing/long title" would NOT be ignored on /test:route because it is not /test.
    // But due to the colon truncation bug, it gets truncated to /test, match[1] becomes "/test", shouldIgnore("/test", ...) checks "/test" overrides,
    // and ignores the error. So there would be NO errors.
    if (!res.stdout.includes('Failures:')) {
      // The failure was indeed ignored because of the colon bug!
      console.log('  [Observed Bug] Colon truncation bug confirmed: error was ignored on /test:route because config was set for /test.');
    } else {
      throw new Error(`Expected error to be ignored due to path truncation bug, but it failed: ${res.stdout}`);
    }
  } finally {
    cleanMockFiles(mockFiles);
    for (const [f, content] of Object.entries(backups)) {
      writeFileSync(f, content);
    }
  }
});

// Run all tests
let failed = 0;
console.log('Running audit script stress tests...');
for (const t of tests) {
  try {
    t.fn();
    console.log(`[PASS] ${t.name}`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}`);
    console.error(err.stack || err);
    failed++;
  }
}

if (failed > 0) {
  console.log(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll stress tests passed.');
}
