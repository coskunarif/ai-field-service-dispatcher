import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const files = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

const servicesOld = `<details class="nav-menu">
<summary>Services</summary>
<div class="nav-menu-panel">
<a href="/electrical-dispatch-software">Electrical</a>
<a href="/appliance-repair-dispatch-software">Appliance repair</a>
<a href="/pest-control-dispatch-software">Pest control</a>
<a href="/garage-door-dispatch-software">Garage door</a>
<a href="/cleaning-dispatch-software">Cleaning</a>
<a href="/landscaping-dispatch-software">Landscaping</a>
<a href="/roofing-dispatch-software">Roofing</a>
<a href="/locksmith-dispatch-software">Locksmith</a>
<a href="/pool-service-dispatch-software">Pool service</a>
<a href="/commercial-facilities-dispatch-software">Facilities</a>
<a href="/septic-service-dispatch-software">Septic</a>
<a href="/emergency-restoration-dispatch-software">Emergency restoration</a>
<a href="/restoration-job-management-software">Restoration jobs</a>
</div>
</details>`;

const servicesNew = `<details class="nav-menu">
<summary>Services</summary>
<div class="nav-menu-panel">
<a href="/electrical-dispatch-software">Electrical</a>
<a href="/appliance-repair-dispatch-software">Appliance repair</a>
<a href="/pest-control-dispatch-software">Pest control</a>
<a href="/painting-dispatch-software">Painting</a>
<a href="/garage-door-dispatch-software">Garage door</a>
<a href="/cleaning-dispatch-software">Cleaning</a>
<a href="/landscaping-dispatch-software">Landscaping</a>
<a href="/roofing-dispatch-software">Roofing</a>
<a href="/locksmith-dispatch-software">Locksmith</a>
<a href="/pool-service-dispatch-software">Pool service</a>
<a href="/pressure-washing-dispatch-software">Pressure washing</a>
<a href="/commercial-facilities-dispatch-software">Facilities</a>
<a href="/septic-service-dispatch-software">Septic</a>
<a href="/emergency-restoration-dispatch-software">Emergency restoration</a>
<a href="/restoration-job-management-software">Restoration jobs</a>
<a href="/handyman-dispatch-software">Handyman</a>
<a href="/junk-removal-dispatch-software">Junk removal</a>
<a href="/carpet-cleaning-dispatch-software">Carpet cleaning</a>
<a href="/tree-service-dispatch-software">Tree service</a>
</div>
</details>`;

const alternativesOld = `<details class="nav-menu">
<summary>Alternatives</summary>
<div class="nav-menu-panel">
<a href="/servicetitan-alternative">ServiceTitan Alternative</a>
<a href="/jobber-alternative">Jobber Alternative</a>
<a href="/housecallpro-alternative">Housecall Pro Alternative</a>
<a href="/servicefusion-alternative">Service Fusion Alternative</a>
</div>
</details>`;

const alternativesNew = `<details class="nav-menu">
<summary>Alternatives</summary>
<div class="nav-menu-panel">
<a href="/servicetitan-alternative">ServiceTitan Alternative</a>
<a href="/jobber-alternative">Jobber Alternative</a>
<a href="/housecallpro-alternative">Housecall Pro Alternative</a>
<a href="/servicefusion-alternative">Service Fusion Alternative</a>
<a href="/buildops-alternative">BuildOps Alternative</a>
<a href="/fieldedge-alternative">FieldEdge Alternative</a>
</div>
</details>`;

const footerOldSubstr = `<div class="footer-links"><a href="#waitlist">Join the waitlist</a> · <a href="/hvac-dispatch-software">HVAC</a> · <a href="/plumbing-dispatch-software">Plumbing</a> · <a href="/electrical-dispatch-software">Electrical</a> · <a href="/appliance-repair-dispatch-software">Appliance Repair</a> · <a href="/pest-control-dispatch-software">Pest Control</a> · <a href="/painting-dispatch-software">Painting</a> · <a href="/garage-door-dispatch-software">Garage Door</a> · <a href="/cleaning-dispatch-software">Cleaning</a> · <a href="/landscaping-dispatch-software">Landscaping</a> · <a href="/roofing-dispatch-software">Roofing</a> · <a href="/locksmith-dispatch-software">Locksmith</a> · <a href="/pool-service-dispatch-software">Pool Service</a> · <a href="/pressure-washing-dispatch-software">Pressure Washing</a> · <a href="/commercial-facilities-dispatch-software">Facilities</a> · <a href="/septic-service-dispatch-software">Septic</a> · <a href="/emergency-restoration-dispatch-software">Emergency Restoration</a> · <a href="/restoration-job-management-software">Restoration Jobs</a> · <a href="/handyman-dispatch-software">Handyman</a> · <a href="/junk-removal-dispatch-software">Junk Removal</a> · <a href="/carpet-cleaning-dispatch-software">Carpet Cleaning</a> · <a href="/tree-service-dispatch-software">Tree Service</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/mobile-dispatch-board">Mobile Board</a> · <a href="/servicetitan-alternative">ServiceTitan Alt</a> · <a href="/jobber-alternative">Jobber Alt</a> · <a href="/housecallpro-alternative">Housecall Pro Alt</a> · <a href="/servicefusion-alternative">Service Fusion Alt</a> · <a href="/buildops-alternative">BuildOps Alt</a> · <a href="/fieldedge-alternative">FieldEdge Alt</a> · <a href="/hvac-dispatch-app-vs-spreadsheets">Compare</a> · <a href="/how-to-choose-hvac-dispatch-app">Buying Guide</a> · <a href="/how-hvac-dispatch-apps-reduce-phone-tag">Phone Tag Guide</a> · <a href="/sitemap.xml">sitemap.xml</a> · <a href="/llms.txt">llms.txt</a></div>`;

