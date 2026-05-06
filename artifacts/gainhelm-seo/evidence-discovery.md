# Gainhelm SEO discovery evidence

Current project files:
- app root: /home/ubuntuadmin/projects/ai-field-service-dispatcher
- routes: server.js
- sitemap: sitemap.xml
- core pages: index.html, hvac-dispatch-software.html, hvac-dispatch-app-vs-spreadsheets.html, how-to-choose-hvac-dispatch-app.html, plumbing-dispatch-software.html, field-service-scheduling.html
- supporting page: how-hvac-dispatch-apps-reduce-phone-tag.html

6 primary intent URLs:
1. / -> HVAC/plumbing/landscaping AI dispatch app/software
2. /hvac-dispatch-software -> HVAC dispatch software
3. /hvac-dispatch-app-vs-spreadsheets -> HVAC dispatch app vs spreadsheets
4. /how-to-choose-hvac-dispatch-app -> how to choose an HVAC dispatch app
5. /plumbing-dispatch-software -> plumbing dispatch software
6. /field-service-scheduling -> field service scheduling software

Supporting content added:
- /how-hvac-dispatch-apps-reduce-phone-tag

Evidence commands:
- `google-search-console-cli sitemap-submit sc-domain:gainhelm.com https://gainhelm.com/sitemap.xml --credentials ~/.config/gcloud/application_default_credentials.json --format json`
- `google-search-console-cli sitemaps sc-domain:gainhelm.com --credentials ~/.config/gcloud/application_default_credentials.json --format json`
- `rg -n 'href="/(hvac-dispatch-software|hvac-dispatch-app-vs-spreadsheets|how-to-choose-hvac-dispatch-app|plumbing-dispatch-software|field-service-scheduling|how-hvac-dispatch-apps-reduce-phone-tag)"' index.html hvac-dispatch-software.html hvac-dispatch-app-vs-spreadsheets.html how-to-choose-hvac-dispatch-app.html plumbing-dispatch-software.html field-service-scheduling.html how-hvac-dispatch-apps-reduce-phone-tag.html`

Notes:
- Live sitemap currently includes the 6 primary URLs plus the supporting article.
- Search Console accepted the sitemap submit call.
