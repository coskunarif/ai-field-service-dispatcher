import { test, expect } from '@playwright/test';
import { page_generator, llms_txt_updater } from '../seo/geo-generator.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('GEO Generator Module Integration Tests', () => {
  const rootDir = path.resolve(__dirname, '..');
  const llmsTxtPath = path.join(rootDir, 'llms.txt');

  test.describe('page_generator', () => {
    test('should reject invalid service types', async () => {
      await expect(page_generator('INVALID_TRADE', ['software'])).rejects.toThrow(
        /invalid service type/i
      );
    });

    test('should reject keywords with unsafe characters', async () => {
      await expect(page_generator('HVAC', ['<script>alert(1)</script>'])).rejects.toThrow(
        /invalid characters in keywords/i
      );
    });

    test('should generate a page for a valid service type and write an HTML file', async () => {
      const service_type = 'HVAC';
      const keywords = ['hvac dispatch app', 'hvac software for small teams'];
      const metadata = await page_generator(service_type, keywords);

      expect(metadata).not.toBeNull();
      expect(metadata).toHaveProperty('service_type', service_type);
      expect(metadata).toHaveProperty('keywords', keywords);
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('url');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('file_path');

      // Verify the file was created
      const filePath = path.join(rootDir, metadata.file_path);
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Read file content to check for Schema.org JSON-LD and expected SEO content
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toContain('application/ld+json');
      expect(content).toContain('Schema.org');
      expect(content).toContain('SoftwareApplication'); // As per contract: SoftwareApplication, FAQPage, WebPage

      // Clean up by restoring the file if it existed, instead of blindly unlinking
      // Clean up by restoring the file if it existed, instead of blindly unlinking
      try {
        execSync(`git checkout -- ${filePath}`);
        execSync(`git checkout -- ${path.join(rootDir, 'sitemap.xml')}`);
      } catch (e) {
        await fs.unlink(filePath).catch(() => {});
      }
    });
  });

  test.describe('llms_txt_updater', () => {
    let originalLlmsTxt;

    test.beforeAll(async () => {
      originalLlmsTxt = await fs.readFile(llmsTxtPath, 'utf8').catch(() => '');
    });

    test.afterAll(async () => {
      await fs.writeFile(llmsTxtPath, originalLlmsTxt, 'utf8');
    });

    test('should update llms.txt with new page metadata', async () => {
      const pageMetadata = {
        service_type: 'Plumbing',
        keywords: ['plumbing software'],
        title: 'Plumbing Dispatch Software',
        url: '/plumbing-dispatch-software.html',
        description: 'Direct conversational answers for plumbing dispatch.',
        file_path: 'plumbing-dispatch-software.html',
      };

      const success = await llms_txt_updater(pageMetadata);
      expect(success).toBe(true);

      const updatedContent = await fs.readFile(llmsTxtPath, 'utf8');
      expect(updatedContent).toContain(pageMetadata.url);
      expect(updatedContent).toContain(pageMetadata.description);
    });
  });
});