const footerNewSubstr = `<div class="footer-links"><a href="#waitlist">Join the waitlist</a> · <a href="/hvac-dispatch-software">HVAC</a> · <a href="/plumbing-dispatch-software">Plumbing</a> · <a href="/electrical-dispatch-software">Electrical</a> · <a href="/appliance-repair-dispatch-software">Appliance Repair</a> · <a href="/pest-control-dispatch-software">Pest Control</a> · <a href="/painting-dispatch-software">Painting</a> · <a href="/garage-door-dispatch-software">Garage Door</a> · <a href="/cleaning-dispatch-software">Cleaning</a> · <a href="/landscaping-dispatch-software">Landscaping</a> · <a href="/roofing-dispatch-software">Roofing</a> · <a href="/locksmith-dispatch-software">Locksmith</a> · <a href="/pool-service-dispatch-software">Pool Service</a> · <a href="/pressure-washing-dispatch-software">Pressure Washing</a> · <a href="/commercial-facilities-dispatch-software">Facilities</a> · <a href="/septic-service-dispatch-software">Septic</a> · <a href="/emergency-restoration-dispatch-software">Emergency Restoration</a> · <a href="/restoration-job-management-software">Restoration Jobs</a> · <a href="/handyman-dispatch-software">Handyman</a> · <a href="/junk-removal-dispatch-software">Junk Removal</a> · <a href="/carpet-cleaning-dispatch-software">Carpet Cleaning</a> · <a href="/tree-service-dispatch-software">Tree Service</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/mobile-dispatch-board">Mobile Board</a> · <a href="/servicetitan-alternative">ServiceTitan Alt</a> · <a href="/jobber-alternative">Jobber Alt</a> · <a href="/housecallpro-alternative">Housecall Pro Alt</a> · <a href="/servicefusion-alternative">Service Fusion Alt</a> · <a href="/buildops-alternative">BuildOps Alt</a> · <a href="/fieldedge-alternative">FieldEdge Alt</a> · <a href="/hvac-dispatch-app-vs-spreadsheets">Compare</a> · <a href="/how-to-choose-hvac-dispatch-app">Buying Guide</a> · <a href="/how-hvac-dispatch-apps-reduce-phone-tag">Phone Tag Guide</a> · <a href="/tools/facebook-post-generator">FB Generator</a> · <a href="/tools/lead-queue">Lead Queue</a> · <a href="/tools/contractor-leads">Contractor Leads</a> · <a href="/sitemap.xml">sitemap.xml</a> · <a href="/llms.txt">llms.txt</a></div>`;

for (const file of files) {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Clean formatting differences first (remove newlines inside details structure in some files if any)
  const normalizedServicesOld = servicesOld.replace(/\s+/g, ' ');
  const normalizedContent = content.replace(/\s+/g, ' ');

  if (content.includes(servicesOld)) {
    content = content.replace(servicesOld, servicesNew);
    updated = true;
  } else if (normalizedContent.includes(normalizedServicesOld)) {
    // If exact formatting didn't match, do a regex or token based replacement
    console.log(`Fuzzy services replacement needed for ${file}`);
  }

  if (content.includes(alternativesOld)) {
    content = content.replace(alternativesOld, alternativesNew);
    updated = true;
  }

  if (content.includes(footerOldSubstr)) {
    content = content.replace(footerOldSubstr, footerNewSubstr);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated ${file}`);
  } else {
    console.log(
      `No changes made to ${file} (might already be updated or using different formatting)`
    );
  }
}
