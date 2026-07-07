import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def summarize():
    report_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/validation_report.json'
    reports = load_json(report_path)
    
    no_webpage_schema = []
    missing_author = []
    missing_date_modified = []
    insufficient_faqs = [] # faq_count < 3
    misaligned_og_title = []
    misaligned_twitter_title = []
    bad_title_len = []
    bad_desc_len = []
    bad_h1 = []
    
    print("SEO/GEO Audit Summary:\n")
    print(f"{'Filename':<45} | {'WebPage?':<8} | {'Author?':<7} | {'Modified?':<9} | {'FAQs':<4} | {'H1 Cnt':<6} | {'Title L':<7} | {'Desc L':<6}")
    print("-" * 115)
    
    for filename, report in sorted(reports.items()):
        webpage_str = "Yes" if report['has_webpage_schema'] else "No"
        author_str = "Ok" if report['webpage_author_ok'] else "Missing"
        modified_str = "Ok" if report['webpage_date_modified_ok'] else "Missing"
        faq_str = str(report['faq_count'])
        h1_str = str(report['h1_count'])
        title_len_str = f"{report['title_len']} ({'Ok' if report['title_len_ok'] else 'Bad'})"
        desc_len_str = f"{report['meta_desc_len']} ({'Ok' if report['meta_desc_len_ok'] else 'Bad'})"
        
        print(f"{filename:<45} | {webpage_str:<8} | {author_str:<7} | {modified_str:<9} | {faq_str:<4} | {h1_str:<6} | {title_len_str:<7} | {desc_len_str:<6}")
        
        if not report['has_webpage_schema']:
            no_webpage_schema.append(filename)
        else:
            if not report['webpage_author_ok']:
                missing_author.append(filename)
            if not report['webpage_date_modified_ok']:
                missing_date_modified.append(filename)
                
        if report['faq_count'] < 3:
            insufficient_faqs.append((filename, report['faq_count']))
            
        if not report['og_title_aligned']:
            misaligned_og_title.append(filename)
            
        if not report['twitter_title_aligned']:
            misaligned_twitter_title.append(filename)
            
        if not report['title_len_ok']:
            bad_title_len.append((filename, report['title_len']))
            
        if not report['meta_desc_len_ok']:
            bad_desc_len.append((filename, report['meta_desc_len']))
            
        if not report['h1_ok']:
            bad_h1.append((filename, report['h1_count'], report['h1_text']))

    print("\n" + "=" * 50 + "\nDETAILED VULNERABILITIES\n" + "=" * 50)
    print(f"\n1. Lacks WebPage Schema altogether ({len(no_webpage_schema)} pages):")
    for f in no_webpage_schema:
        print(f"   - {f}")
        
    print(f"\n2. Lacks WebPage Author Information ({len(missing_author)} pages):")
    for f in missing_author:
        print(f"   - {f}")
        
    print(f"\n3. Lacks dateModified Property ({len(missing_date_modified)} pages):")
    for f in missing_date_modified:
        print(f"   - {f}")
        
    print(f"\n4. Insufficient Trade-Specific FAQs (< 3) ({len(insufficient_faqs)} pages):")
    for f, count in insufficient_faqs:
        print(f"   - {f} (FAQ count: {count})")
        
    print(f"\n5. Misaligned og:title ({len(misaligned_og_title)} pages):")
    for f in misaligned_og_title:
        print(f"   - {f}")
        
    print(f"\n6. Misaligned twitter:title ({len(misaligned_twitter_title)} pages):")
    for f in misaligned_twitter_title:
        print(f"   - {f}")
        
    print(f"\n7. Bad Title Tag Length (< 50 or > 60 chars) ({len(bad_title_len)} pages):")
    for f, l in bad_title_len:
        print(f"   - {f} (Length: {l} chars)")
        
    print(f"\n8. Bad Meta Description Length (< 140 or > 160 chars) ({len(bad_desc_len)} pages):")
    for f, l in bad_desc_len:
        print(f"   - {f} (Length: {l} chars)")
        
    print(f"\n9. Bad H1 Configuration (count != 1 or empty) ({len(bad_h1)} pages):")
    for f, count, text in bad_h1:
        print(f"   - {f} (H1 Count: {count}, Text: {text})")

if __name__ == '__main__':
    summarize()
