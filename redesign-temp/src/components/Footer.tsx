

const footerSections = [
  {
    title: 'Services',
    links: [
      { label: 'HVAC Dispatch', href: '/hvac-dispatch-software' },
      { label: 'Plumbing Dispatch', href: '/plumbing-dispatch-software' },
      { label: 'Electrical Dispatch', href: '/electrical-dispatch-software' },
      { label: 'Appliance Repair', href: '/appliance-repair-dispatch-software' },
      { label: 'Pest Control', href: '/pest-control-dispatch-software' },
      { label: 'Garage Door', href: '/garage-door-dispatch-software' },
      { label: 'Cleaning Dispatch', href: '/cleaning-dispatch-software' },
      { label: 'Landscaping Dispatch', href: '/landscaping-dispatch-software' },
      { label: 'Roofing Dispatch', href: '/roofing-dispatch-software' },
      { label: 'Locksmith Dispatch', href: '/locksmith-dispatch-software' },
      { label: 'Pool Service', href: '/pool-service-dispatch-software' },
      { label: 'Facilities Maintenance', href: '/commercial-facilities-dispatch-software' },
      { label: 'Septic Service', href: '/septic-service-dispatch-software' },
      { label: 'Emergency Restoration', href: '/emergency-restoration-dispatch-software' },
      { label: 'Restoration Jobs', href: '/restoration-job-management-software' },
      { label: 'Handyman Dispatch', href: '/handyman-dispatch-software' },
      { label: 'Carpet Cleaning', href: '/carpet-cleaning-dispatch-software' },
      { label: 'Tree Service', href: '/tree-service-dispatch-software' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Scheduling Software', href: '/field-service-scheduling' },
      { label: 'Mobile board', href: '/mobile-dispatch-board' },
      { label: 'Join waitlist', href: '#waitlist' },
    ],
  },
  {
    title: 'Alternatives',
    links: [
      { label: 'ServiceTitan Alt', href: '/servicetitan-alternative' },
      { label: 'Jobber Alt', href: '/jobber-alternative' },
      { label: 'Housecall Pro Alt', href: '/housecallpro-alternative' },
      { label: 'Service Fusion Alt', href: '/servicefusion-alternative' },
      { label: 'BuildOps Alt', href: '/buildops-alternative' },
      { label: 'FieldEdge Alt', href: '/fieldedge-alternative' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Spreadsheets vs Apps', href: '/hvac-dispatch-app-vs-spreadsheets' },
      { label: 'HVAC Buying Guide', href: '/how-to-choose-hvac-dispatch-app' },
      { label: 'Phone Tag Guide', href: '/how-hvac-dispatch-apps-reduce-phone-tag' },
      { label: 'sitemap.xml', href: '/sitemap.xml' },
      { label: 'llms.txt', href: '/llms.txt' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Gainhelm</span>
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              AI dispatch software that helps field service businesses assign work faster, 
              cut down on phone tag, and keep schedules clear.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Gainhelm. All rights reserved. <span className="mx-2">•</span> Verified by Coskun Arif, Field Service Expert
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-slate-350 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-350 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-350 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
