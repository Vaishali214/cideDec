import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Zap, TrendingUp, AlertTriangle, CheckCircle2, Target,
  BarChart3, DollarSign, ArrowRight, Lightbulb, Shield, Star,
  Activity, RefreshCw, ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import type { Page } from '../App';

const forecastChartData = [
  { month: 'Jan', revenue: 28 }, { month: 'Feb', revenue: 31 }, { month: 'Mar', revenue: 35 },
  { month: 'Apr', revenue: 38 }, { month: 'May', revenue: 42 }, { month: 'Jun', revenue: 48 },
  { month: 'Jul', predicted: 52 }, { month: 'Aug', predicted: 57 }, { month: 'Sep', predicted: 62 },
  { month: 'Oct', predicted: 67 }, { month: 'Nov', predicted: 74 }, { month: 'Dec', predicted: 82 },
];

const radarData = [
  { metric: 'Revenue', score: 84 }, { metric: 'Growth', score: 91 },
  { metric: 'Market Pos', score: 78 }, { metric: 'Innovation', score: 78 },
  { metric: 'Risk Mgmt', score: 72 }, { metric: 'Operations', score: 82 },
];

interface AIInsightsProps { onNavigate: (page: Page) => void; }

const riskFactors = [
  { factor: 'Market Saturation Risk', score: 42, level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400', description: 'Competitive pressure increasing but differentiation holds' },
  { factor: 'Financial Liquidity Risk', score: 18, level: 'Low', color: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-500', description: 'Strong cash reserves, current ratio 2.8x well above threshold' },
  { factor: 'Regulatory Compliance Risk', score: 55, level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400', description: 'Fintech regulations evolving; legal team tracking changes' },
  { factor: 'Technology Disruption Risk', score: 31, level: 'Low-Mod', color: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-400', description: 'Active R&D investment mitigates obsolescence risk' },
  { factor: 'Talent Retention Risk', score: 62, level: 'High', color: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-400', description: 'AI/ML talent market highly competitive; compensation review needed' },
  { factor: 'Customer Concentration Risk', score: 47, level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500', description: 'Top 3 clients = 38% revenue; diversification in progress' },
];

const aiRecommendations = [
  {
    id: 'rec1',
    priority: 'Critical',
    category: 'Growth',
    title: 'Accelerate Rural Market Expansion',
    summary: 'AI analysis identifies ₹180Cr untapped opportunity in Tier 3–4 markets with 34% lower CAC potential.',
    details: [
      'Deploy lightweight mobile-first product variant for low-bandwidth regions',
      'Partner with Jan Dhan Yojana network (4.2Cr+ accounts) for distribution',
      'Localize in 8 regional languages for 3x adoption improvement',
      'Estimated revenue uplift: ₹24–38L/month within 18 months',
    ],
    impact: '+₹38L/mo',
    confidence: 87,
    timeframe: '12–18 months',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    id: 'rec2',
    priority: 'High',
    category: 'Retention',
    title: 'Implement Predictive Churn Prevention',
    summary: 'ML model identifies 340 high-risk accounts (churn probability >70%). Proactive intervention can recover ₹12.4L ARR.',
    details: [
      'Deploy real-time churn scoring on all 12,840 active accounts',
      'Auto-trigger personalized success manager outreach at score >65',
      'Introduce loyalty rewards for accounts >24 months tenure',
      'Estimated churn reduction: 2.1pp saving ₹12.4L ARR annually',
    ],
    impact: '+₹12.4L ARR',
    confidence: 91,
    timeframe: '3–6 months',
    icon: Shield,
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    id: 'rec3',
    priority: 'High',
    category: 'Pricing',
    title: 'Dynamic Pricing Optimization',
    summary: 'Price elasticity model suggests 12–15% upward price adjustment in enterprise tier with <3% volume loss.',
    details: [
      'Enterprise tier underpriced vs market by avg 14.2% (competitor analysis)',
      'Value-based pricing model supports ₹42,000 → ₹48,000 ACV increase',
      'Bundle advanced analytics features to justify premium positioning',
      'Projected net revenue gain: ₹8.2L/month with 97% volume retention',
    ],
    impact: '+₹8.2L/mo',
    confidence: 79,
    timeframe: '1–3 months',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-700',
  },
  {
    id: 'rec4',
    priority: 'Medium',
    category: 'Operations',
    title: 'Infrastructure Cost Optimization',
    summary: 'Cloud spend analysis reveals 28% over-provisioning. AI-driven auto-scaling can reduce infra costs by ₹4.8L/month.',
    details: [
      'Migrate 40% of workloads to spot/preemptible instances (85% cost saving)',
      'Implement intelligent auto-scaling with predictive load forecasting',
      'Consolidate 3 redundant data pipelines into unified streaming architecture',
      'Projected monthly savings: ₹4.8–6.2L with zero performance impact',
    ],
    impact: '-₹4.8L cost',
    confidence: 84,
    timeframe: '2–4 months',
    icon: Zap,
    gradient: 'from-orange-500 to-red-600',
  },
];

const trendForecasts = [
  { label: 'Q3 2024 Revenue', forecast: '₹52.4L', confidence: 88, direction: 'up', basis: 'Seasonal uplift + pipeline deals' },
  { label: 'Q4 2024 Revenue', forecast: '₹61.8L', confidence: 82, direction: 'up', basis: 'Enterprise renewals + new verticals' },
  { label: 'Market Share Q4', forecast: '27.2%', confidence: 74, direction: 'up', basis: 'Competitor stagnation + our growth' },
  { label: 'Customer Count EOY', forecast: '15,600+', confidence: 86, direction: 'up', basis: 'Rural expansion + referral program' },
];

const overallScore = {
  viability: 84,
  growth: 91,
  risk: 38,
  innovation: 78,
};

export function AIInsights({ onNavigate }: AIInsightsProps) {
  const [expandedRec, setExpandedRec] = useState<string | null>('rec1');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'risk' | 'forecast' | 'conclusion'>('recommendations');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-start justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights Engine</h1>
              <p className="text-sm text-gray-500">Intelligent analysis • Risk scoring • Strategic recommendations</p>
            </div>
          </div>
          <motion.div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700 font-medium">AI Engine Active</span>
          </motion.div>
        </motion.div>

        {/* Overall Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Business Viability', value: overallScore.viability, suffix: '/100', color: 'from-blue-500 to-blue-700', ring: 'ring-blue-200', icon: CheckCircle2, verdict: 'Strong' },
            { label: 'Growth Potential', value: overallScore.growth, suffix: '/100', color: 'from-green-500 to-emerald-700', ring: 'ring-green-200', icon: TrendingUp, verdict: 'Excellent' },
            { label: 'Risk Score', value: overallScore.risk, suffix: '/100', color: 'from-amber-500 to-orange-600', ring: 'ring-amber-200', icon: AlertTriangle, verdict: 'Moderate' },
            { label: 'Innovation Index', value: overallScore.innovation, suffix: '/100', color: 'from-purple-500 to-indigo-600', ring: 'ring-purple-200', icon: Lightbulb, verdict: 'High' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} className={`bg-white/90 rounded-2xl p-5 border shadow-lg ring-2 ${item.ring}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }}>
                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${item.color} mb-3`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <motion.span className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                    {item.value}
                  </motion.span>
                  <span className="text-sm text-gray-400 mb-1">{item.suffix}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`} initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }} />
                </div>
                <p className={`text-xs font-semibold mt-1.5 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.verdict}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'recommendations', label: 'AI Recommendations', icon: Brain },
            { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
            { id: 'forecast', label: 'Trend Forecast', icon: Activity },
            { id: 'conclusion', label: 'Conclusion', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Icon className="w-4 h-4" />{tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* AI Recommendations */}
        <AnimatePresence mode="wait">
          {activeTab === 'recommendations' && (
            <motion.div key="recs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {aiRecommendations.map((rec, i) => {
                const Icon = rec.icon;
                const isOpen = expandedRec === rec.id;
                return (
                  <motion.div key={rec.id} className="bg-white/90 rounded-2xl border border-white/60 shadow-lg overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="p-5 cursor-pointer" onClick={() => setExpandedRec(isOpen ? null : rec.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${rec.gradient} shadow-md shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rec.priority === 'Critical' ? 'bg-red-100 text-red-700' : rec.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {rec.priority}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{rec.category}</span>
                              <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">{rec.impact}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base mb-1">{rec.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{rec.summary}</p>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">AI Confidence</p>
                            <p className="text-lg font-bold text-gray-900">{rec.confidence}%</p>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-gray-100">
                          <div className="p-5 pt-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />Action Steps</h4>
                              <div className="space-y-2">
                                {rec.details.map((d, j) => (
                                  <motion.div key={j} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.07 }}>
                                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${rec.gradient} text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold`}>{j + 1}</span>
                                    {d}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Timeframe: <strong>{rec.timeframe}</strong></span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-400 mb-1">Confidence Level</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <motion.div className={`h-2 rounded-full bg-gradient-to-r ${rec.gradient}`} initial={{ width: 0 }} animate={{ width: `${rec.confidence}%` }} transition={{ duration: 0.6 }} />
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">{rec.confidence}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Risk Analysis */}
          {activeTab === 'risk' && (
            <motion.div key="risk" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white/90 rounded-2xl p-6 border border-white/60 shadow-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900 text-lg">Composite Risk Dashboard</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">AI-powered risk assessment across 6 critical dimensions. Overall risk score: <strong className="text-amber-700">42/100 — Manageable</strong></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {riskFactors.map((r, i) => (
                    <motion.div key={i} className={`p-4 rounded-xl ${r.bg} border border-white/60`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-800">{r.factor}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.bg} ${r.color} border border-current/20`}>{r.level}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-white/60 rounded-full h-2.5">
                          <motion.div className={`h-2.5 rounded-full ${r.bar}`} initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} />
                        </div>
                        <span className={`text-sm font-bold ${r.color}`}>{r.score}</span>
                      </div>
                      <p className="text-xs text-gray-600">{r.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-amber-600" />Risk Mitigation Summary</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {['Talent risk is the #1 priority — initiate ESOP revision and competitive benchmarking Q3 2024', 'Regulatory risk requires dedicated compliance officer hire and legal tech investment', 'Customer concentration improving — 3 new enterprise deals in pipeline reduces dependency to ~28%', 'Overall risk profile is manageable and declining; no existential threats identified'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-1">→</span>{item}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Trend Forecast */}
          {activeTab === 'forecast' && (
            <motion.div key="forecast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white/90 rounded-2xl p-6 border border-white/60 shadow-lg mb-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-5 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600" />Predictive Trend Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {trendForecasts.map((t, i) => (
                    <motion.div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-500 font-medium">{t.label}</p>
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">↑ Up</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{t.forecast}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{t.basis}</p>
                        <span className="text-xs font-bold text-indigo-700">{t.confidence}% conf.</span>
                      </div>
                      <div className="mt-2 w-full bg-white/60 rounded-full h-1.5">
                        <motion.div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" initial={{ width: 0 }} animate={{ width: `${t.confidence}%` }} transition={{ delay: 0.4 + i * 0.1 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Predictive curve visualization */}
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">12-Month Revenue Projection Curve</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-end gap-1.5 h-32">
                    {[28, 31, 35, 38, 42, 48, 52, 57, 62, 67, 74, 82].map((v, i) => {
                      const isPredicted = i >= 6;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div className={`w-full rounded-t-sm ${isPredicted ? 'bg-gradient-to-t from-purple-300 to-purple-400 opacity-75 border border-dashed border-purple-400' : 'bg-gradient-to-t from-indigo-500 to-blue-400'}`}
                            initial={{ height: 0 }} animate={{ height: `${(v / 82) * 110}px` }} transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 80 }} />
                          <span className="text-xs text-gray-400">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-indigo-500 inline-block" />Actual</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-purple-300 border border-dashed border-purple-400 inline-block" />Predicted (AI)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Conclusion */}
          {activeTab === 'conclusion' && (
            <motion.div key="conclusion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-7 h-7 text-yellow-300" />
                  <h3 className="text-2xl font-bold">Strategic Conclusion & Verdict</h3>
                </div>
                <p className="text-indigo-100 text-base leading-relaxed mb-6">
                  Based on comprehensive analysis across market, financial, feasibility, risk, and competitive dimensions, 
                  the business demonstrates <strong className="text-white">strong viability with exceptional growth trajectory</strong>. 
                  The combination of 22.1% net margins, 18.3% revenue growth, 72 NPS, and manageable risk profile 
                  positions the company favorably for the next growth phase.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Viability', value: '84/100', verdict: 'STRONG' },
                    { label: 'Growth', value: '91/100', verdict: 'EXCELLENT' },
                    { label: 'Risk', value: '38/100', verdict: 'MANAGED' },
                    { label: 'Overall', value: 'A+', verdict: 'INVEST' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-indigo-200">{s.label}</p>
                      <p className="text-xs font-bold text-yellow-300 mt-1">{s.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { title: 'Immediate Actions (0–3 months)', items: ['Launch dynamic pricing in enterprise tier', 'Deploy predictive churn prevention system', 'Initiate ESOP revision for talent retention', 'Optimize cloud infrastructure spending'], color: 'border-t-red-400', tag: 'Urgent' },
                  { title: 'Short-Term (3–12 months)', items: ['Begin Tier 3/4 market pilot in 3 states', 'Hire dedicated compliance officer', 'Launch referral program targeting 20% growth', 'Diversify client base to reduce concentration'], color: 'border-t-amber-400', tag: 'Priority' },
                  { title: 'Long-Term (12–36 months)', items: ['SEA market expansion (Singapore, Indonesia)', 'Series B fundraise targeting ₹80–120Cr', 'Build banking partnership network (20+ banks)', 'Achieve 30%+ market share in core segment'], color: 'border-t-green-500', tag: 'Strategic' },
                ].map((col, i) => (
                  <motion.div key={i} className={`bg-white/90 rounded-2xl p-5 border-t-4 ${col.color} shadow-lg`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12 }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">{col.title}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{col.tag}</span>
                    </div>
                    <ul className="space-y-2">
                      {col.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div className="bg-white/90 rounded-2xl p-6 border border-white/60 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">Navigate Full Analytics Suite</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Dashboard', page: 'dashboard' as Page, color: 'from-blue-500 to-blue-600', icon: BarChart3 },
                    { label: 'Market Analysis', page: 'market' as Page, color: 'from-purple-500 to-purple-600', icon: TrendingUp },
                    { label: 'Financial Analysis', page: 'financial' as Page, color: 'from-green-500 to-green-600', icon: DollarSign },
                    { label: 'Comparison', page: 'comparison' as Page, color: 'from-orange-500 to-orange-600', icon: RefreshCw },
                  ].map((btn, i) => {
                    const BtnIcon = btn.icon;
                    return (
                      <motion.button key={i} onClick={() => onNavigate(btn.page)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r ${btn.color} text-white text-sm font-medium shadow-md`} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <BtnIcon className="w-4 h-4" />{btn.label}<ArrowRight className="w-3 h-3 ml-auto" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
