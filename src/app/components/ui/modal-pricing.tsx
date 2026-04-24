/* ═══════════════════════════════════════════════════════════════
   modal-pricing.tsx  ·  /components/ui/modal-pricing.tsx
   Professional 3-step plan selector: Select → Confirm → Success
═══════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Check, Zap, Shield, Crown, ArrowRight,
  Sparkles, Star, BadgeCheck, Rocket,
} from 'lucide-react';
import { cn } from './utils';

/* ── Types ───────────────────────────────────────────────── */
export interface PricingPlan {
  id: string; name: string; price: string; period: string;
  tagline: string; description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string; ring: string; softBg: string; softBorder: string;
  textAccent: string; badge?: string; popular?: boolean;
  features: { text: string; strong?: boolean }[];
  cta: string;
}

export interface ModalPricingProps {
  open: boolean; onClose: () => void;
  onSelectPlan: (plan: PricingPlan) => void;
  jobTitle?: string; company?: string;
}

/* ── Plan data ───────────────────────────────────────────── */
const PLANS: PricingPlan[] = [
  {
    id: 'starter', name: 'Starter', price: 'Free', period: '',
    tagline: 'Begin your journey',
    description: 'Everything you need to send your first polished application today.',
    icon: Zap, gradient: 'from-slate-500 to-slate-600',
    ring: 'ring-slate-300', softBg: 'bg-slate-50', softBorder: 'border-slate-200',
    textAccent: 'text-slate-700', cta: 'Apply for Free',
    features: [
      { text: '1 application email send' },
      { text: 'Pre-written professional template' },
      { text: 'Email copy & download' },
      { text: 'Basic resume improvement tips' },
    ],
  },
  {
    id: 'professional', name: 'Professional', price: '₹299', period: '/mo',
    tagline: 'For active job seekers',
    description: 'Unlimited applications with AI personalisation and smart follow-ups.',
    icon: Shield, gradient: 'from-blue-500 to-violet-600',
    ring: 'ring-blue-300', softBg: 'bg-blue-50/60', softBorder: 'border-blue-200',
    textAccent: 'text-blue-700', badge: 'Most Popular', popular: true, cta: 'Start Professional',
    features: [
      { text: 'Unlimited job applications', strong: true },
      { text: 'AI-personalised email per role', strong: true },
      { text: 'Application status tracker' },
      { text: 'Follow-up reminder system' },
      { text: 'Resume keyword match score' },
      { text: 'Priority email delivery' },
    ],
  },
  {
    id: 'elite', name: 'Elite', price: '₹799', period: '/mo',
    tagline: 'Full career acceleration',
    description: 'Recruiter connect, AI interview coaching, and a dedicated advisor.',
    icon: Crown, gradient: 'from-violet-600 to-purple-700',
    ring: 'ring-violet-300', softBg: 'bg-violet-50/60', softBorder: 'border-violet-200',
    textAccent: 'text-violet-700', badge: 'Best Value', cta: 'Unlock Elite',
    features: [
      { text: 'Everything in Professional', strong: true },
      { text: 'Direct recruiter connect', strong: true },
      { text: 'AI interview prep coach', strong: true },
      { text: 'LinkedIn profile optimisation' },
      { text: 'Salary negotiation guide' },
      { text: 'Dedicated career advisor' },
    ],
  },
];

