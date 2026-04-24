import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Heart, AlertTriangle, ChevronDown, ChevronUp,
  Zap, Eye, Scale, ShieldAlert, TrendingUp, Users,
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
export interface AIThinking {
  title: string;
  points: string[];
  confidence: number;
  dataPoints: string[];
}
export interface HumanThinking {
  title: string;
  points: string[];
  concerns: string[];
  emotionalFactors: string[];
}
export interface ThinkingConflict {
  aiPosition: string;
  humanPosition: string;
  severity: 'low' | 'medium' | 'high';
}
export interface AIvsHumanData {
  ai: AIThinking;
  human: HumanThinking;
  conflicts: ThinkingConflict[];
  trustMeter: { aiScore: number; humanScore: number; verdict: string };
}

/* ═══════════════════════════════════════════════
   GENERATOR
═══════════════════════════════════════════════ */
export function generateAIvsHuman(
  query: string,
  domain: string,
  score: number,
  confidence: number,
): AIvsHumanData {
  const t = query.toLowerCase();

  /* AI side — data-driven */
  const aiTitle = score >= 65 ? 'Optimized Strategy Path' : score >= 40 ? 'Data-Informed Direction' : 'Preliminary Suggestion';
  const aiPoints: string[] = [];
  const aiDataPoints: string[] = [];
  if (/roi|revenue|profit/.test(t)) {
    aiPoints.push('Deploy pricing optimization to capture 12–15% additional margin');
    aiPoints.push('Allocate 60% of budget to highest-performing channels based on ROAS data');
    aiPoints.push('Automate top-of-funnel qualification to reduce CAC by estimated 28%');
    aiDataPoints.push('Historical ROAS: 4.2x on digital channels');
    aiDataPoints.push('Price elasticity coefficient: -0.34 (inelastic)');
  } else if (/market|compet|share/.test(t)) {
    aiPoints.push('Expand into Tier 3–4 markets where TAM shows ₹180Cr untapped potential');
    aiPoints.push('Invest in product differentiation features to widen NPS gap vs competitors');
    aiPoints.push('Pursue strategic acquisition of DataFlow B to consolidate 43% market share');
    aiDataPoints.push('Market CAGR: 22.4% YoY');
    aiDataPoints.push('Competitor NPS gap: +14 points advantage');
  } else if (/risk|threat|safe/.test(t)) {
    aiPoints.push('Diversify client base to reduce top-3 dependency below 25% of revenue');
    aiPoints.push('Implement predictive churn model to flag 340 at-risk accounts proactively');
    aiPoints.push('Build 6-month cash reserve buffer to handle market downturn scenarios');
    aiDataPoints.push('Current concentration: 38% in top 3 clients');
    aiDataPoints.push('Cash runway: 14.2 months at current burn rate');
  } else {
    aiPoints.push('Prioritize initiatives with highest confidence-weighted ROI projection');
    aiPoints.push('Focus investment on proven channels with measurable 90-day outcomes');
    aiPoints.push('Implement A/B testing framework to validate assumptions before scaling');
    aiDataPoints.push('Average initiative success rate: 67% with data-driven planning');
    aiDataPoints.push('Payback threshold: 11 months average');
  }

  /* Human side — intuitive */
  const humanTitle = 'Intuitive & Contextual Considerations';
  const humanPoints: string[] = [];
  const humanConcerns: string[] = [];
  const humanEmotional: string[] = [];
  if (/roi|revenue|profit/.test(t)) {
    humanPoints.push('Team morale may drop if cost-cutting is perceived as aggressive');
    humanPoints.push('Customer relationships built over years could be strained by pricing changes');
    humanConcerns.push('Are we sacrificing long-term trust for short-term numbers?');
    humanEmotional.push('Fear of alienating loyal early adopters');
    humanEmotional.push('Excitement about growth potential if executed with empathy');
  } else if (/market|compet|share/.test(t)) {
    humanPoints.push('Rural market expansion requires cultural sensitivity and local partnerships');
    humanPoints.push('Acquisitions disrupt company culture — integration risk is often underestimated');
    humanConcerns.push('Are we expanding too fast without solidifying our core?');
    humanEmotional.push('Ambition to be market leader vs. fear of overextension');
    humanEmotional.push('Pride in organic growth vs. pressure to acquire');
  } else if (/risk|threat|safe/.test(t)) {
    humanPoints.push('Key employees may leave if they sense organizational instability');
    humanPoints.push('Risk-averse posture might signal weakness to investors and partners');
    humanConcerns.push('Is our risk tolerance calibrated to our actual position?');
    humanEmotional.push('Anxiety about unknown market shifts');
    humanEmotional.push('Desire for stability vs. need for calculated risks');
  } else {
    humanPoints.push('Gut feeling from experienced leaders often captures patterns data misses');
    humanPoints.push('Team chemistry and timing are intangible factors algorithms overlook');
    humanConcerns.push('Are we over-relying on data at the expense of human judgment?');
    humanEmotional.push('Confidence from past successes informing instinctive direction');
    humanEmotional.push('Unease about decisions that feel right on paper but wrong in practice');
  }

  /* Conflicts */
  const conflicts: ThinkingConflict[] = [
    {
      aiPosition: aiPoints[0],
      humanPosition: humanPoints[0],
      severity: score >= 65 ? 'low' : score >= 40 ? 'medium' : 'high',
    },
  ];
  if (aiPoints.length > 1 && humanConcerns.length > 0) {
    conflicts.push({
      aiPosition: aiPoints[1],
      humanPosition: humanConcerns[0],
      severity: 'medium',
    });
  }

  /* Trust meter */
  const aiScore = Math.min(98, 30 + score * 0.5 + confidence * 0.25);
  const humanScore = Math.min(98, 70 - score * 0.15 + (100 - confidence) * 0.3);
  const verdict =
    aiScore > humanScore + 15
      ? 'Data-driven approach is more reliable for this query'
      : humanScore > aiScore + 15
        ? 'Human intuition adds critical context here'
        : 'Both perspectives are equally valuable — combine them';

  return {
    ai: { title: aiTitle, points: aiPoints, confidence: Math.round(aiScore), dataPoints: aiDataPoints },
    human: { title: humanTitle, points: humanPoints, concerns: humanConcerns, emotionalFactors: humanEmotional },
    conflicts,
    trustMeter: { aiScore: Math.round(aiScore), humanScore: Math.round(humanScore), verdict },
  };
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export function AIvsHumanThinking({ data }: { data: AIvsHumanData }) {
  const [expandAI, setExpandAI] = useState(false);
  const [expandHuman, setExpandHuman] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  const totalTrust = data.trustMeter.aiScore + data.trustMeter.humanScore;
  const aiPct = Math.round((data.trustMeter.aiScore / totalTrust) * 100);

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white mb-6 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 24 }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
            <Scale className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-extrabold text-black tracking-tight">AI vs Human Thinking</h3>
            <p className="text-[11px] text-zinc-400">Compare data-driven and intuitive reasoning</p>
          </div>
        </div>

        {/* Trust meter bar */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] font-bold text-zinc-500">{data.trustMeter.aiScore}%</span>
          </div>
          <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${aiPct}%` }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500">{data.trustMeter.humanScore}%</span>
            <Heart className="w-3 h-3 text-zinc-600" />
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 text-center mt-1.5 font-medium">{data.trustMeter.verdict}</p>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
        {/* AI Side */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-extrabold text-black">{data.ai.title}</p>
              <p className="text-[10px] text-zinc-400 font-medium">AI confidence: {data.ai.confidence}%</p>
            </div>
          </div>
          <ul className="space-y-2 mb-3">
            {data.ai.points.map((p, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-[12px] text-zinc-700 leading-snug"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <TrendingUp className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                {p}
              </motion.li>
            ))}
          </ul>
          <AnimatePresence>
            {expandAI && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Supporting Data</p>
                {data.ai.dataPoints.map((dp, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
                    <Zap className="w-3 h-3 text-zinc-300" />
                    {dp}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setExpandAI(v => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-600 transition-colors mt-1"
          >
            {expandAI ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expandAI ? 'Collapse' : 'Show data'}
          </button>
        </div>

        {/* Human Side */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-200 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-zinc-700" />
            </div>
            <div>
              <p className="text-[12px] font-extrabold text-black">{data.human.title}</p>
              <p className="text-[10px] text-zinc-400 font-medium">Experiential reasoning</p>
            </div>
          </div>
          <ul className="space-y-2 mb-3">
            {data.human.points.map((p, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-[12px] text-zinc-700 leading-snug"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Users className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                {p}
              </motion.li>
            ))}
          </ul>
          <AnimatePresence>
            {expandHuman && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Emotional Factors</p>
                {data.human.emotionalFactors.map((ef, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
                    <Eye className="w-3 h-3 text-zinc-300" />
                    {ef}
                  </div>
                ))}
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-3 mb-2">Key Concerns</p>
                {data.human.concerns.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5 italic">
                    <ShieldAlert className="w-3 h-3 text-zinc-300" />
                    {c}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setExpandHuman(v => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-600 transition-colors mt-1"
          >
            {expandHuman ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expandHuman ? 'Collapse' : 'Show concerns'}
          </button>
        </div>
      </div>

      {/* Conflict detection layer */}
      <div className="border-t border-zinc-100">
        <button
          onClick={() => setShowConflicts(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-bold text-zinc-600">
              {data.conflicts.length} Conflict{data.conflicts.length !== 1 ? 's' : ''} Detected
            </span>
          </div>
          {showConflicts ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </button>
        <AnimatePresence>
          {showConflicts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-3">
                {data.conflicts.map((c, i) => (
                  <motion.div
                    key={i}
                    className={`rounded-xl p-3 border ${
                      c.severity === 'high' ? 'bg-zinc-100 border-zinc-300' :
                      c.severity === 'medium' ? 'bg-zinc-50 border-zinc-200' :
                      'bg-white border-zinc-100'
                    }`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.severity === 'high' ? 'bg-black text-white' :
                        c.severity === 'medium' ? 'bg-zinc-300 text-zinc-700' :
                        'bg-zinc-100 text-zinc-500'
                      }`}>
                        {c.severity}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <Cpu className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-600">{c.aiPosition}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Heart className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-600">{c.humanPosition}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
