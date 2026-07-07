import json
import os

def load_parsed_results(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def run_validation(results):
    validation_reports = {}
    
    for filename, data in results.items():
        report = {
            'has_webpage_schema': False,
            'webpage_author_ok': False,
            'webpage_author_value': None,
            'webpage_date_modified_ok': False,
            'webpage_date_modified_value': None,
            'faq_count': 0,
            'faq_ok': False,
            'title_len': len(data['title']) if data['title'] else 0,
            'title_len_ok': False,
            'meta_desc_len': len(data['meta_desc']) if data['meta_desc'] else 0,
            'meta_desc_len_ok': False,
            'og_title_aligned': False,
            'twitter_title_aligned': False,
            'h1_count': len(data['h1s']),
            'h1_ok': False,
            'h1_text': data['h1s'][0] if data['h1s'] else None,
            'first_60_words': ' '.join(data['body_text'].split()[:60]) if data['body_text'] else '',
        }
        
        # Check title tag length (50-60 characters is standard)
        if 50 <= report['title_len'] <= 60:
            report['title_len_ok'] = True
            
        # Check meta description length (140-160 characters is standard)
        if report['meta_desc_len'] and 140 <= report['meta_desc_len'] <= 160:
            report['meta_desc_len_ok'] = True
            
        # Check og:title alignment
        if data['og_title'] == data['title']:
            report['og_title_aligned'] = True
            
        # Check twitter:title alignment
        if data['twitter_title'] == data['title']:
            report['twitter_title_aligned'] = True
            
        # Check H1 tags (exactly 1 H1 is required)
        if report['h1_count'] == 1 and report['h1_text']:
            report['h1_ok'] = True
            
        # Check JSON-LD schemas
        for schema in data['json_lds']:
            graph = schema.get('@graph', [])
            if not graph:
                # Flat schema check
                if schema.get('@type') == 'WebPage':
                    report['has_webpage_schema'] = True
                    author = schema.get('author')
                    if author:
                        if isinstance(author, dict) and author.get('name') == 'Coskun Arif':
                            report['webpage_author_ok'] = True
                            report['webpage_author_value'] = author.get('name')
                        elif isinstance(author, str) and author == 'Coskun Arif':
                            report['webpage_author_ok'] = True
                            report['webpage_author_value'] = author
                    if 'dateModified' in schema:
                        report['webpage_date_modified_ok'] = True
                        report['webpage_date_modified_value'] = schema.get('dateModified')
                if schema.get('@type') == 'FAQPage':
                    entities = schema.get('mainEntity', [])
                    report['faq_count'] = len(entities)
                    if report['faq_count'] >= 3:
                        report['faq_ok'] = True
            else:
                for item in graph:
                    itype = item.get('@type')
                    if itype == 'WebPage':
                        report['has_webpage_schema'] = True
                        author = item.get('author')
                        if author:
                            if isinstance(author, dict) and author.get('name') == 'Coskun Arif':
                                report['webpage_author_ok'] = True
                                report['webpage_author_value'] = author.get('name')
                            elif isinstance(author, str) and author == 'Coskun Arif':
                                report['webpage_author_ok'] = True
                                report['webpage_author_value'] = author
                        if 'dateModified' in item:
                            report['webpage_date_modified_ok'] = True
                            report['webpage_date_modified_value'] = item.get('dateModified')
                    if itype == 'FAQPage':
                        entities = item.get('mainEntity', [])
                        report['faq_count'] = len(entities)
                        if report['faq_count'] >= 3:
                            report['faq_ok'] = True
                            
        validation_reports[filename] = report
        
    return validation_reports

if __name__ == '__main__':
    parsed_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/parsed_results.json'
    results = load_parsed_results(parsed_path)
    reports = run_validation(results)
    
    out_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/validation_report.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(reports, f, indent=2)
    print(f"Validated all results. Saved to {out_path}")
