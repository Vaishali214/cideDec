import { motion } from 'motion/react';
import { X, CheckCircle2, TrendingUp, DollarSign, BarChart3, Target, ArrowRight } from 'lucide-react';
import type { Suggestion } from './SmartSuggestions';
import { ModalAnimation } from './ModalAnimation';

interface SuggestionModalProps {
  suggestion: Suggestion;
  onClose: () => void;
}

// Mini chart data per suggestion
const modalMetrics: Record<string, { roi: string; timeframe: string; risk: string; riskLevel: number; effort: string; effortLevel: number; impact: string; impactLevel: number; miniBarData: number[]; }> = {
  'side-project': { roi: '340%', timeframe: '6–18 months', risk: 'Low (18/100)', riskLevel: 18, effort: 'Medium', effortLevel: 55, impact: 'High', impactLevel: 82, miniBarData: [20, 35, 55, 70, 82, 90] },
  'mvp-first': { roi: '480%', timeframe: '3–9 months', risk: 'Low-Med (28/100)', riskLevel: 28, effort: 'High', effortLevel: 78, impact: 'Very High', impactLevel: 91, miniBarData: [15, 40, 65, 80, 88, 95] },
  'research-competitors': { roi: '220%', timeframe: '1–3 months', risk: 'Very Low (12/100)', riskLevel: 12, effort: 'Low', effortLevel: 30, impact: 'Medium', impactLevel: 68, miniBarData: [30, 45, 55, 62, 65, 68] },
  'talk-to-users': { roi: '290%', timeframe: '2–6 months', risk: 'Low (15/100)', riskLevel: 15, effort: 'Low-Med', effortLevel: 40, impact: 'High', impactLevel: 85, miniBarData: [25, 42, 58, 72, 80, 85] },
  'quick-wins': { roi: '180%', timeframe: '1–4 months', risk: 'Low (20/100)', riskLevel: 20, effort: 'Low', effortLevel: 32, impact: 'Medium', impactLevel: 72, miniBarData: [35, 50, 60, 66, 70, 72] },
  'funding-strategy': { roi: '620%', timeframe: '12–24 months', risk: 'Moderate (52/100)', riskLevel: 52, effort: 'Very High', effortLevel: 88, impact: 'Transformative', impactLevel: 96, miniBarData: [10, 28, 50, 70, 85, 96] },
};

export function SuggestionModal({ suggestion, onClose }: SuggestionModalProps) {
  const Icon = suggestion.icon;
  const metrics = modalMetrics[suggestion.id] || modalMetrics['mvp-first'];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 rounded-t-3xl">
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          <motion.div className="flex items-center gap-4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <motion.div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Icon className="w-10 h-10 text-white" strokeWidth={2} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{suggestion.title}</h2>
              <p className="text-blue-100">{suggestion.description}</p>
            </div>
          </motion.div>

          {/* Quick metric pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Projected ROI', value: metrics.roi, icon: '📈' },
              { label: 'Timeframe', value: metrics.timeframe, icon: '⏱' },
              { label: 'Risk Level', value: metrics.risk, icon: '🛡' },
            ].map((pill, i) => (
              <motion.div key={i} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <span className="text-sm">{pill.icon}</span>
                <span className="text-xs text-blue-100">{pill.label}:</span>
                <span className="text-xs text-white font-semibold">{pill.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3D Animation Section */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
          <ModalAnimation type={suggestion.modalContent.animationType} />
        </div>

        {/* Analytics Dashboard Section */}
        <div className="p-8">
          {/* Impact Analysis */}
          <motion.div className="mb-8" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />Impact Analysis Dashboard
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Effort Required', value: metrics.effort, level: metrics.effortLevel, color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50' },
                { label: 'Potential Impact', value: metrics.impact, level: metrics.impactLevel, color: 'from-green-400 to-green-600', bg: 'bg-green-50' },
                { label: 'Risk Level', value: `${metrics.riskLevel}/100`, level: metrics.riskLevel, color: metrics.riskLevel < 30 ? 'from-green-400 to-green-600' : metrics.riskLevel < 55 ? 'from-amber-400 to-amber-600' : 'from-red-400 to-red-600', bg: metrics.riskLevel < 30 ? 'bg-green-50' : 'bg-amber-50' },
              ].map((item, i) => (
                <motion.div key={i} className={`${item.bg} rounded-xl p-4`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.1 }}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900 mb-2">{item.value}</p>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <motion.div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} initial={{ width: 0 }} animate={{ width: `${item.level}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Growth curve mini-chart */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-3 font-medium">Projected Performance Curve (6 phases)</p>
              <div className="flex items-end gap-2 h-20">
                {metrics.miniBarData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-purple-400"
                      initial={{ height: 0 }} animate={{ height: `${(v / 100) * 60}px` }}
                      transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 80 }} />
                    <span className="text-xs text-gray-400">{['P1','P2','P3','P4','P5','P6'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Strategic Overview */}
          <motion.div className="mb-8" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Strategic Overview</h3>
            <p className="text-gray-700 leading-relaxed">
              {suggestion.modalContent.detailedDescription}
            </p>
          </motion.div>

          {/* Key Insights */}
          <motion.div className="mb-8" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />Key Insights
            </h4>
            <div className="space-y-3">
              {suggestion.modalContent.insights.map((insight, index) => (
                <motion.div key={index}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.1 }}
                  whileHover={{ x: 4, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}>
                  <motion.div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-2 shrink-0"
                    animate={{ scale: [1, 1.3, 1], boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.4)', '0 0 0 6px rgba(59, 130, 246, 0)'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }} />
                  <p className="text-gray-700 flex-1">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-lg font-semibold">Ready to implement this strategy?</p>
                <p className="text-blue-100 text-sm mt-1">DecisionAI can help you create an actionable roadmap with full financial modeling</p>
              </div>
              <motion.button className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shrink-0 ml-4"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                Explore Full Analytics <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
