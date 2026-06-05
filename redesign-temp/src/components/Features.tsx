import { motion } from 'framer-motion';
import { Zap, Calendar, Users, MessageSquare, MapPin, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Dispatch',
    description: 'Automatically assign jobs to the right technician based on skills, location, and availability. No more guesswork.',
    color: 'bg-amber-500/10 text-brand-400 border-brand-500/20',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Works with your existing Google Calendar. The AI dispatcher schedules and updates jobs in the calendar you already use—no new software silo.',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    icon: Users,
    title: 'Headless Coordination',
    description: 'Techs receive and accept dispatch offers via native SMS with zero app downloads or logging in. Simple text threads that work on any phone.',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Customer Updates',
    description: 'Keep customers in the loop with automated status updates. Reduce "where\'s my tech?" calls by 80%.',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    icon: MapPin,
    title: 'Route Optimization',
    description: 'Cut drive time with intelligent routing. Get technicians to jobs faster and fit more calls into each day.',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    icon: BarChart3,
    title: 'Performance Insights',
    description: 'Track completion rates, response times, and team productivity. Make data-driven decisions to grow your business.',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to run dispatch{' '}
            <span className="gradient-text">without the chaos</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Built from the ground up for small field service teams who need modern tools 
            without enterprise complexity.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-850 hover:border-brand-500/40 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
