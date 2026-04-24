import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, Sparkles, X, Bot, User, TrendingUp, DollarSign, BarChart3, Zap } from 'lucide-react';
import type { Suggestion } from './SmartSuggestions';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  chips?: string[];
  timestamp: Date;
}

interface AISearchChatProps {
  suggestions: Suggestion[];
}

const quickPrompts = [
  { label: 'ROI Analysis', icon: DollarSign, query: 'What is our ROI and break-even timeline?' },
  { label: 'Market Trends', icon: TrendingUp, query: 'What are the current market trends?' },
  { label: 'Risk Score', icon: BarChart3, query: 'What is our overall risk score?' },
  { label: 'Top Strategy', icon: Zap, query: 'What is the #1 strategic recommendation?' },
];

const analyticsResponses: Record<string, { content: string; chips?: string[] }> = {
  roi: {
    content: "📈 ROI Analysis: Based on current financials, your 3-year projected ROI is 187% on a ₹1,200L investment. Year 1 returns ₹480L (40%), Year 2 ₹840L (70%), Year 3 ₹1,320L (110%). Break-even point: 2.5 years. IRR stands at 34.8% — classified as Highly Attractive. NPV = ₹92.4L.",
    chips: ['View Financial Analysis', 'Break-Even Chart', 'Cash Flow'],
  },
  market: {
    content: "🌐 Market Intelligence: Total Addressable Market = ₹4,200Cr growing at 22.4% CAGR. Your current share is 24.6% (Rank #2). Key opportunity: ₹180Cr untapped rural segment. Top competitor holds 32.1% — but their NPS is only 58 vs your 72. Predictive model forecasts your share reaching 27.2% by Q4 2024.",
    chips: ['SWOT Analysis', 'Competitor Matrix', 'Market Forecast'],
  },
  risk: {
    content: "🛡 Risk Dashboard: Overall composite risk score = 38/100 (Manageable). Breakdown: Talent Retention 62 (High — needs ESOP revision), Regulatory 55 (Moderate), Market Saturation 42, Customer Concentration 47. Lowest risk: Financial Liquidity at 18/100 — current ratio 2.8x. Primary action: talent retention program.",
    chips: ['Full Risk Analysis', 'Mitigation Plan', 'AI Insights'],
  },
  strategy: {
    content: "🧠 #1 Strategic Recommendation: Accelerate Rural Market Expansion. AI confidence: 87%. Opportunity: ₹180Cr untapped market with 34% lower CAC. Deploy lightweight mobile-first product for Tier 3–4 markets. Partner with Jan Dhan network (4.2Cr+ accounts). Projected uplift: +₹38L/month within 18 months.",
    chips: ['All Recommendations', 'Implementation Plan', 'AI Insights'],
  },
  mvp: {
    content: "🚀 MVP Strategy: Focus your MVP on the single core feature delivering maximum value. Ship in 6–8 weeks using an agile sprint approach. Key data: MVPs reduce development cost by avg 60%, accelerate learning by 4x, and dramatically improve product-market fit validation speed. Projected ROI on MVP approach: 480% over 12 months.",
    chips: ['MVP Roadmap', 'Feature Prioritization', 'Market Analysis'],
  },
  funding: {
    content: "💰 Funding Strategy Analysis: Given your current metrics (22.1% margin, ₹42.8L MRR, 18.3% growth), you're positioned for Series A/B at ₹80–120Cr valuation. Bootstrap path: maximum control, 24+ months runway. Angel route: ₹5–15Cr at ₹40–60Cr valuation. VC route: ₹30–80Cr+ but requires 20–25% equity dilution.",
    chips: ['Financial Analysis', 'Investor Deck Tips', 'Cash Flow'],
  },
  swot: {
    content: "⚖️ SWOT Summary: STRENGTHS — 3 AI patents, 94% retention, ₹420 CAC. WEAKNESSES — Limited rural presence, ₹2.1Cr/month infra cost. OPPORTUNITIES — Digital India initiative, ₹180Cr rural market, 40+ bank partnerships. THREATS — 3 new funded entrants in Q1 2024, talent shortage, regulatory uncertainty.",
    chips: ['Full SWOT', 'Market Analysis', 'Risk Analysis'],
  },
  comparison: {
    content: "📊 YoY Performance: Revenue +50.7% (₹28.4L → ₹42.8L), Profit Margin +7.9pp (14.2% → 22.1%), Customer Count +52.5%, CAC improved -38.2% (₹680 → ₹420), NPS +18pts (54 → 72), Churn Rate -3.2pp. All 8 tracked metrics improved — exceptional execution. Ranked #1 in growth rate vs 4 competitors.",
    chips: ['Comparison Dashboard', 'Competitor Analysis', 'Financial Analysis'],
  },
  financial: {
    content: "💹 Financial Health: Gross Margin 68.4% (vs 60% benchmark), Net Margin 22.1%, EBITDA 31.8%, ROE 34.2%. Liquidity: Current Ratio 2.8x, Quick Ratio 2.1x — both excellent. Efficiency: Asset Turnover 1.82x, Receivables Turnover 8.4x. Cash flow from operations trending strongly: ₹18L → ₹38L over 6 quarters.",
    chips: ['Financial Dashboard', 'Ratio Analysis', 'Cash Flow Charts'],
  },
};

