import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section id="waitlist" className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            Limited early access
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to stop losing time to{' '}
            <span className="text-brand-400">messy dispatch?</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Join the waitlist to be first in line for AI dispatch software built for HVAC, 
            plumbing, and landscaping teams. Early adopters get priority onboarding.
          </p>

          <a href="#top" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:shadow-brand-500/20 disabled:opacity-70 mt-6 cursor-pointer">Join the Waitlist (Go to Top)</a>

          <p className="text-xs text-slate-500 mt-6">
            We’ll only use this to follow up about early access. No spam, ever.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
