import os
import re
import json
from html.parser import HTMLParser

class SEOParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = None
        self.meta_desc = None
        self.og_title = None
        self.twitter_title = None
        self.h1s = []
        self.json_lds = []
        
        self.in_title = False
        self.in_script = False
        self.script_type = None
        self.script_content = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            name = attrs_dict.get('name', '').lower()
            prop = attrs_dict.get('property', '').lower()
            content = attrs_dict.get('content', '')
            if name == 'description':
                self.meta_desc = content
            elif prop == 'og:title':
                self.og_title = content
            elif name == 'twitter:title':
                self.twitter_title = content
        elif tag == 'h1':
            pass # we'll capture H1 text in handle_data if we trace it, but let's do simplified H1 text parsing
        elif tag == 'script':
            self.in_script = True
            self.script_type = attrs_dict.get('type', '').lower()
            self.script_content = []
            
    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'script':
            self.in_script = False
            if self.script_type == 'application/ld+json':
                try:
                    schema_data = json.loads(''.join(self.script_content))
                    self.json_lds.append(schema_data)
                except Exception as e:
                    # Try to clean up comments and trailing commas or other js artifacts in some inline schemas
                    content = ''.join(self.script_content)
                    # Simple comment cleaner
                    content_clean = re.sub(r'//.*?\n|/\*.*?\*/', '', content, flags=re.S)
                    try:
                        schema_data = json.loads(content_clean)
                        self.json_lds.append(schema_data)
                    except:
                        pass # Could not parse JSON-LD
            self.script_type = None

    def handle_data(self, data):
        if self.in_title:
            self.title = (self.title or '') + data
        elif self.in_script and self.script_type == 'application/ld+json':
            self.script_content.append(data)

def parse_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parser = SEOParser()
    parser.feed(content)
    
    # Extract H1s using simple regex for robustness
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.S)
    h1s_cleaned = []
    for h in h1s:
        # Strip html tags inside H1
        h_clean = re.sub(r'<[^>]*>', '', h).strip()
        h1s_cleaned.append(h_clean)
        
    # Extract first 300 words of body content to check GEO criteria
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.S)
    body_text = ""
    if body_match:
        # Strip all script, style, and html tags from body to get raw text
        body_content = body_match.group(1)
        body_content = re.sub(r'<script[^>]*>.*?</script>', '', body_content, flags=re.S)
        body_content = re.sub(r'<style[^>]*>.*?</style>', '', body_content, flags=re.S)
        body_content = re.sub(r'<[^>]*>', ' ', body_content)
        body_text = ' '.join(body_content.split())
        
    return {
        'title': parser.title.strip() if parser.title else None,
        'meta_desc': parser.meta_desc,
        'og_title': parser.og_title,
        'twitter_title': parser.twitter_title,
        'h1s': h1s_cleaned,
        'json_lds': parser.json_lds,
        'body_text': body_text
    }

def analyze_pages(root_dir):
    files = [f for f in os.listdir(root_dir) if f.endswith('.html') and not f.startswith('tools-facebook-post-generator')]
    # Also explicitly add tools-lead-queue.html and tools-contractor-leads.html
    # wait, they are captured since they end with .html
    results = {}
    
    for filename in sorted(files):
        file_path = os.path.join(root_dir, filename)
        try:
            parsed = parse_html_file(file_path)
            results[filename] = parsed
        except Exception as e:
            print(f"Error parsing {filename}: {e}")
            
    return results

if __name__ == '__main__':
    root_dir = '/home/ubuntuadmin/projects/ai-field-service-dispatcher'
    results = analyze_pages(root_dir)
    print(f"Parsed {len(results)} files.")
    
    # Save the output to a temporary JSON file for our report synthesis
    out_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/parsed_results.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"Saved results to {out_path}")
