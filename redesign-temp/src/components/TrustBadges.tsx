import { motion } from 'framer-motion';

const badges = [
  'HVAC Today',
  'ServicePro Weekly',
  'FieldTech Review',
  'Contractor Hub',
  'TradePulse',
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-slate-950 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest mb-8"
        >
          Trusted by field service teams everywhere
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {badges.map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-bold text-slate-500 hover:text-slate-350 transition-colors cursor-default"
            >
              {badge}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
