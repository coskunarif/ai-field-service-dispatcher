import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Marcus Chen',
    role: 'Operations Manager',
    company: 'Apex HVAC',
    content: 'We went from losing 2-3 jobs a week to missing zero. The AI dispatch actually understands our techs\' strengths and routes jobs intelligently.',
    rating: 5,
    avatar: 'MC',
    color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  },
  {
    name: 'Sarah Williams',
    role: 'Owner',
    company: 'Williams Plumbing',
    content: 'My office manager used to spend 3 hours every morning on the schedule. Now it takes 15 minutes. The time savings alone paid for itself.',
    rating: 5,
    avatar: 'SW',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  {
    name: 'David Rodriguez',
    role: 'Crew Lead',
    company: 'GreenScape Landscaping',
    content: 'Our crew finally knows exactly where to go and what to do each morning. No more group texts at 6 AM trying to figure out the day.',
    rating: 5,
    avatar: 'DR',
    color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Loved by teams who{' '}
            <span className="gradient-text">ship work every day</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-850 relative"
            >
              <Quote className="w-8 h-8 text-slate-800 absolute top-6 right-6" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-brand-400 text-brand-400" />
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm">{t.content}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
