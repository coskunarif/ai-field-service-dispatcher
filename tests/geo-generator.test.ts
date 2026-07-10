import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPageMetadata, page_generator, llms_txt_updater } from '../seo/geo-generator.mjs';

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    appendFile: vi.fn(),
  },
}));

const fsPromises = await import('fs/promises');

describe('buildPageMetadata', () => {
  it('rejects invalid service types', () => {
    expect(() => buildPageMetadata('INVALID_TRADE', ['software'])).toThrow(/invalid service type/i);
  });

  it('rejects keywords with unsafe characters', () => {
    expect(() => buildPageMetadata('HVAC', ['<script>alert(1)</script>'])).toThrow(
      /invalid characters in keywords/i
    );
  });

  it('accepts valid alphanumeric keywords with spaces and hyphens', () => {
    const { metadata } = buildPageMetadata('HVAC', ['hvac dispatch app', 'field-service software']);
    expect(metadata.keywords).toEqual(['hvac dispatch app', 'field-service software']);
  });

  it('returns correct metadata for a valid service type', () => {
    const { metadata } = buildPageMetadata('plumbing', ['plumbing software']);
    expect(metadata.service_type).toBe('plumbing');
    expect(metadata.title).toBe('plumbing Dispatch Software');
    expect(metadata.url).toBe('/plumbing-dispatch-software');
    expect(metadata.file_path).toBe('plumbing-dispatch-software.html');
    expect(metadata.description).toContain('plumbing dispatch');
  });

  it('preserves the original casing in the title', () => {
    const { metadata } = buildPageMetadata('HVAC', ['hvac software']);
    expect(metadata.title).toBe('HVAC Dispatch Software');
  });

  it('includes schema.org JSON-LD with expected types', () => {
    const { schema } = buildPageMetadata('electrical', ['electrical software']);
    expect(schema['@context']).toBe('https://Schema.org');
    expect(schema['@type']).toContain('SoftwareApplication');
    expect(schema['@type']).toContain('WebPage');
    expect(schema['@type']).toContain('FAQPage');
  });

  it('renders keywords as HTML list items', () => {
    const { htmlContent } = buildPageMetadata('HVAC', ['dispatch app', 'software']);
    expect(htmlContent).toContain('<li>dispatch app</li>');
    expect(htmlContent).toContain('<li>software</li>');
    expect(htmlContent).toContain('<h1>HVAC Dispatch Software</h1>');
  });
});

describe('page_generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new HTML file when the target file does not exist', async () => {
    fsPromises.default.readFile = vi.fn().mockRejectedValue(new Error('ENOENT'));
    fsPromises.default.writeFile = vi.fn().mockResolvedValue(undefined);

    const metadata = await page_generator('HVAC', ['hvac dispatch app']);

    expect(metadata.title).toBe('HVAC Dispatch Software');
    expect(fsPromises.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('hvac-dispatch-software.html'),
      expect.stringContaining('HVAC Dispatch Software'),
      'utf8'
    );
  });

  it('does not overwrite existing HTML files that already contain schema markup', async () => {
    const existingContent = '<html>https://Schema.org</html>';
    fsPromises.default.readFile = vi.fn().mockResolvedValue(existingContent);
    fsPromises.default.writeFile = vi.fn().mockResolvedValue(undefined);
    fsPromises.default.readFile.mockResolvedValueOnce(existingContent);

    await page_generator('HVAC', ['hvac dispatch app']);

    expect(fsPromises.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('hvac-dispatch-software.html'),
      existingContent,
      'utf8'
    );
  });

  it('adds a new URL to sitemap.xml when it is missing', async () => {
    const sitemap = '<?xml version="1.0"?><urlset></urlset>';
    fsPromises.default.readFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockResolvedValueOnce(sitemap);
    fsPromises.default.writeFile = vi.fn().mockResolvedValue(undefined);

    await page_generator('HVAC', ['hvac dispatch app']);

    expect(fsPromises.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('sitemap.xml'),
      expect.stringContaining('https://gainhelm.com/hvac-dispatch-software'),
      'utf8'
    );
  });
});

describe('llms_txt_updater', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appends a formatted entry and returns true on success', async () => {
    fsPromises.default.appendFile = vi.fn().mockResolvedValue(undefined);

    const pageMetadata = {
      service_type: 'Plumbing',
      keywords: ['plumbing software'],
      title: 'Plumbing Dispatch Software',
      url: '/plumbing-dispatch-software',
      description: 'Direct conversational answers for plumbing dispatch.',
      file_path: 'plumbing-dispatch-software.html',
    };

    const result = await llms_txt_updater(pageMetadata);
    expect(result).toBe(true);
    expect(fsPromises.default.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('llms.txt'),
      expect.stringContaining('Plumbing Dispatch Software'),
      'utf8'
    );
  });

  it('returns false when the append operation fails', async () => {
    fsPromises.default.appendFile = vi.fn().mockRejectedValue(new Error('disk full'));

    const pageMetadata = {
      service_type: 'Electrical',
      keywords: ['electrical software'],
      title: 'Electrical Dispatch Software',
      url: '/electrical-dispatch-software',
      description: 'Direct conversational answers for electrical dispatch.',
      file_path: 'electrical-dispatch-software.html',
    };

    const result = await llms_txt_updater(pageMetadata);
    expect(result).toBe(false);
  });
});
