import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Globe, Shield, Zap, Target, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import type { Page } from '../App';

interface MarketAnalysisProps { onNavigate: (page: Page) => void; }

const swotData = {
  strengths: ['Proprietary AI technology with 3 patents', 'Strong brand recognition in Tier 1 cities', '94% customer retention rate', 'Low CAC at ₹420 per user'],
  weaknesses: ['Limited presence in rural markets', 'High infrastructure cost (₹2.1Cr/month)', 'Dependence on 3 key enterprise clients', 'Narrow product portfolio'],
  opportunities: ['Digital India initiative driving adoption', '₹180Cr untapped rural market segment', 'Partnership potential with 40+ banks', 'Global expansion to SEA markets'],
  threats: ['3 well-funded new entrants in Q1 2024', 'Regulatory uncertainty in fintech space', 'Talent shortage in AI/ML domain', 'Rising cloud infrastructure costs +28% YoY'],
};

const competitors = [
  { name: 'Our Company', market: 24.6, growth: 18.3, nps: 72, price: 'Medium', tech: 95, color: 'bg-blue-500' },
  { name: 'TechVision A', market: 32.1, growth: 8.2, nps: 58, price: 'High', tech: 78, color: 'bg-purple-500' },
  { name: 'DataFlow B', market: 18.4, growth: 12.1, nps: 64, price: 'Low', tech: 67, color: 'bg-emerald-500' },
  { name: 'SmartBiz C', market: 14.9, growth: 5.8, nps: 49, price: 'Medium', tech: 72, color: 'bg-amber-500' },
  { name: 'Others', market: 10.0, growth: 3.2, nps: 42, price: 'Low', tech: 55, color: 'bg-red-400' },
];

const trendChartData = [
  { month: 'Jan', actual: 42 }, { month: 'Feb', actual: 45 },
  { month: 'Mar', actual: 48 }, { month: 'Apr', actual: 46 },
  { month: 'May', actual: 52 }, { month: 'Jun', actual: 58 },
  { month: 'Jul', predicted: 63 }, { month: 'Aug', predicted: 69 },
  { month: 'Sep', predicted: 75 }, { month: 'Oct', predicted: 82 },
  { month: 'Nov', predicted: 89 }, { month: 'Dec', predicted: 96 },
];

const competitorChartData = competitors.map(c => ({
  name: c.name === 'Our Company' ? 'Us' : c.name.split(' ')[0],
  share: c.market, growth: c.growth, nps: c.nps,
}));

export function MarketAnalysis({ onNavigate: _onNavigate }: MarketAnalysisProps) {
  const [expandedSwot, setExpandedSwot] = useState<string | null>('strengths');

  const swotConfig = [
    { key: 'strengths', label: 'Strengths', icon: Zap, color: 'border-l-green-500 bg-green-50', headerColor: 'text-green-700', badgeColor: 'bg-green-100 text-green-700' },
    { key: 'weaknesses', label: 'Weaknesses', icon: Shield, color: 'border-l-red-400 bg-red-50', headerColor: 'text-red-700', badgeColor: 'bg-red-100 text-red-700' },
    { key: 'opportunities', label: 'Opportunities', icon: Globe, color: 'border-l-blue-500 bg-blue-50', headerColor: 'text-blue-700', badgeColor: 'bg-blue-100 text-blue-700' },
    { key: 'threats', label: 'Threats', icon: Target, color: 'border-l-orange-500 bg-orange-50', headerColor: 'text-orange-700', badgeColor: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
              <p className="text-sm text-gray-500">Comprehensive market intelligence • Predictive forecasting • Competitive positioning</p>
            </div>
          </div>
        </motion.div>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Addressable Market', value: '₹4,200Cr', change: '+12%', up: true },
            { label: 'Serviceable Market (SAM)', value: '₹680Cr', change: '+18%', up: true },
            { label: 'Market CAGR', value: '22.4%', change: 'YoY', up: true },
            { label: 'Customer Lifetime Value', value: '₹84,200', change: '+31%', up: true },
          ].map((stat, i) => (
            <motion.div key={i} className="bg-white/80 rounded-2xl p-5 border border-white/60 shadow-md"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${stat.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {stat.change}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Recharts: Growth Forecast Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <motion.div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Market Growth Forecast (Index)</h3>
                <p className="text-xs text-gray-400 mt-0.5">Actual performance + AI-predicted trajectory</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-blue-500 inline-block" />Actual</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-purple-400 inline-block border border-dashed border-purple-400" />Predicted</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }} />
                <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fontSize: 10, fill: '#64748b' }} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} connectNulls={false} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#a855f7', r: 3 }} activeDot={{ r: 5 }} connectNulls={false} name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Competitor Market Share Bars */}
          <motion.div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h3 className="font-semibold text-gray-900 mb-4">Market Share Distribution</h3>
            <div className="space-y-3">
              {competitors.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${i === 0 ? 'text-blue-700' : 'text-gray-600'}`}>{c.name}</span>
                    <span className="text-gray-500">{c.market}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <motion.div className={`h-2.5 rounded-full ${c.color}`}
                      initial={{ width: 0 }} animate={{ width: `${(c.market / 32.1) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recharts: Competitor Bar Chart */}
        <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <h3 className="font-semibold text-gray-900 mb-4">Competitor Intelligence — Growth vs NPS</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={competitorChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="growth" name="Growth %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nps" name="NPS Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* SWOT Analysis */}
        <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h3 className="font-semibold text-gray-900 mb-5 text-lg">SWOT Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {swotConfig.map((s) => {
              const Icon = s.icon;
              const isOpen = expandedSwot === s.key;
              const items = swotData[s.key as keyof typeof swotData];
              return (
                <motion.div key={s.key} className={`border-l-4 rounded-xl p-4 ${s.color} cursor-pointer`}
                  onClick={() => setExpandedSwot(isOpen ? null : s.key)} whileHover={{ scale: 1.01 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${s.headerColor}`} />
                      <span className={`font-semibold text-sm ${s.headerColor}`}>{s.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.badgeColor}`}>{items.length} items</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                  {isOpen && (
                    <motion.ul className="space-y-1.5 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${s.badgeColor.split(' ')[0]}`} />
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Competitor Intelligence Table */}
        <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">Full Competitor Intelligence Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Company', 'Market Share', 'Growth Rate', 'NPS Score', 'Tech Score', 'Pricing'].map(h => (
                    <th key={h} className={`py-2 px-3 text-gray-500 font-medium ${h === 'Company' ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => (
                  <motion.tr key={i} className={`border-b border-gray-50 ${i === 0 ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.07 }}>
                    <td className="py-3 px-3 font-medium text-gray-900 flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />{c.name}
                      {i === 0 && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">You</span>}
                    </td>
                    <td className="text-center py-3 px-3 text-gray-700">{c.market}%</td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-semibold ${c.growth > 15 ? 'text-green-700' : 'text-gray-600'}`}>+{c.growth}%</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs font-semibold ${c.nps > 65 ? 'text-green-700' : c.nps > 50 ? 'text-amber-600' : 'text-red-600'}`}>{c.nps}</span>
                    </td>
                    <td className="text-center py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-14 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.tech}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{c.tech}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.price === 'High' ? 'bg-purple-50 text-purple-700' : c.price === 'Medium' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{c.price}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
