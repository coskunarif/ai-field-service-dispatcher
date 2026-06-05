import { motion } from 'framer-motion';
import { Thermometer, Droplets, TreePine, ArrowRight } from 'lucide-react';

const industries = [
  {
    icon: Thermometer,
    name: 'HVAC Teams',
    description: 'Keep service calls organized, reduce missed handoffs, and move emergency work faster with real-time dispatch updates.',
    stat: '40% faster emergency response',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    imageColor: 'bg-gradient-to-br from-orange-500/10 to-amber-500/5',
    href: '/hvac-dispatch-software',
  },
  {
    icon: Droplets,
    name: 'Plumbing Companies',
    description: 'Track new jobs, schedule arrivals, and keep the office and technicians on the same page without constant phone calls.',
    stat: '60% fewer missed appointments',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    imageColor: 'bg-gradient-to-br from-blue-500/10 to-sky-500/5',
    href: '/plumbing-dispatch-software',
  },
  {
    icon: TreePine,
    name: 'Landscaping Crews',
    description: 'Coordinate recurring work and day-of changes without losing visibility across the schedule or crew assignments.',
    stat: '3x more jobs per day',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    imageColor: 'bg-gradient-to-br from-emerald-500/10 to-green-500/5',
    href: '/landscaping-dispatch-software',
  },
];

export default function Industries() {
  return (
    <section id="industries" className="py-24 bg-slate-900/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            Industries
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for the teams that{' '}
            <span className="gradient-text">keep things running</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Whether you fix AC units, unclog drains, or maintain lawns — Gainhelm is designed for your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-850 hover:border-brand-500/40 transition-all duration-300"
            >
              <div className={`h-40 ${industry.imageColor} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/20" />
                  <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white/10" />
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 bg-slate-900 border-slate-800 shadow-lg ${industry.color.split(' ')[1]}`}>
                  <industry.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{industry.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{industry.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
                    {industry.stat}
                  </span>
                  <a
                    href={industry.href}
                    className="text-sm font-medium text-slate-500 group-hover:text-brand-400 transition-colors flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
