#!/usr/bin/env python3
import os
import re

# Directory containing the HTML files
directory = "/home/ubuntuadmin/projects/ai-field-service-dispatcher"

# Target header block to replace
nav_pattern = re.compile(r'<nav class="nav" aria-label="Primary">.*?</nav>', re.DOTALL)
new_nav = """<nav class="nav" aria-label="Primary">
<a href="/">Home</a>
<a href="/field-service-scheduling">Features</a>
<a href="#how-it-works">How it works</a>
<a href="#waitlist" class="nav-cta">Join the waitlist</a>
</nav>"""

# Target footer block to replace
footer_pattern = re.compile(r'<footer>.*?</footer>', re.DOTALL)
new_footer = """<footer><div>© 2026 Gainhelm. Built for field service dispatch.</div><div class="footer-links"><a href="#waitlist">Join the waitlist</a> · <a href="/hvac-dispatch-software">HVAC</a> · <a href="/plumbing-dispatch-software">Plumbing</a> · <a href="/electrical-dispatch-software">Electrical</a> · <a href="/appliance-repair-dispatch-software">Appliance Repair</a> · <a href="/pest-control-dispatch-software">Pest Control</a> · <a href="/garage-door-dispatch-software">Garage Door</a> · <a href="/cleaning-dispatch-software">Cleaning</a> · <a href="/landscaping-dispatch-software">Landscaping</a> · <a href="/roofing-dispatch-software">Roofing</a> · <a href="/locksmith-dispatch-software">Locksmith</a> · <a href="/pool-service-dispatch-software">Pool Service</a> · <a href="/commercial-facilities-dispatch-software">Facilities</a> · <a href="/septic-service-dispatch-software">Septic</a> · <a href="/emergency-restoration-dispatch-software">Emergency Restoration</a> · <a href="/restoration-job-management-software">Restoration Jobs</a> · <a href="/handyman-dispatch-software">Handyman</a> · <a href="/carpet-cleaning-dispatch-software">Carpet Cleaning</a> · <a href="/tree-service-dispatch-software">Tree Service</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/mobile-dispatch-board">Mobile Board</a> · <a href="/servicetitan-alternative">ServiceTitan Alt</a> · <a href="/jobber-alternative">Jobber Alt</a> · <a href="/housecallpro-alternative">Housecall Pro Alt</a> · <a href="/servicefusion-alternative">Service Fusion Alt</a> · <a href="/buildops-alternative">BuildOps Alt</a> · <a href="/fieldedge-alternative">FieldEdge Alt</a> · <a href="/hvac-dispatch-app-vs-spreadsheets">Compare</a> · <a href="/how-to-choose-hvac-dispatch-app">Buying Guide</a> · <a href="/how-hvac-dispatch-apps-reduce-phone-tag">Phone Tag Guide</a> · <a href="/sitemap.xml">sitemap.xml</a> · <a href="/llms.txt">llms.txt</a></div></footer>"""

print("Starting clean_pages script...")

count = 0
for filename in os.listdir(directory):
    if filename.endswith(".html") and filename != "index.html" and not filename.startswith("appliance-repair-dispatch-software.html.tmp"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if patterns match
        has_nav = bool(nav_pattern.search(content))
        has_footer = bool(footer_pattern.search(content))
        
        if has_nav or has_footer:
            new_content = content
            if has_nav:
                new_content = nav_pattern.sub(new_nav, new_content)
            if has_footer:
                new_content = footer_pattern.sub(new_footer, new_content)
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            
            print(f"Updated: {filename} (nav={has_nav}, footer={has_footer})")
            count += 1
        else:
            print(f"Skipped (no matches): {filename}")

print(f"Done! Updated {count} HTML files.")