function generateAIResponse(query: string): { content: string; chips?: string[] } {
  const q = query.toLowerCase();
  if (q.includes('roi') || q.includes('return') || q.includes('break') || q.includes('invest')) return analyticsResponses.roi;
  if (q.includes('market') || q.includes('trend') || q.includes('tam') || q.includes('share')) return analyticsResponses.market;
  if (q.includes('risk') || q.includes('score') || q.includes('threat') || q.includes('danger')) return analyticsResponses.risk;
  if (q.includes('strategy') || q.includes('recommend') || q.includes('#1') || q.includes('top')) return analyticsResponses.strategy;
  if (q.includes('mvp') || q.includes('minimum') || q.includes('product')) return analyticsResponses.mvp;
  if (q.includes('fund') || q.includes('investor') || q.includes('capital') || q.includes('vc') || q.includes('money')) return analyticsResponses.funding;
  if (q.includes('swot') || q.includes('strength') || q.includes('weakness') || q.includes('opport')) return analyticsResponses.swot;
  if (q.includes('compar') || q.includes('prior') || q.includes('last year') || q.includes('yoy')) return analyticsResponses.comparison;
  if (q.includes('financial') || q.includes('margin') || q.includes('profit') || q.includes('cash')) return analyticsResponses.financial;
  return {
    content: "🤖 DecisionAI here! I can provide instant insights on: ROI & financials, market trends & SWOT, risk scores, competitor analysis, funding strategies, prior vs current performance, and AI recommendations. What would you like to explore? Try asking about our risk score, market share, or top strategic recommendation.",
    chips: ['ROI Analysis', 'Market Trends', 'Risk Score', 'Top Strategy'],
  };
}

export function AISearchChat({ suggestions: _suggestions }: AISearchChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) inputRef.current.focus();
  }, [isExpanded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msgText = text || query;
    if (!msgText.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, type: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);
    setIsExpanded(true);
    setTimeout(() => {
      const resp = generateAIResponse(msgText);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, type: 'ai', content: resp.content, chips: resp.chips, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Search Bar */}
      <motion.div className="relative" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
        <div className="relative bg-white/85 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Search className="w-5 h-5 text-blue-500 shrink-0" />
            <input ref={inputRef} type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              onFocus={() => setIsExpanded(true)}
              placeholder="Ask DecisionAI — ROI, market trends, risk score, strategy..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm" />
            <AnimatePresence>
              {query && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  onClick={() => handleSend()}
                  className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all">
                  <Send className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
          </div>
        </div>
      </motion.div>

      {/* Quick Prompt Pills */}
      <motion.div className="flex flex-wrap gap-2 justify-center mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        {quickPrompts.map((p) => {
          const PIcon = p.icon;
          return (
            <motion.button key={p.label} onClick={() => handleSend(p.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-gray-200/70 rounded-full text-xs font-medium text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <PIcon className="w-3 h-3" />{p.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isExpanded && messages.length > 0 && (
          <motion.div className="absolute top-full left-0 right-0 mt-3 z-50"
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white/92 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">DecisionAI Assistant</p>
                      <p className="text-xs text-gray-400">Analytics-powered intelligence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => { setIsExpanded(false); setMessages([]); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="px-5 py-4 max-h-80 overflow-y-auto space-y-4">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`p-2 rounded-xl shrink-0 ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-100'}`}>
                        {msg.type === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className={`flex flex-col flex-1 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[88%] ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
                          {msg.content}
                        </div>
                        {msg.type === 'ai' && msg.chips && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.chips.map((chip) => (
                              <span key={chip} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-400 mt-1 px-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.div>
                  ))}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div className="flex gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="p-2 rounded-xl bg-gray-100"><Bot className="w-3.5 h-3.5 text-blue-600" /></div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="flex gap-1">
                            {[0, 0.2, 0.4].map((d, i) => (
                              <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                                animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                {/* Bottom input strip */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex gap-2">
                    <input value={query} onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                      placeholder="Ask a follow-up..."
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 text-gray-700 placeholder:text-gray-400" />
                    <motion.button onClick={() => handleSend()}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl"
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
