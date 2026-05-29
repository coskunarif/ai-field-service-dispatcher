import { motion } from 'framer-motion';
import { ClipboardList, UserCheck, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Add the job',
    description: 'Capture the customer request, location, and work details in seconds. AI extracts key info so you don\'t have to type everything.',
    color: 'bg-amber-500/10 text-brand-400',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Assign the right technician',
    description: 'Our AI matches the job to the best available tech based on skills, proximity, and workload. One click to confirm.',
    color: 'bg-blue-500/10 text-blue-400',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Follow through to completion',
    description: 'Track progress in real time. Techs update status from the field, customers get notified, and nothing falls through the cracks.',
    color: 'bg-emerald-500/10 text-emerald-400',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Three steps to a{' '}
            <span className="gradient-text">cleaner dispatch flow</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Simple enough to explain in seconds, structured enough to transform how your team operates.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-emerald-500/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-800/80 shadow-xl mb-6">
                <step.icon className={`w-7 h-7 ${step.color.split(' ')[1]}`} />
              </div>
              <div className="block max-w-[80px] mx-auto px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold mb-4">
                Step {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
