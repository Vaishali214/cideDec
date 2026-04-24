import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronRight, TrendingUp, TrendingDown, Minus, CalendarClock } from 'lucide-react';

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
export interface TimelineNode {
  label: string;
  title: string;
  positive: string[];
  negative: string[];
  netImpact: 'positive' | 'neutral' | 'negative';
  revenueChange: string;
  riskChange: string;
  narrative: string;
}

/* ═══════════════════════════════════════════════
   GENERATOR
═══════════════════════════════════════════════ */
export function generateTimeline(
  query: string,
  domain: string,
  score: number,
): TimelineNode[] {
  const t = query.toLowerCase();

  if (/roi|revenue|profit|pricing/.test(t)) {
    return [
      { label: 'Month 1', title: 'Foundation & Quick Wins', positive: ['Initial pricing model deployed; 5–7% revenue uplift observed', 'Early adopter feedback confirms product-market fit'], negative: ['Team adjustment period — productivity dips 10% during transition', 'Minor customer pushback on pricing tier restructuring'], netImpact: 'positive', revenueChange: '+5.2%', riskChange: 'Low', narrative: 'The first month is about setting foundations. Revenue begins to move upward as the new pricing strategy captures previously undervalued customer segments, though the team needs time to adapt to new processes.' },
      { label: 'Month 3', title: 'Acceleration Phase', positive: ['CAC drops 18% as optimized funnels mature', 'Cross-sell conversion jumps from 8% to 14%'], negative: ['Increased support tickets from new customer segment', 'Marketing spend up 22% to sustain growth velocity'], netImpact: 'positive', revenueChange: '+14.8%', riskChange: 'Medium', narrative: 'By month three, the growth engine is firing. Lower acquisition costs compound with better conversion, creating a powerful flywheel. However, operational costs rise as the team scales to support the influx.' },
      { label: 'Month 6', title: 'Growth Plateau & Optimization', positive: ['Revenue stabilizes at 32% above baseline', 'Unit economics reach best-in-class benchmarks'], negative: ['Market saturation signals in Tier-1 cities', 'Competitor responds with aggressive pricing — margin pressure'], netImpact: 'neutral', revenueChange: '+28.4%', riskChange: 'Medium', narrative: 'Six months in, the initial growth surge plateaus as expected. The focus shifts from expansion to optimization — squeezing efficiency from every rupee while preparing the next growth lever.' },
      { label: 'Year 1', title: 'Market Leadership Positioning', positive: ['Market share climbs to 28.3% from 24.6%', 'Brand recognition in top-3 across all segments'], negative: ['Two new competitors enter with VC-backed pricing', 'Talent retention costs increase 15% to defend key hires'], netImpact: 'positive', revenueChange: '+42.1%', riskChange: 'Medium', narrative: 'The one-year mark reveals the true compounding power of the strategy. Market position strengthens significantly, though the competitive landscape intensifies and the cost of defending that position rises.' },
      { label: 'Year 2', title: 'Sustainable Competitive Moat', positive: ['ROI exceeds 187% threshold with IRR at 34.8%', 'Customer LTV:CAC ratio reaches 14.8x', 'Rural expansion adds ₹24L/month revenue stream'], negative: ['Regulatory compliance costs increase with scale', 'Infrastructure costs grow 28% YoY requiring cloud optimization'], netImpact: 'positive', revenueChange: '+68.5%', riskChange: 'Low', narrative: 'By year two, the decision has matured into a durable competitive advantage. The numbers speak for themselves — strong returns, healthy unit economics, and a diversified revenue base that reduces concentration risk.' },
    ];
  }

  if (/market|compet|expan|share/.test(t)) {
    return [
      { label: 'Month 1', title: 'Market Intelligence Gathering', positive: ['Competitive landscape fully mapped across 12 dimensions', 'Partnership pipeline opens with 8 potential strategic allies'], negative: ['Market entry costs higher than initial estimates by 18%', 'Regulatory clearances pending in 2 target states'], netImpact: 'neutral', revenueChange: '+2.1%', riskChange: 'Medium', narrative: 'The first month is purely strategic — gathering intelligence, mapping the battlefield, and building the relationships that will fuel future expansion.' },
      { label: 'Month 3', title: 'Pilot Market Entry', positive: ['Pilot launches in 3 Tier-3 cities with 12% adoption rate', 'Local partnership model reduces distribution cost by 40%'], negative: ['Cultural adaptation requires more investment than planned', 'Initial NPS in new markets lower than core (52 vs 72)'], netImpact: 'positive', revenueChange: '+8.6%', riskChange: 'Medium', narrative: 'Three months in, the pilots are live and learning is rapid. Adoption exceeds baseline expectations, but the product needs cultural tuning to achieve parity with core market satisfaction.' },
      { label: 'Month 6', title: 'Scale & Consolidation', positive: ['Market share grows to 26.8% as expansion markets contribute', 'Brand awareness in target regions reaches 34%'], negative: ['Competitor A launches counter-expansion in our core market', 'Operational complexity increases — need 3 additional regional heads'], netImpact: 'positive', revenueChange: '+18.2%', riskChange: 'High', narrative: 'Half a year into execution, the expansion is real and measurable. But success attracts attention — competitors respond, and operational complexity becomes the biggest internal challenge.' },
      { label: 'Year 1', title: 'New Market Maturity', positive: ['Rural segment contributes 18% of total revenue', 'Customer base grows to 15,600+ across 14 states'], negative: ['3 new regulatory requirements add compliance overhead', 'Talent acquisition in expansion markets proves challenging'], netImpact: 'positive', revenueChange: '+35.4%', riskChange: 'Medium', narrative: 'The year-one milestone transforms the business from a regional player to a national presence. Revenue diversification reduces risk, even as new complexities demand more sophisticated operations.' },
      { label: 'Year 2', title: 'Dominant Market Position', positive: ['Total market share reaches 31.2%', 'SEA expansion pilot begins in Singapore and Indonesia', 'Category-defining brand position established'], negative: ['International expansion requires significant upfront investment', 'Currency risk exposure increases with cross-border revenue'], netImpact: 'positive', revenueChange: '+52.8%', riskChange: 'Medium', narrative: 'By year two, the company is not just participating in the market — it is shaping it. International expansion beckons as the domestic position solidifies into genuine market leadership.' },
    ];
  }

  /* Default / generic timeline */
  return [
    { label: 'Month 1', title: 'Initial Implementation', positive: ['Strategy framework deployed across core functions', 'Early alignment achieved — team buy-in at 84%'], negative: ['Short-term productivity dip during onboarding phase', 'Budget reallocation causes temporary project delays'], netImpact: 'neutral', revenueChange: '+3.1%', riskChange: 'Low', narrative: 'The first month establishes the foundation. Change management begins, and while the numbers are modest, the organizational alignment sets the stage for compounding returns.' },
    { label: 'Month 3', title: 'Momentum Building', positive: ['Key metrics show consistent upward trend', 'Process automation reduces manual effort by 35%'], negative: ['Integration challenges with legacy systems surface', 'Change fatigue begins in operations team'], netImpact: 'positive', revenueChange: '+11.4%', riskChange: 'Medium', narrative: 'Quarter one closes with visible momentum. The strategy is proving out in measurable ways, though organizational friction reminds us that transformation is never purely linear.' },
    { label: 'Month 6', title: 'Inflection Point', positive: ['ROI crosses positive territory — net value creation begins', 'Customer satisfaction scores improve by 12 points'], negative: ['Competitive response requires strategy adjustment', 'Technology upgrade needed to sustain growth trajectory'], netImpact: 'positive', revenueChange: '+22.6%', riskChange: 'Medium', narrative: 'The six-month inflection point is where strategy becomes reality. Returns go positive, customer impact is tangible, and the path forward becomes clearer — even as new challenges emerge.' },
    { label: 'Year 1', title: 'Validated Success', positive: ['All primary KPIs exceed baseline targets by 15–30%', 'Organizational capability permanently elevated'], negative: ['Next phase investment required to maintain trajectory', 'Market dynamics shift — strategy refresh needed'], netImpact: 'positive', revenueChange: '+38.2%', riskChange: 'Low', narrative: 'One year later, the verdict is clear: the decision was sound. The organization is stronger, the numbers are compelling, and the foundation for the next phase of growth is in place.' },
    { label: 'Year 2', title: 'Compounding Returns', positive: ['Sustainable competitive advantage established', 'Revenue growth trajectory becomes self-reinforcing', 'Team capabilities attract top-tier talent'], negative: ['Complexity of operations increases with scale', 'New strategic decisions required for next horizon'], netImpact: 'positive', revenueChange: '+56.7%', riskChange: 'Low', narrative: 'Year two reveals the true power of compounding decisions. Each improvement feeds the next, creating a virtuous cycle that transforms incremental gains into structural advantage.' },
  ];
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export function DecisionTimeline({ nodes }: { nodes: TimelineNode[] }) {
  const [active, setActive] = useState(0);
  const n = nodes[active];

  return (
    <motion.div
      className="rounded-2xl border border-zinc-200 bg-white mb-6 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 24 }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
            <CalendarClock className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-extrabold text-black tracking-tight">Decision Consequence Timeline</h3>
            <p className="text-[11px] text-zinc-400">How this decision unfolds over time</p>
          </div>
        </div>

        {/* Timeline nodes */}
        <div className="relative flex items-center justify-between px-2">
          {/* Connector line */}
          <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-zinc-200 -translate-y-1/2" />
          <motion.div
            className="absolute top-1/2 left-4 h-[2px] bg-black -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{ width: `${(active / (nodes.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ maxWidth: 'calc(100% - 32px)' }}
          />

          {nodes.map((node, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                className="relative z-10 flex flex-col items-center gap-1.5 group"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-black border-black text-white shadow-lg shadow-zinc-400/30'
                      : isPast
                        ? 'bg-zinc-800 border-zinc-800 text-white'
                        : 'bg-white border-zinc-300 text-zinc-400 group-hover:border-zinc-500'
                  }`}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={isActive ? { duration: 0.4 } : {}}
                >
                  {isPast ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </motion.div>
                <span className={`text-[10px] font-bold whitespace-nowrap transition-colors ${
                  isActive ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-600'
                }`}>
                  {node.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active node detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="border-t border-zinc-100 px-5 py-5"
        >
          {/* Title + impact badges */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h4 className="text-[14px] font-extrabold text-black">{n.title}</h4>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                n.netImpact === 'positive' ? 'bg-zinc-900 text-white' :
                n.netImpact === 'negative' ? 'bg-zinc-200 text-zinc-700' :
                'bg-zinc-100 text-zinc-600'
              }`}>
                {n.netImpact === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                 n.netImpact === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {n.revenueChange} Revenue
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                n.riskChange === 'High' ? 'bg-zinc-300 text-zinc-800' :
                n.riskChange === 'Medium' ? 'bg-zinc-100 text-zinc-600' :
                'bg-zinc-50 text-zinc-500'
              }`}>
                {n.riskChange} Risk
              </span>
            </div>
          </div>

          {/* Narrative */}
          <p className="text-[13px] text-zinc-600 leading-relaxed mb-4 border-l-2 border-zinc-200 pl-4 italic">
            {n.narrative}
          </p>

          {/* Positive & Negative effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Positive Effects</p>
              <ul className="space-y-2">
                {n.positive.map((p, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-zinc-700 leading-snug"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-2.5 h-2.5 text-white" />
                    </div>
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Potential Risks</p>
              <ul className="space-y-2">
                {n.negative.map((ng, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-zinc-500 leading-snug"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingDown className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    {ng}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
