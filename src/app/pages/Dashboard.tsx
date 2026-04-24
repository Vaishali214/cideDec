import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, DollarSign, Users, Target, AlertTriangle,
  BarChart3, Activity, ArrowUp, ArrowDown, RefreshCw, ArrowRight,
  Zap, Globe, ShieldCheck
} from 'lucide-react';
import type { Page } from '../App';

interface DashboardProps { onNavigate: (page: Page) => void; }

const kpis = [
  { label: 'Revenue (Monthly)', value: '₹42.8L', change: '+18.3%', up: true, icon: DollarSign, color: 'from-green-400 to-emerald-600', sub: 'vs ₹36.2L last month' },
  { label: 'Market Share', value: '24.6%', change: '+3.2%', up: true, icon: Target, color: 'from-blue-400 to-blue-600', sub: 'vs 21.4% last quarter' },
  { label: 'Active Users', value: '1.24M', change: '+22.1%', up: true, icon: Users, color: 'from-purple-400 to-purple-600', sub: '12,840 paying customers' },
  { label: 'Risk Score', value: '38/100', change: '-5pts', up: true, icon: AlertTriangle, color: 'from-orange-400 to-orange-600', sub: 'Manageable risk profile' },
];

const revenueData = [28, 31, 29, 35, 38, 34, 40, 37, 42, 45, 43, 48];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const quickStats = [
  { label: 'Gross Margin', value: '68.4%', icon: '📊', change: '+4.2pp' },
  { label: 'CAC', value: '₹420', icon: '🎯', change: '-38.2%' },
  { label: 'NPS Score', value: '72', icon: '⭐', change: '+18pts' },
  { label: 'Churn Rate', value: '5.2%', icon: '📉', change: '-3.2pp' },
  { label: 'LTV:CAC', value: '14.8x', icon: '💎', change: '+6.1x' },
  { label: 'Break-Even', value: '2.5yr', icon: '⚖️', change: 'On track' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const maxRev = Math.max(...revenueData);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Business Dashboard</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              Real-time analytics • Updated just now
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
              whileHover={{ scale: 1.02 }} animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6 }}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </motion.button>
            <motion.button onClick={() => onNavigate('insights')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md"
              whileHover={{ scale: 1.03 }}>
              <Activity className="w-4 h-4" /> AI Insights <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}><Icon className="w-5 h-5 text-white" /></div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-xs text-gray-400">{kpi.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {quickStats.map((s, i) => (
            <motion.div key={i} className="bg-white/70 rounded-xl p-3 border border-white/60 shadow-sm text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.07 }} whileHover={{ y: -2 }}>
              <div className="text-lg mb-0.5">{s.icon}</div>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <span className="text-xs text-green-700 font-semibold">{s.change}</span>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Revenue Trend (₹ Lakhs)</h3>
                <p className="text-xs text-gray-400">FY 2024 — Monthly Performance</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">2024 — FY</span>
            </div>
            <div className="flex items-end gap-2 h-48">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs font-semibold bg-gray-900 text-white px-2 py-1 rounded-lg whitespace-nowrap z-10">₹{val}L</div>
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-purple-500 cursor-pointer hover:from-blue-400 hover:to-purple-400 transition-colors"
                    initial={{ height: 0 }} animate={{ height: `${(val / maxRev) * 160}px` }}
                    transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 80 }}
                    whileHover={{ scale: 1.05 }} />
                  <span className="text-xs text-gray-400">{months[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h3 className="font-semibold text-gray-900 mb-4">Market Share Distribution</h3>
            <div className="relative flex items-center justify-center mb-4">
              <svg viewBox="0 0 120 120" className="w-36 h-36">
                {[
                  { pct: 24.6, color: '#3b82f6' }, { pct: 32.1, color: '#8b5cf6' },
                  { pct: 18.4, color: '#10b981' }, { pct: 14.9, color: '#f59e0b' }, { pct: 10.0, color: '#ef4444' }
                ].reduce<{ els: React.ReactElement[]; off: number }>((acc, seg, i) => {
                  const c = 2 * Math.PI * 45;
                  const dash = (seg.pct / 100) * c;
                  const rot = -90 + (acc.off / 100) * 360;
                  acc.els.push(
                    <motion.circle key={i} cx="60" cy="60" r="45" fill="none" stroke={seg.color} strokeWidth="18"
                      strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(${rot} 60 60)`}
                      initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: `${dash} ${c - dash}` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }} />
                  );
                  acc.off += seg.pct;
                  return acc;
                }, { els: [], off: 0 }).els}
                <text x="60" y="56" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1f2937">24.6%</text>
                <text x="60" y="68" textAnchor="middle" fontSize="7" fill="#6b7280">Our Share</text>
              </svg>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Our Company', pct: '24.6%', color: 'bg-blue-500' },
                { label: 'Competitor A', pct: '32.1%', color: 'bg-purple-500' },
                { label: 'Competitor B', pct: '18.4%', color: 'bg-emerald-500' },
                { label: 'Others', pct: '24.9%', color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${item.color}`} /><span className="text-gray-600">{item.label}</span></div>
                  <span className="font-semibold text-gray-800">{item.pct}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Health Indicators */}
        <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />Business Health Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Financial Health', score: 91, color: 'from-green-400 to-emerald-600', items: ['ROI: 187% (3yr)', 'IRR: 34.8%', 'Working Capital: ₹8.4Cr'] },
              { label: 'Market Position', score: 78, color: 'from-blue-400 to-blue-600', items: ['NPS: 72 (vs 58 avg)', 'CAGR: 22.4%', 'CAC: ₹420 (-38%)'] },
              { label: 'Operational Health', score: 82, color: 'from-purple-400 to-purple-600', items: ['Retention: 94.8%', 'Margin: 22.1%', 'LTV:CAC 14.8x'] },
            ].map((h, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">{h.label}</span>
                  <span className="text-lg font-bold text-gray-900">{h.score}<span className="text-xs text-gray-400">/100</span></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <motion.div className={`h-2 rounded-full bg-gradient-to-r ${h.color}`} initial={{ width: 0 }} animate={{ width: `${h.score}%` }} transition={{ delay: 0.7 + i * 0.1 }} />
                </div>
                {h.items.map((item, j) => (
                  <p key={j} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span>{item}</p>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Deep Market Analysis', page: 'market' as Page, desc: 'Trends, SWOT, Competitor Matrix, Forecasts', icon: TrendingUp, gradient: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
            { label: 'Financial Deep Dive', page: 'financial' as Page, desc: 'ROI, Cash Flow, Feasibility, Ratios', icon: DollarSign, gradient: 'from-green-50 to-green-100', iconColor: 'text-green-600', border: 'border-green-200' },
            { label: 'Comparative Analysis', page: 'comparison' as Page, desc: 'Prior vs Current, Benchmarks, Scenarios', icon: BarChart3, gradient: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600', border: 'border-purple-200' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i} onClick={() => onNavigate(card.page)}
                className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 border ${card.border} cursor-pointer hover:shadow-lg transition-all`}
                whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
                <Icon className={`w-8 h-8 ${card.iconColor} mb-3`} />
                <h4 className="font-semibold text-gray-900 mb-1">{card.label}</h4>
                <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700">Explore <ArrowRight className="w-3 h-3" /></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
