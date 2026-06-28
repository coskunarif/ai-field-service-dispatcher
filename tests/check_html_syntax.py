#!/usr/bin/env python3
import os
import re
import sys
import json
from html.parser import HTMLParser

class RobustHTMLParser(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.errors = []
        self.warnings = []
        self.current_tag = None
        self.open_tags = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        self.open_tags.append(tag)
        
        # Check raw tag text for syntax issues, specifically unescaped quotes
        # We can extract the raw tag from the source using getpos()
        pos = self.getpos() # (line, offset)
        
    def handle_endtag(self, tag):
        if not self.open_tags:
            self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}")
            return
        
        # HTML allows some unclosed tags or implicit closing (like self-closing or omitted tags like p/li),
        # but let's check for standard block structures or tags that should match.
        last_tag = self.open_tags.pop()
        if last_tag != tag:
            # HTML is permissive, but let's warn if it's mismatching
            # Standard self-closing/void elements don't have end tags, but if we do get an end tag, it should match.
            pass

    def error(self, message):
        self.errors.append(f"Parser error: {message} at line {self.getpos()[0]}")

def check_file(filename):
    print(f"Checking {filename}...")
    errors = []
    warnings = []
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Parse JSON-LD blocks and check for validity
    json_ld_blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
    for idx, block in enumerate(json_ld_blocks):
        try:
            json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON-LD block {idx+1}: {e}")

    # 2. Check for common syntax issues using regex
    # Check for unescaped double quotes inside double-quoted attributes
    # e.g., content="something "inside" else"
    # A standard attribute looks like: name="value" or name='value'
    # Let's find all attributes: \b[a-zA-Z0-9:-]+="[^"]*" or '[^']*'
    # But if there are unescaped quotes, it might look like content="something "quote" something"
    # Let's check for any attribute that has double quotes inside that are not escaped or properly delimited.
    # We can do this by searching for strings like: name="[^"]*"[^"]*"
    # Or let's inspect matches of <meta ...> or similar tags.
    # Let's write a parser-level check or a simple regex.
    # Let's look for tags and inspect their attribute values.
    # A robust way is to find all tags <... >
    tag_matches = re.finditer(r'<([a-zA-Z0-9:-]+)([^>]*)>', content)
    for match in tag_matches:
        tag_name = match.group(1)
        attr_text = match.group(2)
        line_num = content.count('\n', 0, match.start()) + 1
        
        # If tag is inside a script or comment, skip it
        # Let's check if the tag is commented out
        # (A simple check: if it's between <!-- and -->)
        # We can find all comments and check if our match is inside any of them.
        is_commented = False
        for comm in re.finditer(r'<!--.*?-->', content, re.DOTALL):
            if comm.start() <= match.start() <= comm.end():
                is_commented = True
                break
        if is_commented:
            continue
            
        if tag_name.lower() in ['script', 'style']:
            continue
            
        # Parse attributes manually to check for quote issues
        # Let's find attributes. An attribute is typically name = value
        # We can parse the attr_text character by character to detect mismatched/unescaped quotes.
        in_quote = None # None, '"', or "'"
        current_attr_name = ""
        current_attr_val = ""
        i = 0
        while i < len(attr_text):
            char = attr_text[i]
            if in_quote:
                if char == in_quote:
                    # Closing quote
                    in_quote = None
                    # Verify if the next non-whitespace char is a valid separator (whitespace, '>', or '/')
                    # If it's a letter or symbol, it means the quote was closed prematurely and we have unescaped quotes!
                    # e.g. content="hello "world" class="something"
                    # here, after "hello ", the quote is closed. The next char is 'w', which is a letter.
                    # This is a syntax error!
                    j = i + 1
                    has_whitespace = False
                    while j < len(attr_text) and attr_text[j].isspace():
                        has_whitespace = True
                        j += 1
                    if j < len(attr_text):
                        next_char = attr_text[j]
                        if not has_whitespace and next_char not in ['/', '>', '=']:
                            # Mismatched quote warning/error!
                            errors.append(f"Line {line_num}: Premature quote closure or unescaped quote in tag <{tag_name}> near ...{attr_text[max(0, i-20):i+20]}...")
                else:
                    current_attr_val += char
            else:
                if char in ['"', "'"]:
                    in_quote = char
                    current_attr_val = ""
                elif char == '=':
                    # Just an equals sign
                    pass
            i += 1
            
        if in_quote:
            errors.append(f"Line {line_num}: Unclosed quote ({in_quote}) in tag <{tag_name}>: {attr_text}")

    # 3. Check for unescaped HTML entities in titles and descriptions that might render poorly
    # (e.g., &amp;amp; or &amp; instead of raw & in some context if it was double-encoded)
    # Let's check for "&amp;amp;"
    if "&amp;amp;" in content:
        warnings.append("Found double-encoded entity '&amp;amp;'")
        
    return errors, warnings

def main():
    modified_files = [
        'garage-door-dispatch-software.html',
        'handyman-dispatch-software.html',
        'index.html',
        'junk-removal-dispatch-software.html',
        'locksmith-dispatch-software.html',
        'mobile-dispatch-board.html',
        'pool-service-dispatch-software.html',
        'pressure-washing-dispatch-software.html',
        'restoration-job-management-software.html',
        'roofing-dispatch-software.html',
        'septic-service-dispatch-software.html',
        'tree-service-dispatch-software.html'
    ]
    
    total_errors = 0
    total_warnings = 0
    
    for f in modified_files:
        if not os.path.exists(f):
            print(f"Skipping {f} (does not exist locally)")
            continue
        errors, warnings = check_file(f)
        if errors:
            print(f"  ERRORS:")
            for e in errors:
                print(f"    - {e}")
                total_errors += 1
        if warnings:
            print(f"  WARNINGS:")
            for w in warnings:
                print(f"    - {w}")
                total_warnings += 1
        if not errors and not warnings:
            print("  OK")
            
    print(f"\nAudit complete. Total errors: {total_errors}, Total warnings: {total_warnings}")
    if total_errors > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()
