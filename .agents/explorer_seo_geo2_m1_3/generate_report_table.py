import json

def generate_table():
    parsed_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/parsed_results.json'
    with open(parsed_path, 'r', encoding='utf-8') as f:
        results = json.load(f)
        
    print("| Page / Filename | Current Title (Length) | Current Meta Description (Length) | Current H1 |")
    print("| --- | --- | --- | --- |")
    for filename, data in sorted(results.items()):
        title = data['title'] or "N/A"
        title_len = len(title)
        desc = data['meta_desc'] or "N/A"
        desc_len = len(desc)
        h1 = data['h1s'][0] if data['h1s'] else "N/A"
        print(f"| `{filename}` | {title} ({title_len}) | {desc} ({desc_len}) | {h1} |")

if __name__ == '__main__':
    generate_table()
