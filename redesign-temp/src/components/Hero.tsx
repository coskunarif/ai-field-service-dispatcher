import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Shield } from 'lucide-react';

export default function Hero() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName) {
      setStatus({ type: 'error', message: 'Name is required' });
      return;
    }
    if (!trimmedEmail) {
      setStatus({ type: 'error', message: 'Email is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, company: trimmedCompany }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to submit. Please try again.');
      }

      setSubmittedEmail(trimmedEmail);
      setStatus({
        type: 'success',
        message: "Thanks! You're on the waitlist. We'll be in touch soon."
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'We had trouble saving your waitlist request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupUrl = (() => {
    try {
      const url = new URL('/setup', window.location.origin);
      url.searchParams.set('email', submittedEmail);
      return url.pathname + url.search;
    } catch {
      return `/setup?email=${encodeURIComponent(submittedEmail)}`;
    }
  })();

  return (
    <section id="top" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 hero-grid opacity-30" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium"
            >
              <Zap className="w-4 h-4 text-brand-500" />
              Early access now open
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              AI dispatch software{' '}
              <span className="gradient-text">built for field service teams</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl"
            >
              Assign work faster, cut phone tag, and keep schedules clear. 
              Techs coordinate over SMS with zero app downloads, syncing directly to the calendar you already use—no new silos to manage.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-xl space-y-4"
            >
              <form id="waitlist-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Full Name <span className="text-brand-400">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Work Email <span className="text-brand-400">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="JD HVAC Services"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="form-submit w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:shadow-brand-500/20 disabled:opacity-70 mt-2 cursor-pointer"
                >
                  Join Waitlist & Try Simulator
                </button>
              </form>

              <div
                id="waitlist-status"
                className={
                  status.type
                    ? `waitlist-status ${status.type} p-4 rounded-xl border text-sm font-semibold transition-all ${
                        status.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`
                    : 'waitlist-status hidden'
                }
              >
                {status.type === 'success' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span>Thanks! You're on the waitlist. We'll be in touch soon.</span>
                    <a className="waitlist-setup-link inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shrink-0" href={setupUrl}>
                      Try the Simulator Now
                    </a>
                  </div>
                ) : (
                  <span>{status.message}</span>
                )}
              </div>

              <div id="waitlist-help" className="text-xs text-slate-500">
                We'll only use this to follow up about early access. No spam, ever.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-6 pt-4"
            >
              {[
                { icon: Clock, text: 'Save 5+ hrs/week' },
                { icon: Shield, text: 'No credit card required' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className="w-4 h-4 text-brand-500" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Dispatch board mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-slate-900/90 rounded-2xl shadow-2xl shadow-black/60 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800/60">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-900/50 rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-800/40 text-center font-mono">
                    gainhelm.com/supervision
                  </div>
                </div>
              </div>

              {/* Dashboard Workspace */}
              <div className="grid grid-cols-[150px_1fr] md:grid-cols-[160px_1fr] bg-[#030712]">
                {/* Sidebar */}
                <div className="p-4 border-r border-slate-800/80 flex flex-col gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-white tracking-wider uppercase mb-3">Context</h4>
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Technicians</h5>
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px] bg-slate-900/50 p-1.5 rounded border border-slate-800/30">
                        <span className="text-slate-200 font-medium">Sarah Connor</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0">Active</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px] bg-slate-900/50 p-1.5 rounded border border-slate-800/30">
                        <span className="text-slate-200 font-medium">John Wick</span>
                        <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0">Available</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rules</h5>
                    <div className="text-[10px] sm:text-[11px] text-slate-300 bg-slate-900/50 p-1.5 rounded border border-slate-800/30">
                      ⏱️ Timeout: <strong className="text-white">3m</strong>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-300 bg-slate-900/50 p-1.5 rounded border border-slate-800/30">
                      💰 Call Fee: <strong className="text-white">$120</strong>
                    </div>
                  </div>
                </div>

                {/* Feed */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800/50 pb-2">
                    <span className="font-semibold text-slate-300">AI Dispatcher Logs</span>
                    <span className="font-mono text-[9px] text-slate-500">14:32:01</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 font-mono text-[10px] sm:text-[11px] leading-relaxed">
                    <div className="flex gap-2 p-1.5 rounded border-l-2 border-blue-500 bg-blue-500/5">
                      <span className="text-slate-500 flex-shrink-0">[14:31:10]</span>
                      <span className="text-slate-300"><strong>Job:</strong> Emergency call.</span>
                    </div>
                    
                    <div className="flex gap-2 p-1.5 rounded border-l-2 border-amber-500 bg-amber-500/5 text-amber-300">
                      <span className="text-amber-500/50 flex-shrink-0">[14:31:12]</span>
                      <span><strong>AI:</strong> Scanning technicians...</span>
                    </div>

                    <div className="flex gap-2 p-1.5 rounded border-l-2 border-amber-500 bg-amber-500/5 text-amber-300">
                      <span className="text-amber-500/50 flex-shrink-0">[14:31:15]</span>
                      <span>Sarah Connor matched.</span>
                    </div>

                    <div className="flex gap-2 p-1.5 rounded border-l-2 border-blue-500 bg-blue-500/5">
                      <span className="text-slate-500 flex-shrink-0">[14:31:21]</span>
                      <span className="text-slate-300"><strong>SMS Sent:</strong> "Job offer sent."</span>
                    </div>

                    <div className="flex gap-2 p-1.5 rounded border-l-2 border-emerald-500 bg-emerald-500/5 text-emerald-400">
                      <span className="text-emerald-500/50 flex-shrink-0">[14:31:25]</span>
                      <span><strong>SMS Recv:</strong> "YES" (Accepted)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-4 -left-4 bg-slate-900/90 rounded-xl shadow-xl shadow-black/40 border border-slate-800 p-4 flex items-center gap-3 backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Assigned</p>
                <p className="text-xs text-slate-400">Matched to best tech</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
