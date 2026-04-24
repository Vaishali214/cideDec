/* ═══════════════════════════════════════════════════════════════
   ApplyNowModal.tsx  ·  /components/ApplyNowModal.tsx
   Professional apply workflow:
     1. Editable email template (inline editor, copy button)
     2. "View Application Options" collapsible  
     3. Apply Now → opens ModalPricing  (3-step plan selector)
═══════════════════════════════════════════════════════════════ */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, ChevronDown, Send, Copy, Check,
  Sparkles, Pencil, ExternalLink, Building2,
  MapPin, DollarSign, BookOpen, ArrowUpRight,
  Shield, Info, Briefcase,
} from 'lucide-react';
import { ModalPricing, type PricingPlan } from './ui/modal-pricing';

/* ── Types ───────────────────────────────────────────────── */
interface ApplyNowModalProps {
  open: boolean; onClose: () => void;
  jobTitle: string; company: string;
  location: string; salaryRange: string; domain: string;
  candidateName?: string; candidateRole?: string;
  candidateSkills?: string[];
}

/* ── Email template builder ──────────────────────────────── */
function makeEmail(p: {
  jobTitle: string; company: string; location: string;
  name: string; role: string; skills: string[];
}) {
  const s1 = p.skills[0] ?? 'strategic analysis';
  const s2 = p.skills[1] ?? 'data-driven decision-making';
  const skillList = p.skills.slice(0, 3).join(', ');
  return {
    subject: `Application for ${p.jobTitle} — ${p.name}`,
    body:
`Dear Hiring Manager,

I am writing to express my strong interest in the ${p.jobTitle} position at ${p.company} (${p.location}).

As a ${p.role} with hands-on experience in ${skillList}, I have consistently delivered results across cross-functional teams and fast-paced environments. I am confident in my ability to bring measurable value to ${p.company}'s goals from day one.

What draws me to this particular role is the opportunity to apply my expertise in ${s1} within a forward-thinking organisation like ${p.company}. I thrive at the intersection of ${s2} and real-world business impact — making this position an exceptional fit for both my background and my ambitions.

I have attached my updated resume for your review and would welcome the opportunity to discuss how my experience aligns with the team's objectives.

Thank you sincerely for your time and consideration. I look forward to the possibility of contributing to ${p.company}.

Warm regards,
${p.name}
${p.role}`,
  };
}

/* ── Email Editor Panel ──────────────────────────────────── */
function EmailEditor({ subject, body, onSubjectChange, onBodyChange, copied, onCopy }: {
  subject: string; body: string;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  copied: boolean; onCopy: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = taRef.current.scrollHeight + 'px';
    }
  }, [body]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-blue-600" />
          <span className="text-[12px] font-extrabold text-gray-700 tracking-tight">Application Email Draft</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
            <Pencil className="w-2.5 h-2.5" /> Click to edit
          </span>
        </div>
        <motion.button onClick={onCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
          whileTap={{ scale: 0.96 }}>
          {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy email</>}
        </motion.button>
      </div>

      {/* To / Subject */}
      <div className="divide-y divide-gray-100 border-b border-gray-100">
        <div className="flex items-center gap-3 px-5 py-2.5">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 shrink-0">To</span>
          <span className="text-[12.5px] text-gray-400 italic">hiring@{'{company email}'}</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 shrink-0">Subject</span>
          <input value={subject} onChange={e => onSubjectChange(e.target.value)}
            className="flex-1 text-[13px] font-semibold text-gray-800 bg-transparent outline-none focus:bg-blue-50/40 rounded-lg px-2 py-1 transition-colors" />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-2">
        <textarea ref={taRef} value={body} onChange={e => onBodyChange(e.target.value)}
          className="w-full text-[12.5px] text-gray-700 bg-transparent outline-none resize-none leading-relaxed focus:bg-blue-50/20 rounded-xl px-3 py-2 transition-colors font-mono min-h-[220px]" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-5 pb-4">
        <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
        <p className="text-[10px] text-gray-400">AI-generated · Personalise freely · Auto-filled from your resume</p>
      </div>
    </div>
  );
}

