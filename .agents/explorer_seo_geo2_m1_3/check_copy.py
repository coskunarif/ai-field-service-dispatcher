import json
import re

def check_copy():
    parsed_path = '/home/ubuntuadmin/projects/ai-field-service-dispatcher/.agents/explorer_seo_geo2_m1_3/parsed_results.json'
    with open(parsed_path, 'r', encoding='utf-8') as f:
        results = json.load(f)
        
    for filename, data in sorted(results.items()):
        text = data['body_text'] or ""
        
        # 1. First 60 words
        words = text.split()
        first_60 = ' '.join(words[:60])
        
        # 2. Check for statistics (e.g., percentages like "85%", numbers followed by trade units, time metrics)
        has_stats = re.findall(r'\b\d+%\b|\b\d+\s*(?:percent|hours|minutes|seconds|days|weeks|dollars|\$|x)\b', text, re.I)
        
        # 3. Check for quotes (double quotes around text, or mentions of "Coskun Arif" quotes)
        # In HTML, quotes can be literal " or entities
        quotes = re.findall(r'"([^"]{10,200})"', text)
        curly_quotes = re.findall(r'“([^”]{10,200})”', text)
        all_quotes = quotes + curly_quotes
        
        # Let's filter quotes to see if there are quotes from Coskun Arif
        arif_quotes = [q for q in all_quotes if 'arif' in q.lower() or 'coskun' in q.lower()]
        
        # Let's also check if the text mentions Coskun Arif's name
        has_author_mention = "Coskun Arif" in text
        
        print(f"=== {filename} ===")
        print(f"First 60 words: {first_60[:300]}...")
        print(f"Stats found ({len(has_stats)}): {has_stats[:5]}")
        print(f"Author mention? {'Yes' if has_author_mention else 'No'}")
        print(f"Quotes found ({len(all_quotes)}): {all_quotes[:2]}")
        print("-" * 50)

if __name__ == '__main__':
    check_copy()
