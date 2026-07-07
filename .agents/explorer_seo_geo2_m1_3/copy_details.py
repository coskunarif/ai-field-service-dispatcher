import json
import re
import os

def analyze():
    parsed_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/parsed_results.json'
    with open(parsed_path, 'r', encoding='utf-8') as f:
        results = json.load(f)
        
    analysis = {}
    for filename, data in sorted(results.items()):
        text = data['body_text'] or ""
        
        # Strip common navigation text at the start
        clean_text = text
        nav_prefixes = [
            "Skip to main content Gainhelm Home Features How it works Join the waitlist",
            "Skip to main content Gainhelm Home Features How it works Join the waitlist Supporting guide",
            "Skip to main content Gainhelm Home Features How it works Join the waitlist Tools Lead Queue Simulator",
            "Skip to main content Gainhelm Home Features How it works Join the waitlist Tools Contractor Leads"
        ]
        for prefix in nav_prefixes:
            if clean_text.startswith(prefix):
                clean_text = clean_text[len(prefix):].strip()
                break
                
        words = clean_text.split()
        first_60_words = ' '.join(words[:60])
        
        # Search for stats (e.g. 85%, 2 hours, 3x, etc.)
        stat_patterns = [
            r'\b\d+%\b',
            r'\b\d+\s+percent\b',
            r'\b\d+\s+(?:hours|minutes|seconds|days|weeks|months|years|jobs|calls|techs|contractors|dollars)\b',
            r'\$\d+',
            r'\b\d+x\b'
        ]
        stats = []
        for pat in stat_patterns:
            stats.extend(re.findall(pat, text, re.I))
            
        # Search for actual quotes (not UI labels like 'Job offer sent.' or 'Email Sent')
        quotes = re.findall(r'"([^"]{20,500})"', text)
        curly_quotes = re.findall(r'“([^”]{20,500})”', text)
        all_quotes = quotes + curly_quotes
        
        # Filter out UI text (must contain multiple words, not look like a button)
        filtered_quotes = []
        for q in all_quotes:
            q_clean = q.strip()
            # Ignore if too short or if it matches UI labels
            if len(q_clean.split()) > 3 and not q_clean.startswith("Job ") and not q_clean.startswith("Thank you for calling"):
                filtered_quotes.append(q_clean)
                
        # Look for Coskun Arif references
        has_coskun_arif = "Coskun Arif" in text
        
        analysis[filename] = {
            'first_60_words': first_60_words,
            'stats': list(set(stats)),
            'quotes': list(set(filtered_quotes)),
            'has_coskun_arif': has_coskun_arif
        }
        
    out_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/copy_details.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)
    print(f"Saved copy details to {out_path}")

if __name__ == '__main__':
    analyze()
