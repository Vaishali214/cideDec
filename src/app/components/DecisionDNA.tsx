import { motion } from 'motion/react';
import { Dna, Gauge, Shield, Brain, Crosshair, Fingerprint } from 'lucide-react';

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
export interface DecisionDNAData {
  riskLevel: 'Low' | 'Medium' | 'High';
  decisionStyle: 'Aggressive' | 'Conservative' | 'Balanced';
  industryFocus: string;
  thinkingDepth: number;
  traits: string[];
  summary: string;
}

/* ═══════════════════════════════════════════════
   GENERATOR — builds DNA from query + intelligence
═══════════════════════════════════════════════ */
export function generateDecisionDNA(
  query: string,
  domain: string,
  score: number,
  confidence: number,
): DecisionDNAData {
  const t = query.toLowerCase();
  const wCount = t.split(/\s+/).length;

  /* Risk level */
  const riskKw = /risk|danger|threat|safe|conservative|cautious/.test(t);
  const growthKw = /grow|expan|scale|aggressive|rapid|disrupt/.test(t);
  const riskLevel: DecisionDNAData['riskLevel'] =
    riskKw ? 'Low' : growthKw ? 'High' : 'Medium';

  /* Decision style */
  const decisionStyle: DecisionDNAData['decisionStyle'] =
    riskLevel === 'High' ? 'Aggressive' : riskLevel === 'Low' ? 'Conservative' : 'Balanced';

  /* Industry focus */
  const domainLabel: Record<string, string> = {
    marketing: 'Marketing & Growth',
    finance: 'Finance & Investment',
    technology: 'Technology & Innovation',
    strategy: 'Strategy & Leadership',
    risk: 'Risk & Compliance',
    general: 'General Business',
  };
  const industryFocus = domainLabel[domain] ?? 'General Business';

  /* Thinking depth */
  let thinkingDepth = Math.min(98, 25 + wCount * 4 + score * 0.4 + confidence * 0.15);
  thinkingDepth = Math.round(thinkingDepth);

  /* Traits */
  const traits: string[] = [];
  if (score >= 65) traits.push('Analytical');
  else traits.push('Intuitive');
  if (riskLevel === 'Low') traits.push('Risk-Aware');
  else if (riskLevel === 'High') traits.push('Bold');
  else traits.push('Pragmatic');
  if (/growth|revenue|market|expand/.test(t)) traits.push('Growth-Oriented');
  else if (/cost|save|optim|effic/.test(t)) traits.push('Efficiency-Driven');
  else traits.push('Insight-Seeking');

  const summary = `Your Decision DNA: ${traits.join(' + ')}`;

  return { riskLevel, decisionStyle, industryFocus, thinkingDepth, traits, summary };
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export function DecisionDNA({ dna }: { dna: DecisionDNAData }) {
  const riskColor =
    dna.riskLevel === 'High' ? 'text-black' : dna.riskLevel === 'Medium' ? 'text-zinc-600' : 'text-zinc-400';
  const riskBg =
    dna.riskLevel === 'High' ? 'bg-black text-white' : dna.riskLevel === 'Medium' ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-100 text-zinc-600';
  const styleBg =
    dna.decisionStyle === 'Aggressive' ? 'bg-black text-white' : dna.decisionStyle === 'Balanced' ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-100 text-zinc-600';

  const depthCircumference = 2 * Math.PI * 24;
  const depthOffset = depthCircumference - (dna.thinkingDepth / 100) * depthCircumference;

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white p-5 mb-6 shadow-sm"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
          <Dna className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-[14px] font-extrabold text-black tracking-tight">Decision DNA Profile</h3>
          <p className="text-[11px] text-zinc-400">Your cognitive decision-making fingerprint</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200">
          <Fingerprint className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Profile</span>
        </div>
      </div>

      {/* Attribute grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Risk-Taking Level */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className={`w-3.5 h-3.5 ${riskColor}`} />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Risk Level</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${riskBg}`}>
            {dna.riskLevel}
          </span>
        </div>

        {/* Decision Style */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Crosshair className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Style</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${styleBg}`}>
            {dna.decisionStyle}
          </span>
        </div>

        {/* Industry Focus */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Focus</span>
          </div>
          <span className="text-[12px] font-bold text-black truncate block">{dna.industryFocus}</span>
        </div>

        {/* Thinking Depth Score */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 flex items-center gap-3">
          <svg width="54" height="54" viewBox="0 0 54 54" className="shrink-0">
            <circle cx="27" cy="27" r="24" fill="none" stroke="#e4e4e7" strokeWidth="3.5" />
            <motion.circle
              cx="27" cy="27" r="24" fill="none" stroke="#000" strokeWidth="3.5"
              strokeDasharray={depthCircumference}
              strokeLinecap="round"
              transform="rotate(-90 27 27)"
              initial={{ strokeDashoffset: depthCircumference }}
              animate={{ strokeDashoffset: depthOffset }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
            <text x="27" y="31" textAnchor="middle" fontSize="13" fontWeight="800" fill="#000">
              {dna.thinkingDepth}
            </text>
          </svg>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Depth</p>
            <p className="text-[11px] font-semibold text-zinc-600">
              {dna.thinkingDepth >= 75 ? 'Deep' : dna.thinkingDepth >= 50 ? 'Moderate' : 'Surface'}
            </p>
          </div>
        </div>
      </div>

      {/* Trait tags + summary */}
      <div className="flex items-center gap-2 flex-wrap">
        <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        {dna.traits.map((trait, i) => (
          <motion.span
            key={i}
            className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08 }}
          >
            {trait}
          </motion.span>
        ))}
        <span className="text-[11px] text-zinc-400 font-medium ml-1">{dna.summary}</span>
      </div>
    </motion.div>
  );
}
