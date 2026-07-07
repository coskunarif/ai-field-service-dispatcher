import os
import re
import json
import xml.etree.ElementTree as ET

sitemap_path = "/home/ubuntuadmin/projects/ai-field-service-dispatcher/sitemap.xml"
root_dir = "/home/ubuntuadmin/projects/ai-field-service-dispatcher"

TRADE_KEYWORDS = {
  'hvac': ['hvac', 'heating', 'ac', 'air conditioning', 'ventilating', 'cooling'],
  'plumbing': ['plumb', 'plumbing', 'plumber', 'plumbers'],
  'electrical': ['electr', 'electrical', 'electrician', 'electricians'],
  'septic-service': ['septic', 'septic-service'],
  'pest-control': ['pest', 'exterminator', 'pest-control'],
  'garage-door': ['garage', 'door', 'garage-door'],
  'landscaping': ['landscape', 'landscaping', 'landscaper', 'lawn', 'mowing'],
  'locksmith': ['locksmith', 'locksmiths'],
  'handyman': ['handyman', 'handymen', 'handyperson'],
  'appliance-repair': ['appliance', 'repair', 'appliance-repair'],
  'carpet-cleaning': ['carpet', 'cleaning', 'rug', 'carpet-cleaning'],
  'cleaning': ['cleaning', 'cleaner', 'cleaners'],
  'commercial-facilities': ['commercial', 'facilities', 'facility', 'commercial-facilities'],
  'emergency-restoration': ['emergency', 'restoration', 'mitigation', 'emergency-restoration'],
  'junk-removal': ['junk', 'removal', 'trash', 'junk-removal'],
  'painting': ['paint', 'painting', 'painter', 'painters'],
  'pressure-washing': ['pressure', 'washing', 'power', 'pressure-washing'],
  'roofing': ['roof', 'roofing', 'roofer', 'roofers'],
  'tree-service': ['tree', 'service', 'arborist', 'tree-service'],
  'pool-service': ['pool', 'service', 'spa', 'pool-service'],
  'restoration-job-management': ['restoration', 'water damage', 'restoration-job-management']
}

def get_page_trade_keywords(p):
    key_routes = {
        '/': ['field service', 'dispatch', 'scheduling', 'waitlist', 'technician'],
        '/field-service-scheduling': ['field service', 'scheduling', 'dispatch', 'technician'],
        '/mobile-dispatch-board': ['mobile', 'dispatch', 'board', 'ipad', 'tablet', 'technician']
    }
    if p in key_routes:
        return key_routes[p]

    if 'alternative' in p:
        return ['alternative', 'dispatch', 'scheduling', 'field service', 'technician', 'contractor', 'software', 'servicetitan', 'jobber', 'housecall', 'servicefusion', 'buildops', 'fieldedge']
    if 'tool' in p:
        return ['tool', 'leads', 'queue', 'generator', 'marketing', 'facebook', 'contractor', 'dispatch', 'scheduling']
    if 'hvac-dispatch-app' in p or 'how-to-choose-hvac' in p or 'how-hvac-dispatch' in p:
        return ['hvac', 'dispatch', 'scheduling', 'app', 'software', 'spreadsheets', 'phone tag', 'techs']

    trade_match = re.match(r'^/([a-z-]+)-(?:dispatch-software|job-management-software)$', p)
    if trade_match:
        trade_slug = trade_match.group(1)
        extra_keywords = TRADE_KEYWORDS.get(trade_slug, [])
        words = trade_slug.split('-')
        return list(set([trade_slug] + words + extra_keywords))
    return []

def find_webpages(item):
    webpages = []
    if isinstance(item, list):
        for sub in item:
            webpages.extend(find_webpages(sub))
    elif isinstance(item, dict):
        if item.get('@type') == 'WebPage':
            webpages.append(item)
        for val in item.values():
            webpages.extend(find_webpages(val))
    return webpages

def find_faqpages(item):
    faqpages = []
    if isinstance(item, list):
        for sub in item:
            faqpages.extend(find_faqpages(sub))
    elif isinstance(item, dict):
        if item.get('@type') == 'FAQPage':
            faqpages.append(item)
        for val in item.values():
            faqpages.extend(find_faqpages(val))
    return faqpages

# Parse sitemap.xml
tree = ET.parse(sitemap_path)
root = tree.getroot()
namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

paths = []
for url in root.findall('ns:url', namespace):
    loc = url.find('ns:loc', namespace).text
    path = loc.replace('https://gainhelm.com', '')
    if not path:
        path = '/'
    paths.append(path)

print(f"Loaded {len(paths)} paths from sitemap.xml")

for p in paths:
    route = 'index.html' if p == '/' else p[1:]
    file_path = os.path.join(root_dir, route if '.' in route else f"{route}.html")
    if not os.path.exists(file_path):
        hyphenated = os.path.join(root_dir, route.replace('/', '-') + ('' if '.' in route else '.html'))
        if os.path.exists(hyphenated):
            file_path = hyphenated
        else:
            print(f"[ERROR] File for {p} not found: looked at {file_path} and {hyphenated}")
            continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find JSON-LD scripts
    json_ld_blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>', content, re.IGNORECASE)
    
    if not json_ld_blocks:
        print(f"[ERROR] {p}: No JSON-LD block found!")
        continue

    parsed_schemas = []
    for idx, block in enumerate(json_ld_blocks):
        try:
            parsed_schemas.append(json.loads(block))
        except Exception as e:
            print(f"[ERROR] {p}: Invalid JSON-LD block {idx+1}: {e}")

    # Check WebPage author and dateModified
    webpages = []
    for schema in parsed_schemas:
        webpages.extend(find_webpages(schema))

    if not webpages:
        print(f"[ERROR] {p}: No WebPage entity in JSON-LD")
    else:
        for wp in webpages:
            author = wp.get('author')
            author_name = ""
            if isinstance(author, str):
                author_name = author
            elif isinstance(author, dict):
                author_name = author.get('name', '')
            
            date_mod = wp.get('dateModified')
            
            if author_name != 'Coskun Arif':
                print(f"[FAIL] {p}: WebPage author is '{author_name}', expected 'Coskun Arif'")
            if not date_mod:
                print(f"[FAIL] {p}: WebPage missing dateModified")

    # Check FAQPage
    faqpages = []
    for schema in parsed_schemas:
        faqpages.extend(find_faqpages(schema))

    kws = get_page_trade_keywords(p)
    if not faqpages:
        # Some pages might not require FAQPage, but let's check if the target pages have it.
        # gainhelm-seo-geo-audit check checks all routes (isTargetPage = true).
        print(f"[FAIL] {p}: Missing FAQPage entity in JSON-LD")
    else:
        for faq in faqpages:
            main_entity = faq.get('mainEntity', [])
            if not isinstance(main_entity, list):
                main_entity = [main_entity]
            
            trade_specific_count = 0
            for qa in main_entity:
                if not isinstance(qa, dict):
                    continue
                q_text = qa.get('name', '')
                ans = qa.get('acceptedAnswer', {})
                a_text = ""
                if isinstance(ans, dict):
                    a_text = ans.get('text', '')
                
                if q_text and a_text:
                    combined = f"{q_text} {a_text}".lower()
                    is_trade = any(kw.lower() in combined for kw in kws)
                    if is_trade:
                        trade_specific_count += 1
            
            if trade_specific_count < 3:
                print(f"[FAIL] {p}: FAQPage has only {trade_specific_count} trade-specific Q&As, expected >= 3 (keywords: {kws})")

print("Independent python audit script run complete.")
