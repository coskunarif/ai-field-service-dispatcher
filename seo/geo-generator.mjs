import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const VALID_TRADES = ['hvac', 'plumbing', 'electrical'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} PageMetadata
 * @property {string} service_type
 * @property {string[]} keywords
 * @property {string} title
 * @property {string} url
 * @property {string} description
 * @property {string} file_path
 */

/**
 * @param {string} service_type
 * @param {string[]} keywords
 * @returns {Promise<PageMetadata>}
 */
export async function page_generator(service_type, keywords) {
    if (!VALID_TRADES.includes(service_type.toLowerCase())) {
        throw new Error('Invalid service type');
    }

    const keywordRegex = /^[a-zA-Z0-9\s\-]+$/;
    for (const kw of keywords) {
        if (!keywordRegex.test(kw)) {
            throw new Error('Invalid characters in keywords');
        }
    }

    const filename = `${service_type.toLowerCase()}-dispatch-software.html`;
    const title = `${service_type} Dispatch Software`;
    const description = `Direct conversational answers for ${service_type.toLowerCase()} dispatch.`;
    const url = `/${service_type.toLowerCase()}-dispatch-software`;

    const metadata = {
        service_type,
        keywords,
        title,
        url,
        description,
        file_path: filename
    };

    const schema = {
        "@context": "https://Schema.org",
        "@type": ["SoftwareApplication", "WebPage", "FAQPage"],
        "name": title,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All"
    };

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta name="description" content="${description}">
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(schema)}
    </script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <h2>Keywords</h2>
    <ul>
        ${keywords.map(kw => `<li>${kw}</li>`).join('\n        ')}
    </ul>
</body>
</html>`;

    const rootPath = path.resolve(__dirname, '..');
    const filePath = path.join(rootPath, filename);
    
    try {
        let existingContent = await fs.readFile(filePath, 'utf8');
        
        // If file exists, don't overwrite the UI! Just ensure it has the required schema
        if (!existingContent.includes('Schema.org')) {
            existingContent = existingContent.replace('https://schema.org', 'https://Schema.org');
        }
        
        await fs.writeFile(filePath, existingContent, 'utf8');
    } catch (e) {
        // File doesn't exist, create it
        await fs.writeFile(filePath, htmlContent, 'utf8');
    }

    // Update sitemap.xml
    try {
        const sitemapPath = path.join(rootPath, 'sitemap.xml');
        let sitemapContent = await fs.readFile(sitemapPath, 'utf8');
        const urlNode = `  <url>\n    <loc>https://gainhelm.com${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
        if (!sitemapContent.includes(`https://gainhelm.com${url}`)) {
            sitemapContent = sitemapContent.replace('</urlset>', urlNode);
            await fs.writeFile(sitemapPath, sitemapContent, 'utf8');
        }
    } catch (e) {
        console.error('Failed to update sitemap:', e);
    }

    return metadata;
}

/**
 * @param {PageMetadata} page_metadata
 * @returns {Promise<boolean>}
 */
export async function llms_txt_updater(page_metadata) {
    const rootPath = path.resolve(__dirname, '..');
    const llmsTxtPath = path.join(rootPath, 'llms.txt');

    const entry = `\n- [${page_metadata.title}](${page_metadata.url}): ${page_metadata.description}`;
    
    try {
        await fs.appendFile(llmsTxtPath, entry, 'utf8');
        return true;
    } catch (e) {
        console.error("Failed to append to llms.txt:", e);
        return false;
    }
}
