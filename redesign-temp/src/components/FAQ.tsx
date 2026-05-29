import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Gainhelm?',
    answer: 'Gainhelm is AI dispatch app and software for field service teams. It is built to help HVAC, plumbing, and landscaping businesses keep jobs organized and moving from intake to completion.',
  },
  {
    question: 'Who should use Gainhelm?',
    answer: 'Gainhelm is for small and growing service businesses that want a clearer dispatch workflow without adopting a heavy enterprise system. If you run 3 to 50 technicians, Gainhelm is built for you.',
  },
  {
    question: 'Is Gainhelm available right now?',
    answer: 'Gainhelm is collecting waitlist signups while early access continues to roll out. Join the waitlist to be among the first to get access when we open to new teams.',
  },
  {
    question: 'How do I get early access?',
    answer: 'Use the waitlist form on this page. We will contact you when early access is ready for your team. Early adopters get priority onboarding and discounted pricing.',
  },
  {
    question: 'What does Gainhelm replace?',
    answer: 'Gainhelm is designed to replace messy spreadsheets, text threads, whiteboards, and ad hoc handoff workflows with one clear dispatch board that your whole team can use.',
  },
  {
    question: 'Does it work on mobile?',
    answer: 'Yes. Technicians get a dedicated mobile app to view their schedule, update job status, and communicate with the office. The dispatch dashboard works on any desktop or tablet browser.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Questions people ask{' '}
            <span className="gradient-text">before joining</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl border border-slate-850 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-900/30"
              >
                <span className="font-semibold text-white text-sm sm:text-base pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180 text-brand-400' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-900/40 pt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
