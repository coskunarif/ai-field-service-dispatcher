import re
import xml.etree.ElementTree as ET

def load_sitemap_urls(sitemap_path):
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    urls = []
    # Namespaces are usually present in sitemap.xml
    ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for url_tag in root.findall('.//ns:loc', ns):
        urls.append(url_tag.text.strip())
    return urls

def load_llms_urls(llms_path):
    with open(llms_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all markdown links
    links = re.findall(r'\[.*?\]\((https?://.*?)\)', content)
    # Filter or normalize
    return [l.strip() for l in links]

def compare():
    sitemap_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/sitemap.xml'
    llms_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/llms.txt'
    
    sitemap_urls = load_sitemap_urls(sitemap_path)
    llms_urls = load_llms_urls(llms_path)
    
    # Normalize trailing slashes for homepage or other pages
    def normalize(url):
        url = url.replace('https://gainhelm.com', '')
        if url == '/':
            return '/'
        if url.endswith('/'):
            url = url[:-1]
        return url
        
    sitemap_norm = set(normalize(u) for u in sitemap_urls)
    llms_norm = set(normalize(u) for u in llms_urls)
    
    print(f"Total Sitemap URLs normalized: {len(sitemap_norm)}")
    print(f"Total llms.txt URLs normalized: {len(llms_norm)}")
    
    missing_in_llms = sitemap_norm - llms_norm
    extra_in_llms = llms_norm - sitemap_norm
    
    print("\nURLs in sitemap.xml but missing in llms.txt:")
    if missing_in_llms:
        for u in sorted(missing_in_llms):
            print(f"  - {u}")
    else:
        print("  None")
        
    print("\nURLs in llms.txt but missing in sitemap.xml:")
    if extra_in_llms:
        for u in sorted(extra_in_llms):
            print(f"  - {u}")
    else:
        print("  None")

if __name__ == '__main__':
    compare()
