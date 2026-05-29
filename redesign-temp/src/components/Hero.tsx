import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-950">
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
              Assign work faster, cut down on phone tag, and keep schedules clear 
              without spreadsheets or messy handoffs. Built for HVAC, plumbing, and landscaping teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-brand-500/10 transition-all hover:shadow-brand-500/20 hover:-translate-y-0.5"
              >
                Join the waitlist
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold rounded-xl border border-slate-800/80 transition-all hover:-translate-y-0.5"
              >
                See how it works
              </a>
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
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-900/50 rounded-md px-3 py-1 text-xs text-slate-500 border border-slate-800/40 text-center">
                    gainhelm.com/dispatch
                  </div>
                </div>
              </div>

              {/* Board content */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Today's Dispatch</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Monday, June 16 — 8 jobs</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">3 Active</span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-brand-400 text-xs font-medium border border-brand-500/20">2 Pending</span>
                  </div>
                </div>

                {/* Job cards */}
                <div className="space-y-3">
                  {[
                    {
                      title: 'Emergency AC repair',
                      location: 'Northside · 124 Oak St',
                      tech: 'Unassigned',
                      status: 'Needs assignment',
                      statusColor: 'bg-amber-500/10 text-brand-400 border-brand-500/20',
                      priority: true,
                    },
                    {
                      title: 'Kitchen leak follow-up',
                      location: 'Westside · 789 Pine Ave',
                      tech: 'Maria R.',
                      status: 'Scheduled',
                      statusColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      priority: false,
                    },
                    {
                      title: 'HVAC maintenance',
                      location: 'Downtown · 456 Elm Blvd',
                      tech: 'James T.',
                      status: 'In progress',
                      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      priority: false,
                    },
                    {
                      title: 'Landscaping maintenance',
                      location: 'Eastside · 321 Maple Dr',
                      tech: 'Crew B',
                      status: 'Ready to go',
                      statusColor: 'bg-slate-800 text-slate-300 border-slate-700',
                      priority: false,
                    },
                  ].map((job, i) => (
                    <motion.div
                      key={job.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={`p-3.5 rounded-xl border transition-all hover:border-brand-500/40 cursor-pointer ${
                        job.priority
                          ? 'bg-amber-500/5 border-brand-500/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                            {job.priority && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase tracking-wider">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{job.location}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-medium border ${job.statusColor}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <span className="text-[9px] font-bold text-slate-300">
                            {job.tech.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-300">{job.tech}</span>
                      </div>
                    </motion.div>
                  ))}
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