/* ── Application Options (collapsible) ───────────────────── */
function ApplicationOptions({ onOpenPricing }: { onOpenPricing: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
      className="mt-3 space-y-2.5">

      {/* Option 1: Send via platform */}
      <div className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <Send className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900">Send via DecisionAI Platform</p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Submit directly with tracking, follow-up reminders, and AI personalisation per role.</p>
        </div>
        <motion.button onClick={onOpenPricing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white text-[12px] font-extrabold shadow-lg shadow-blue-500/25 shrink-0 whitespace-nowrap"
          whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
          Apply Now <Sparkles className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Option 2: Manual */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <ExternalLink className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900">Copy & Apply Manually</p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Copy the email above, paste into Gmail or Outlook, and send it yourself to the recruiter.</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">Free</span>
      </div>

      {/* Option 3: Job board */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shrink-0 shadow-md">
          <ArrowUpRight className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-gray-900">Apply on Job Board</p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Go directly to LinkedIn, Naukri, or the company careers page to submit your resume.</p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 shrink-0">External</span>
      </div>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <Shield className="w-3 h-3 text-gray-400" />
        <p className="text-[10px] text-gray-400">All data encrypted · Never shared without consent</p>
      </div>
    </motion.div>
  );
}

/* ── Main exported component ─────────────────────────────── */
export function ApplyNowModal({
  open, onClose,
  jobTitle, company, location, salaryRange, domain,
  candidateName  = 'Your Name',
  candidateRole  = 'Business Analyst',
  candidateSkills = ['Strategic Thinking', 'Data Analysis', 'Stakeholder Management'],
}: ApplyNowModalProps) {
  const email = makeEmail({
    jobTitle, company, location,
    name: candidateName, role: candidateRole, skills: candidateSkills,
  });

  const [subject,     setSubject]     = useState(email.subject);
  const [body,        setBody]        = useState(email.body);
  const [copied,      setCopied]      = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [appliedPlan, setAppliedPlan] = useState<PricingPlan | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2400);
    });
  }, [subject, body]);

  const handleSelectPlan = useCallback((plan: PricingPlan) => {
    setAppliedPlan(plan); setPricingOpen(false);
  }, []);

  const metaItems = [
    { icon: Briefcase,  label: 'Role',     value: jobTitle  },
    { icon: Building2,  label: 'Company',  value: company   },
    { icon: MapPin,     label: 'Location', value: location  },
    { icon: DollarSign, label: 'Salary',   value: salaryRange },
    { icon: BookOpen,   label: 'Domain',   value: domain    },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[990] flex items-end sm:items-center justify-center sm:p-4 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
              className="relative w-full sm:max-w-[640px] max-h-[94vh] flex flex-col bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.94, y: 28, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}>

              {/* ── Dark header ── */}
              <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-violet-950 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Send className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold text-white leading-tight">Apply Now</p>
                    <p className="text-[11px] text-white/50 truncate max-w-[300px]">{jobTitle} · {company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {salaryRange && (
                    <span className="hidden sm:flex items-center px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                      {salaryRange}
                    </span>
                  )}
                  <button onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Job meta strip ── */}
              <div className="flex items-center gap-0 overflow-x-auto shrink-0 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-violet-50/30 scrollbar-none">
                {metaItems.map((m, i) => {
                  const MIcon = m.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5 px-4 py-2.5 border-r border-gray-200/60 last:border-r-0 shrink-0">
                      <MIcon className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0">{m.label}</span>
                      <span className="text-[11px] font-bold text-gray-700 ml-0.5 truncate max-w-[100px]">{m.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* ── Success banner ── */}
              <AnimatePresence>
                {appliedPlan && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="shrink-0">
                    <div className="flex items-center gap-3 mx-5 mt-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-[12px] font-bold text-emerald-800">
                        ✓ Application sent via <span className="text-emerald-700">{appliedPlan.name}</span> — check your inbox for confirmation.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-none">

                {/* Intro tip */}
                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-blue-800 leading-relaxed">
                    Below is your pre-written professional application email.{' '}
                    <span className="font-semibold">Click any field to personalise it</span> before sending — subject, greeting, skills, and closing are all editable.
                  </p>
                </div>

                {/* Email editor */}
                <EmailEditor
                  subject={subject} body={body}
                  onSubjectChange={setSubject} onBodyChange={setBody}
                  copied={copied} onCopy={handleCopy} />

                {/* Collapsible application options */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOptionsOpen(v => !v)}
                    className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${optionsOpen ? 'bg-blue-50/60 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${optionsOpen ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Send className={`w-3.5 h-3.5 ${optionsOpen ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-extrabold">View Application Options</p>
                        <p className={`text-[10.5px] ${optionsOpen ? 'text-blue-500' : 'text-gray-400'}`}>
                          {optionsOpen ? 'Choose how to submit your application' : 'Send via platform, copy manually, or go to job board'}
                        </p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: optionsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className={`w-4 h-4 ${optionsOpen ? 'text-blue-600' : 'text-gray-400'}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {optionsOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        transition={{ duration: 0.24 }} className="overflow-hidden border-t border-gray-100">
                        <div className="p-4">
                          <ApplicationOptions onOpenPricing={() => setPricingOpen(true)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-5 py-3 shrink-0 border-t border-gray-100 bg-gray-50/60">
                <p className="text-center text-[10px] text-gray-400">
                  Your personal information is never shared without your explicit consent · All sessions are encrypted
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing modal — separate z-layer above apply modal */}
      <ModalPricing
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onSelectPlan={handleSelectPlan}
        jobTitle={jobTitle}
        company={company}
      />
    </>
  );
}
