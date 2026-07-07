import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate():
    validation = load_json('/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/validation_report.json')
    copy = load_json('/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/copy_details.json')
    
    print("# COPY & STRUCTURE ANALYSIS DRAFT")
    
    # 1. Author and DateModified checks
    print("\n## 1. WebPage Schema Author and DateModified Compliance")
    missing_author_modified = []
    for file, report in sorted(validation.items()):
        if not report['webpage_author_ok'] or not report['webpage_date_modified_ok']:
            missing_author_modified.append(file)
            print(f"- **{file}**: Author: {report['webpage_author_value']} (Ok? {report['webpage_author_ok']}), dateModified: {report['webpage_date_modified_value']} (Ok? {report['webpage_date_modified_ok']})")
    if not missing_author_modified:
        print("All pages are compliant.")

    # 2. FAQs checks
    print("\n## 2. Trade-Specific FAQ Schema Compliance (Min 3 FAQs)")
    insufficient_faqs = []
    for file, report in sorted(validation.items()):
        if report['faq_count'] < 3:
            insufficient_faqs.append(file)
            print(f"- **{file}**: FAQ Count = {report['faq_count']}")
    if not insufficient_faqs:
        print("All pages have at least 3 FAQs.")

    # 3. Meta Tags checks (titles, descriptions, H1s, og, twitter)
    print("\n## 3. Title, H1, Meta Description, and OG/Twitter Tag Compliance")
    for file, report in sorted(validation.items()):
        issues = []
        if not report['title_len_ok']:
            issues.append(f"Bad Title Length ({report['title_len']} chars)")
        if not report['meta_desc_len_ok']:
            issues.append(f"Bad Description Length ({report['meta_desc_len']} chars)")
        if not report['og_title_aligned']:
            issues.append("og:title misaligned/missing")
        if not report['twitter_title_aligned']:
            issues.append("twitter:title misaligned/missing")
        if not report['h1_ok']:
            issues.append(f"Bad H1 Configuration (count: {report['h1_count']})")
            
        if issues:
            print(f"- **{file}**:")
            for issue in issues:
                print(f"  - {issue}")

    # 4. Copy details summary
    print("\n## 4. Copy and GEO Optimization Details")
    for file, c in sorted(copy.items()):
        print(f"### {file}")
        print(f"- **First 60 words**: \"{c['first_60_words']}\"")
        print(f"- **Stats found**: {c['stats']}")
        print(f"- **Real Quotes found**: {c['quotes']}")
        print(f"- **Author Coskun Arif in text?**: {c['has_coskun_arif']}")

if __name__ == '__main__':
    generate()