/* ── Plan Card ───────────────────────────────────────────── */
function PlanCard({ plan, selected, onSelect, index }: {
  plan: PricingPlan; selected: boolean; onSelect: () => void; index: number;
}) {
  const Icon = plan.icon;
  return (
    <motion.div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 select-none overflow-hidden',
        selected ? `${plan.softBorder} ${plan.softBg} shadow-xl` : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md',
      )}
      onClick={onSelect}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 240, damping: 24 }}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.975 }}>

      {/* Popular badge */}
      {plan.badge && (
        <div className={cn(
          'absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl text-[10px] font-extrabold tracking-widest uppercase text-white',
          plan.popular ? 'bg-gradient-to-r from-blue-500 to-violet-600' : 'bg-gradient-to-r from-violet-600 to-purple-700',
        )}>
          {plan.badge}
        </div>
      )}

      {/* Selection check */}
      <div className={cn(
        'absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
        selected ? `bg-gradient-to-br ${plan.gradient} border-transparent` : 'border-gray-300 bg-white',
      )}>
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>

      {/* Icon + price */}
      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br shadow-md', plan.gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div className="mb-1">
        <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{plan.name}</p>
        <p className={cn('text-[11px] font-semibold', plan.textAccent)}>{plan.tagline}</p>
      </div>
      <div className="flex items-baseline gap-0.5 mb-3">
        <span className={cn('text-[24px] font-extrabold', plan.textAccent)}>{plan.price}</span>
        {plan.period && <span className="text-[12px] text-gray-400 font-medium">{plan.period}</span>}
      </div>

      <p className="text-[11.5px] text-gray-500 leading-relaxed mb-4 flex-1">{plan.description}</p>

      {/* Features */}
      <div className="space-y-2">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br', plan.gradient)}>
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
            <span className={cn('text-[11px] leading-snug', f.strong ? 'font-semibold text-gray-800' : 'text-gray-600')}>{f.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Confirm Step ────────────────────────────────────────── */
function ConfirmStep({ plan, jobTitle, company, onConfirm, onBack }: {
  plan: PricingPlan; jobTitle?: string; company?: string;
  onConfirm: () => void; onBack: () => void;
}) {
  const Icon = plan.icon;
  const next = [
    'Your personalised email is sent to the hiring team immediately',
    'A confirmation copy lands in your inbox',
    plan.id !== 'starter' ? 'AI tracks status and sends a follow-up reminder in 5 days' : null,
    plan.id === 'elite' ? 'A career advisor reviews your application within 24 hours' : null,
  ].filter(Boolean) as string[];

  return (
    <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }} className="flex flex-col gap-5">
      {/* Plan summary card */}
      <div className={cn('rounded-2xl border-2 p-5', plan.softBorder, plan.softBg)}>
        <div className="flex items-center gap-3.5 mb-4">
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md', plan.gradient)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-extrabold text-gray-900">{plan.name} Plan</p>
            <div className="flex items-baseline gap-0.5">
              <span className={cn('text-[18px] font-extrabold', plan.textAccent)}>{plan.price}</span>
              {plan.period && <span className="text-[11px] text-gray-400">{plan.period}</span>}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-600">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-[11px] font-bold">Selected</span>
          </div>
        </div>
        {(jobTitle || company) && (
          <div className="rounded-xl bg-white/80 border border-white px-4 py-3">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Applying to</p>
            <p className="text-[13px] font-extrabold text-gray-900">{jobTitle}</p>
            {company && <p className="text-[11px] text-gray-500">{company}</p>}
          </div>
        )}
      </div>
      {/* What happens next */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">What happens next</p>
        <div className="space-y-2.5">
          {next.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 bg-gradient-to-br', plan.gradient)}>{i + 1}</span>
              <p className="text-[11.5px] text-gray-600 leading-snug">{s}</p>
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">← Back</button>
        <motion.button onClick={onConfirm}
          className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-extrabold shadow-lg bg-gradient-to-r', plan.gradient)}
          whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
          <Sparkles className="w-4 h-4" /> Confirm & Send
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Success Step ────────────────────────────────────────── */
function SuccessStep({ plan, jobTitle, onClose }: {
  plan: PricingPlan; jobTitle?: string; onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="flex flex-col items-center text-center pt-4 pb-2 gap-5">
      <motion.div
        className={cn('w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br', plan.gradient)}
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}>
        <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
      </motion.div>
      <div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-[20px] font-extrabold text-gray-900 mb-2">Application Submitted!</motion.p>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="text-[12.5px] text-gray-500 leading-relaxed max-w-[300px] mx-auto">
          Your <span className="font-bold text-gray-700">{plan.name}</span> plan application for{' '}
          <span className="font-bold text-gray-700">{jobTitle}</span> has been sent successfully.
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="w-full rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-emerald-600" fill="currentColor" />
          <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">What to expect</p>
        </div>
        <div className="space-y-1.5 text-left">
          {['Check your inbox — a copy of the email has been sent to you',
            'Most recruiters respond within 3–5 business days',
            plan.id !== 'starter' ? 'We\'ll remind you to follow up in 5 days if no reply' : null,
          ].filter(Boolean).map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-[11px] text-emerald-800 leading-snug">{t as string}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.button onClick={onClose} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[13px] font-extrabold shadow-lg shadow-emerald-500/25"
        whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}>
        Done — Track My Applications
      </motion.button>
    </motion.div>
  );
}

/* ── Main exported modal ─────────────────────────────────── */
export function ModalPricing({ open, onClose, onSelectPlan, jobTitle, company }: ModalPricingProps) {
  const [selectedId, setSelectedId] = useState('professional');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const plan = PLANS.find(p => p.id === selectedId) ?? PLANS[1];
  const handleConfirm = () => { onSelectPlan(plan); setStep('success'); };
  const handleClose   = () => { onClose(); setTimeout(() => setStep('select'), 320); };
  const stepTitle = step === 'success' ? 'Application Confirmed' : step === 'confirm' ? 'Review & Confirm' : 'Choose Your Plan';
  const stepSub   = step === 'select' ? 'Pick the right plan to submit your application' : step === 'confirm' ? 'One final review before we send' : 'Your application is on its way';

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div className="relative w-full sm:max-w-[700px] max-h-[94vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ scale: 0.94, y: 32, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 24, opacity: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Rocket className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{stepTitle}</p>
                  <p className="text-[11px] text-gray-400">{stepSub}</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === 'select' && (
                  <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
                    {(jobTitle || company) && (
                      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 px-5 py-3.5 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Applying to</p>
                          <p className="text-[13px] font-extrabold text-gray-900">{jobTitle}{company && ` · ${company}`}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      {PLANS.map((p, i) => (
                        <PlanCard key={p.id} plan={p} selected={selectedId === p.id} onSelect={() => setSelectedId(p.id)} index={i} />
                      ))}
                    </div>
                    <motion.button onClick={() => setStep('confirm')}
                      className={cn('w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white text-[14px] font-extrabold shadow-xl bg-gradient-to-r', plan.gradient)}
                      whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}>
                      Continue with {plan.name} <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    <p className="text-center text-[10px] text-gray-400 mt-3">Secure payment · Cancel anytime · No hidden charges</p>
                  </motion.div>
                )}
                {step === 'confirm' && (
                  <ConfirmStep key="confirm" plan={plan} jobTitle={jobTitle} company={company}
                    onConfirm={handleConfirm} onBack={() => setStep('select')} />
                )}
                {step === 'success' && (
                  <SuccessStep key="success" plan={plan} jobTitle={jobTitle} onClose={handleClose} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
