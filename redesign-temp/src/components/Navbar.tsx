import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wrench, ChevronDown } from 'lucide-react';

const servicesLinks = [
  { label: 'Electrical', href: '/electrical-dispatch-software' },
  { label: 'Appliance repair', href: '/appliance-repair-dispatch-software' },
  { label: 'Pest control', href: '/pest-control-dispatch-software' },
  { label: 'Garage door', href: '/garage-door-dispatch-software' },
  { label: 'Cleaning', href: '/cleaning-dispatch-software' },
  { label: 'Landscaping', href: '/landscaping-dispatch-software' },
  { label: 'Roofing', href: '/roofing-dispatch-software' },
  { label: 'Locksmith', href: '/locksmith-dispatch-software' },
  { label: 'Pool service', href: '/pool-service-dispatch-software' },
  { label: 'Facilities', href: '/commercial-facilities-dispatch-software' },
  { label: 'Septic', href: '/septic-service-dispatch-software' },
  { label: 'Emergency restoration', href: '/emergency-restoration-dispatch-software' },
  { label: 'Restoration jobs', href: '/restoration-job-management-software' },
  { label: 'Handyman', href: '/handyman-dispatch-software' },
  { label: 'Carpet cleaning', href: '/carpet-cleaning-dispatch-software' },
  { label: 'Tree service', href: '/tree-service-dispatch-software' },
];

const alternativesLinks = [
  { label: 'ServiceTitan Alternative', href: '/servicetitan-alternative' },
  { label: 'Jobber Alternative', href: '/jobber-alternative' },
  { label: 'Housecall Pro Alternative', href: '/housecallpro-alternative' },
  { label: 'Service Fusion Alternative', href: '/servicefusion-alternative' },
  { label: 'BuildOps Alternative', href: '/buildops-alternative' },
  { label: 'FieldEdge Alternative', href: '/fieldedge-alternative' },
];

const resourcesLinks = [
  { label: 'Compare', href: '/hvac-dispatch-app-vs-spreadsheets' },
  { label: 'Buying guide', href: '/how-to-choose-hvac-dispatch-app' },
  { label: 'Phone tag guide', href: '/how-hvac-dispatch-apps-reduce-phone-tag' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-900'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Gainhelm
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden xl:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/field-service-scheduling" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              How it works
            </a>
          </div>

          <div className="hidden xl:flex items-center gap-3">
            <a
              href="#waitlist"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </a>
            <a
              href="#waitlist"
              className="text-sm font-semibold text-slate-950 bg-brand-500 hover:bg-brand-400 transition-colors px-5 py-2.5 rounded-lg shadow-lg shadow-brand-500/20"
            >
              Join waitlist
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-900 overflow-y-auto max-h-[85vh] no-scrollbar"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="/" onClick={() => setMobileOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white py-1">
                Home
              </a>
              <a href="/field-service-scheduling" onClick={() => setMobileOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white py-1">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white py-1">
                How it works
              </a>
              <a
                href="#waitlist"
                onClick={() => setMobileOpen(false)}
                className="block text-center text-sm font-semibold text-slate-950 bg-brand-500 px-5 py-3 rounded-lg mt-4"
              >
                Join waitlist
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
