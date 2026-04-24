import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Send, Sparkles, Lock, Brain, RefreshCw, Bot,
  ArrowUp, ArrowDown, CheckCircle2, XCircle, AlertTriangle,
  Info, TrendingUp, TrendingDown, Zap, Target, DollarSign,
  BarChart3, Activity, GitCompare, ChevronRight, ArrowRight,
  Lightbulb, MessageSquare, Rocket, ShieldCheck,
  Star, Award, Trophy, Flame, Eye, Cpu, Globe,
  Layers, SplitSquareHorizontal, Mic, MicOff,
  BookOpen, Briefcase, GraduationCap, Telescope,
  Gauge, Wand2, ChevronDown, Plus, Minus, X,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { SuggestionCard }      from './SuggestionCard';
import { SuggestionModal }     from './SuggestionModal';
import { FloatingParticles }   from './FloatingParticles';
import { SearchAuthModal }     from './SearchAuthModal';
import { AIAssistantModal }    from './AIAssistantModal';
import { DecisionDNA, generateDecisionDNA } from './DecisionDNA';
import type { DecisionDNAData } from './DecisionDNA';
import { AIvsHumanThinking, generateAIvsHuman } from './AIvsHumanThinking';
import type { AIvsHumanData } from './AIvsHumanThinking';
import { DecisionTimeline, generateTimeline } from './DecisionTimeline';
import type { TimelineNode } from './DecisionTimeline';
import { useApp }              from '../AppContext';
import type { Page }           from '../App';

/* ═══════════════════════════════════════════════
   CORE TYPES
═══════════════════════════════════════════════ */
export interface Suggestion {
  id: string; icon: React.ComponentType<any>; title: string; description: string;
  modalContent: { detailedDescription: string; animationType: 'growth'|'mvp'|'research'|'users'|'wins'|'funding'; insights: string[] };
}
type ModuleKey = 'market'|'financial'|'risk'|'strategy'|'comparison'|'forecast';
type QueryTheme = 'strong-green'|'green'|'golden'|'neutral'|'red'|'weak-red';
type Domain = 'marketing'|'finance'|'technology'|'strategy'|'risk'|'career'|'education'|'health'|'personal'|'general';
type UserLevel = 'beginner'|'intermediate'|'advanced'|'expert';
type GoalMode = 'business'|'learning'|'research';

interface KPI { label: string; value: string; change: string; up: boolean }
interface ChartSpec { type:'area'|'bar'|'line'|'pie'|'radar'; title:string; data:Record<string,unknown>[]; dataKeys:{key:string;color:string}[]; xKey?:string }

/* AI Reasoning */
interface BiasFlag { type:'vague'|'incomplete'|'misleading'|'ambiguous'; message:string; severity:'low'|'medium'|'high' }
interface QueryIntelligence {
  theme: QueryTheme;
  score: number;
  domain: Domain;
  confidence: number;
  confidenceJustification: string;
  verdict: string;
  explanation: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  biasFlags: BiasFlag[];
  autoEnhanced: string;
  alternativePerspectives: { domain:string; query:string; icon:React.ComponentType<any> }[];
  knowledgeGaps: string[];
  futureImpactScore: number;
  scenarios: { label:string; description:string; impact:'positive'|'neutral'|'negative'; delta:number }[];
  keywordStrengths: { word:string; strength:number; color:string }[];
}
interface GamificationState { score:number; level:UserLevel; totalQueries:number; badges:string[]; streak:number }
interface QueryResult {
  query: string; summary: string; modules: ModuleKey[];
  kpis: KPI[]; charts: ChartSpec[]; forecastCharts: ChartSpec[];
  intelligence: QueryIntelligence;
  notif?: { title:string; body:string; type:'insight'|'alert'|'update'|'success' };
}

/* ═══════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════ */
const suggestions: Suggestion[] = [
  { id:'side-project', icon:Lightbulb, title:'Start as a Side Project', description:'Validate your idea with minimal risk while maintaining financial stability.',
    modalContent:{ detailedDescription:'Test market demand without revenue pressure.', animationType:'growth', insights:['Reduces financial risk','Enables flexible iteration','Build proof of concept','Maintain cash flow'] }},
  { id:'mvp-first', icon:Rocket, title:'Build an MVP First', description:'Focus on core features. Ship fast, learn faster, iterate on real feedback.',
    modalContent:{ detailedDescription:'Test hypothesis with minimal resources.', animationType:'mvp', insights:['Ship 10× faster','Validate with real users','Reduce costs 60–70%','Learn what features matter'] }},
  { id:'research-competitors', icon:BarChart3, title:'Research Competitors', description:'Analyse market landscape, identify gaps, learn from successes and failures.',
    modalContent:{ detailedDescription:'Deep analysis reveals market opportunities.', animationType:'research', insights:['Identify ₹180Cr+ gaps','Learn from mistakes first','Understand pricing elasticity','Find your moat'] }},
  { id:'talk-to-users', icon:MessageSquare, title:'Talk to Potential Users', description:'Direct conversations reveal real pain points and unexpected opportunities.',
    modalContent:{ detailedDescription:'User interviews validate product-market fit fastest.', animationType:'users', insights:['Discover real pain points','Validate willingness to pay','Build early-adopter ties','Uncover unseen cases'] }},
  { id:'quick-wins', icon:Zap, title:'Focus on Quick Wins', description:'Prioritise high-impact, low-effort improvements that build momentum.',
    modalContent:{ detailedDescription:'Quick wins contribute to NPS +18pts.', animationType:'wins', insights:['Build team confidence','Show ROI within 30–60 days','Learn via 2-week sprints','Generate word-of-mouth'] }},
  { id:'funding-strategy', icon:DollarSign, title:'Secure Funding Strategy', description:'Plan your approach — bootstrap, angel, or VC.',
    modalContent:{ detailedDescription:'Positioned for Series A/B at ₹80–120Cr.', animationType:'funding', insights:['Bootstrap: max control','Angel ₹5–15Cr: strategic support','VC ₹30–80Cr+: rapid scale','18-month roadmap'] }},
];

const C = { blue:'#3b82f6', violet:'#7c3aed', emerald:'#10b981', amber:'#f59e0b', rose:'#f43f5e', indigo:'#6366f1', sky:'#0ea5e9', green:'#22c55e', red:'#ef4444', gold:'#d97706', teal:'#14b8a6' };

const QUICK_PROMPTS = [
  { label:'How to become a doctor',        icon:Lightbulb   },
  { label:'3-year ROI forecast',          icon:DollarSign  },
  { label:'Should I choose engineering or design', icon:Brain },
  { label:'How to start a business',      icon:Rocket      },
  { label:'Career switch to tech at 30',  icon:TrendingUp  },
  { label:'How to improve my skills',     icon:Activity    },
];

const MODULES: Record<ModuleKey,{page:Page;label:string;desc:string;icon:React.ComponentType<any>;iconBg:string;iconColor:string;barColor:string;arrowColor:string;metrics:{label:string;value:string;pct?:number}[]}> = {
  market:     {page:'market',     label:'Market Analysis',    icon:TrendingUp,   desc:'SWOT · TAM/SAM · Competitor matrix · Growth forecast',   iconBg:'bg-blue-100',    iconColor:'text-blue-600',    barColor:'bg-blue-500',    arrowColor:'text-blue-500',    metrics:[{label:'TAM',value:'₹4,200Cr',pct:84},{label:'CAGR',value:'22.4%',pct:72},{label:'Share',value:'24.6%',pct:62}]},
  financial:  {page:'financial',  label:'Financial Analysis', icon:DollarSign,   desc:'ROI · Cash flow · Feasibility · Ratio analysis',           iconBg:'bg-emerald-100', iconColor:'text-emerald-600', barColor:'bg-emerald-500', arrowColor:'text-emerald-500', metrics:[{label:'Net Margin',value:'22.1%',pct:74},{label:'ROE',value:'34.2%',pct:86},{label:'IRR',value:'34.8%',pct:87}]},
  risk:       {page:'insights',   label:'Risk Assessment',    icon:AlertTriangle,desc:'6-factor scoring · Mitigation plans · Risk alerts',         iconBg:'bg-amber-100',   iconColor:'text-amber-600',   barColor:'bg-amber-500',   arrowColor:'text-amber-500',   metrics:[{label:'Composite',value:'38/100',pct:38},{label:'Top Risk',value:'Talent',pct:62},{label:'Liquidity',value:'2.8×',pct:20}]},
  strategy:   {page:'insights',   label:'AI Strategy Engine', icon:Brain,        desc:'Priority actions · AI confidence scores · Roadmaps',       iconBg:'bg-violet-100',  iconColor:'text-violet-600',  barColor:'bg-violet-500',  arrowColor:'text-violet-500',  metrics:[{label:'Confidence',value:'87%',pct:87},{label:'Impact',value:'+₹38L/mo',pct:76},{label:'Timeline',value:'18 mo',pct:55}]},
  comparison: {page:'comparison', label:'Comparison Model',   icon:GitCompare,   desc:'YoY trends · Interfirm benchmarks · Scenario analysis',    iconBg:'bg-indigo-100',  iconColor:'text-indigo-600',  barColor:'bg-indigo-500',  arrowColor:'text-indigo-500',  metrics:[{label:'Rev Δ',value:'+50.7%',pct:85},{label:'CAC Δ',value:'−38.2%',pct:70},{label:'NPS Δ',value:'+18 pts',pct:72}]},
  forecast:   {page:'dashboard',  label:'Predictive Forecast',icon:Target,       desc:'ML projections · Confidence intervals · Scenarios',         iconBg:'bg-rose-100',    iconColor:'text-rose-600',    barColor:'bg-rose-500',    arrowColor:'text-rose-500',    metrics:[{label:'Q3 Rev',value:'₹52.4L',pct:64},{label:'Q4 Rev',value:'₹61.8L',pct:75},{label:'Conf.',value:'88%',pct:88}]},
};

/* ═══════════════════════════════════════════════
   RESPONSE ENGINE
═══════════════════════════════════════════════ */
type RT = Omit<QueryResult,'query'|'intelligence'|'forecastCharts'>;
const responseMap: Record<string,RT> = {
  roi:{ summary:'3-year ROI = 187% on ₹1,200L. Break-even 2.5 yrs. IRR 34.8% — Highly Attractive.',
    modules:['financial','forecast','comparison'],
    kpis:[{label:'3-Year ROI',value:'187%',change:'Excellent',up:true},{label:'Break-Even',value:'2.5 yrs',change:'On track',up:true},{label:'NPV',value:'₹92.4L',change:'+31%',up:true},{label:'IRR',value:'34.8%',change:'Attractive',up:true}],
    charts:[
      {type:'area',title:'Cost vs Revenue (₹L)',data:[{y:'Yr 0',cost:-1200,revenue:0},{y:'Yr 1',cost:-380,revenue:860},{y:'Yr 2',cost:-340,revenue:1180},{y:'Yr 3',cost:-310,revenue:1630}],dataKeys:[{key:'revenue',color:C.emerald},{key:'cost',color:C.rose}],xKey:'y'},
      {type:'bar',title:'Annual Returns (₹L)',data:[{y:'Year 1',v:480},{y:'Year 2',v:840},{y:'Year 3',v:1320}],dataKeys:[{key:'v',color:C.blue}],xKey:'y'}
    ],notif:{title:'ROI Analysis Complete',body:'IRR 34.8% — Highly Attractive.',type:'success'}},
  market:{ summary:'TAM = ₹4,200Cr @ 22.4% CAGR. Share 24.6% — Rank #2. ₹180Cr rural opportunity.',
    modules:['market','strategy','forecast'],
    kpis:[{label:'TAM',value:'₹4,200Cr',change:'+12% YoY',up:true},{label:'Market Share',value:'24.6%',change:'+3.2%',up:true},{label:'CAGR',value:'22.4%',change:'Strong',up:true},{label:'NPS Lead',value:'+14 pts',change:'vs avg',up:true}],
    charts:[
      {type:'pie',title:'Market Share (%)',data:[{name:'Our Co',value:24.6},{name:'TechVision',value:32.1},{name:'DataFlow',value:18.4},{name:'SmartBiz',value:14.9},{name:'Others',value:10}],dataKeys:[{key:'value',color:C.blue}],xKey:'name'},
      {type:'line',title:'Growth Forecast',data:[{m:'Jan',actual:42},{m:'Feb',actual:45},{m:'Mar',actual:48},{m:'Apr',actual:52},{m:'May',actual:58},{m:'Jun',predicted:63},{m:'Jul',predicted:69},{m:'Aug',predicted:75},{m:'Sep',predicted:82}],dataKeys:[{key:'actual',color:C.blue},{key:'predicted',color:C.violet}],xKey:'m'}
    ],notif:{title:'Market Insight Detected',body:'₹180Cr rural opportunity, 34% lower CAC.',type:'insight'}},
  risk:{ summary:'Composite risk = 38/100. Critical: Talent 62, Regulatory 55. Liquidity safest at 18.',
    modules:['risk','strategy','financial'],
    kpis:[{label:'Overall Risk',value:'38/100',change:'Manageable',up:true},{label:'Top Risk',value:'Talent',change:'62/100 High',up:false},{label:'Liquidity',value:'2.8×',change:'Safe zone',up:true},{label:'Plans',value:'4 items',change:'Mitigation',up:true}],
    charts:[{type:'bar',title:'Risk Factor Scores (out of 100)',data:[{f:'Talent',score:62},{f:'Regulatory',score:55},{f:'Market',score:42},{f:'Customer',score:47},{f:'Tech',score:31},{f:'Liquidity',score:18}],dataKeys:[{key:'score',color:C.amber}],xKey:'f'}],
    notif:{title:'Risk Alert',body:'Talent Retention at 62/100. ESOP revision needed.',type:'alert'}},
  strategy:{ summary:'#1 Action: Rural Expansion — AI confidence 87%. ₹180Cr opportunity, 34% lower CAC.',
    modules:['strategy','market','financial'],
    kpis:[{label:'AI Confidence',value:'87%',change:'High',up:true},{label:'Revenue Uplift',value:'+₹38L/mo',change:'Projected',up:true},{label:'CAC Reduction',value:'−34%',change:'Rural mkt',up:true},{label:'Timeline',value:'18 mo',change:'Full impact',up:true}],
    charts:[{type:'area',title:'Revenue Uplift (₹L/mo)',data:[{m:'M1',base:42.8,strat:43.5},{m:'M3',base:43.2,strat:45.8},{m:'M6',base:44,strat:51.2},{m:'M9',base:44.8,strat:58.6},{m:'M12',base:45.5,strat:67.4},{m:'M18',base:46.8,strat:80.8}],dataKeys:[{key:'strat',color:C.emerald},{key:'base',color:C.sky}],xKey:'m'}],
    notif:{title:'Strategy Insight',body:'Rural expansion — 87% AI confidence.',type:'insight'}},
  financial:{ summary:'Gross Margin 68.4%, Net 22.1%, EBITDA 31.8%, ROE 34.2%. Current Ratio 2.8×.',
    modules:['financial','comparison','forecast'],
    kpis:[{label:'Gross Margin',value:'68.4%',change:'+4.2 pp',up:true},{label:'Net Margin',value:'22.1%',change:'+7.9 pp',up:true},{label:'Current Ratio',value:'2.8×',change:'Excellent',up:true},{label:'ROE',value:'34.2%',change:'+14.2 pp',up:true}],
    charts:[{type:'bar',title:'Cash Flow by Quarter (₹L)',data:[{q:"Q1'23",op:18,inv:-8},{q:"Q2'23",op:21,inv:-5},{q:"Q3'23",op:24,inv:-12},{q:"Q4'23",op:28,inv:-6},{q:"Q1'24",op:32,inv:-9},{q:"Q2'24",op:38,inv:-14}],dataKeys:[{key:'op',color:C.emerald},{key:'inv',color:C.rose}],xKey:'q'}],
    notif:{title:'Financial Health Checked',body:'Gross margin 68.4% above benchmark.',type:'success'}},
  comparison:{ summary:'YoY: Revenue +50.7%, Customers +52.5%, CAC −38.2%, NPS +18 pts, Churn −3.2 pp.',
    modules:['comparison','financial','market'],
    kpis:[{label:'Rev Growth',value:'+50.7%',change:'YoY',up:true},{label:'CAC Drop',value:'−38.2%',change:'₹680→₹420',up:true},{label:'NPS Growth',value:'+18 pts',change:'54→72',up:true},{label:'Churn Cut',value:'−3.2 pp',change:'8.4%→5.2%',up:true}],
    charts:[{type:'bar',title:'Prior vs Current Year',data:[{m:'Revenue',prior:28.4,curr:42.8},{m:'NPS',prior:54,curr:72}],dataKeys:[{key:'prior',color:C.sky},{key:'curr',color:C.blue}],xKey:'m'},
            {type:'line',title:'Growth Rate vs Competitors (%)',data:[{n:'Our Co',r:18.3},{n:'TechVision',r:8.2},{n:'DataFlow',r:12.1},{n:'SmartBiz',r:5.8}],dataKeys:[{key:'r',color:C.blue}],xKey:'n'}],
    notif:{title:'Comparison Complete',body:'Revenue +50.7%, NPS +18 pts.',type:'update'}},
  default:{ summary:'CideDec ready. Ask about ROI, market share, risk, strategy, or financial ratios.',
    modules:['market','financial','risk','strategy'],
    kpis:[{label:'Revenue MoM',value:'₹42.8L',change:'+18.3%',up:true},{label:'Market Share',value:'24.6%',change:'+3.2%',up:true},{label:'Risk Score',value:'38/100',change:'Managed',up:true},{label:'ROI (3yr)',value:'187%',change:'Excellent',up:true}],
    charts:[{type:'area',title:'Revenue Trend (₹L)',data:[{m:'Jan',v:28},{m:'Feb',v:31},{m:'Mar',v:29},{m:'Apr',v:35},{m:'May',v:38},{m:'Jun',v:42},{m:'Jul',v:40},{m:'Aug',v:45},{m:'Sep',v:43},{m:'Oct',v:48}],dataKeys:[{key:'v',color:C.blue}],xKey:'m'}],
    notif:undefined},
};
/* ── Universal response templates for life / career / education ── */
const universalMap: Record<string,RT> = {
  career:{ summary:'AI-powered career path analysis with skill mapping, competition assessment, and 5-year trajectory forecast.',
    modules:['strategy','market','forecast'],
    kpis:[{label:'Path Viability',value:'82/100',change:'Strong',up:true},{label:'Avg Timeline',value:'3–5 yrs',change:'To mastery',up:true},{label:'Competition',value:'Medium',change:'Growing field',up:true},{label:'Growth Rate',value:'+24%',change:'Job demand',up:true}],
    charts:[{type:'area',title:'Skill Progression Over Time',data:[{m:'Month 1',v:10},{m:'Month 6',v:28},{m:'Year 1',v:48},{m:'Year 2',v:68},{m:'Year 3',v:82},{m:'Year 5',v:95}],dataKeys:[{key:'v',color:C.blue}],xKey:'m'},
      {type:'bar',title:'Salary Trajectory (₹LPA)',data:[{y:'Entry',v:4},{y:'Year 2',v:8},{y:'Year 5',v:15},{y:'Year 8',v:25},{y:'Year 10+',v:40}],dataKeys:[{key:'v',color:C.emerald}],xKey:'y'}],
    notif:{title:'Career Analysis Complete',body:'Path viability assessed with skill mapping and timeline.',type:'insight'}},
  education:{ summary:'Education pathway analysis — comparing degrees, certifications, costs, and career outcomes.',
    modules:['comparison','financial','forecast'],
    kpis:[{label:'Degree Value',value:'High',change:'ROI positive',up:true},{label:'Avg Duration',value:'4 yrs',change:'Full-time',up:true},{label:'Avg Cost',value:'₹8–15L',change:'Varies',up:true},{label:'Job Placement',value:'78%',change:'Within 6 mo',up:true}],
    charts:[{type:'bar',title:'Cost vs Earning Potential (₹L)',data:[{p:'Degree',cost:12,earning:8},{p:'Certification',cost:2,earning:6},{p:'Bootcamp',cost:1.5,earning:5},{p:'Self-learn',cost:0.2,earning:4}],dataKeys:[{key:'cost',color:C.rose},{key:'earning',color:C.emerald}],xKey:'p'},
      {type:'line',title:'Career Growth by Education Path',data:[{y:'Year 1',degree:5,cert:4,self:3},{y:'Year 3',degree:12,cert:10,self:7},{y:'Year 5',degree:22,cert:18,self:12},{y:'Year 10',degree:42,cert:32,self:20}],dataKeys:[{key:'degree',color:C.blue},{key:'cert',color:C.violet},{key:'self',color:C.amber}],xKey:'y'}],
    notif:{title:'Education Path Mapped',body:'Multiple pathways compared with cost-benefit analysis.',type:'update'}},
  health:{ summary:'Health & wellness decision analysis — career paths in healthcare, wellness planning, and medical field insights.',
    modules:['risk','strategy','forecast'],
    kpis:[{label:'Demand',value:'Very High',change:'+18% YoY',up:true},{label:'Training',value:'5–10 yrs',change:'Intensive',up:true},{label:'Impact',value:'Direct',change:'Life-saving',up:true},{label:'Stability',value:'95%',change:'Job security',up:true}],
    charts:[{type:'area',title:'Healthcare Job Demand Index',data:[{y:'2020',v:62},{y:'2021',v:70},{y:'2022',v:78},{y:'2023',v:84},{y:'2024',v:92},{y:'2025',v:100}],dataKeys:[{key:'v',color:C.emerald}],xKey:'y'}],
    notif:{title:'Health Career Insight',body:'Healthcare demand growing at 18% YoY.',type:'insight'}},
  personal:{ summary:'Personal development roadmap — skill assessment, growth plan, and milestone tracking.',
    modules:['strategy','comparison','forecast'],
    kpis:[{label:'Skill Gap',value:'34%',change:'Closeable',up:true},{label:'Growth Rate',value:'+22%',change:'Monthly',up:true},{label:'Consistency',value:'Key',change:'Factor #1',up:true},{label:'Timeline',value:'6–12 mo',change:'Visible results',up:true}],
    charts:[{type:'area',title:'Personal Growth Trajectory',data:[{m:'Week 1',v:5},{m:'Month 1',v:15},{m:'Month 3',v:35},{m:'Month 6',v:55},{m:'Year 1',v:78},{m:'Year 2',v:92}],dataKeys:[{key:'v',color:C.violet}],xKey:'m'}],
    notif:{title:'Growth Plan Ready',body:'Personalized development roadmap generated.',type:'success'}},
};

function classify(q:string):RT {
  const t = q.toLowerCase();
  /* Business domains */
  if (/roi|return|break.?even|irr|npv|invest/.test(t))               return responseMap.roi;
  if (/market|trend|tam|share|segment|competitor|swot|marketing/.test(t)) return responseMap.market;
  if (/risk|threat|danger|vulnerab|mitigation/.test(t))              return responseMap.risk;
  if (/strateg|recommend|#1|top action|growth plan|rural/.test(t))   return responseMap.strategy;
  if (/financial|margin|profit|cash|liquidity|ratio|ebitda/.test(t)) return responseMap.financial;
  if (/compar|prior|last year|yoy|benchm|interfirm/.test(t))         return responseMap.comparison;
  /* Universal domains */
  if (/doctor|mbbs|neet|medical|surgeon|nurse|healthcare|hospital|pharma|biotech/.test(t)) return universalMap.health;
  if (/career|job|profession|salary|hire|resume|switch|promotion|work|engineer|developer|designer|architect|lawyer|pilot|teacher|chef/.test(t)) return universalMap.career;
  if (/educat|degree|college|universit|course|certif|learn|study|exam|school|mba|btech|masters|phd|bootcamp/.test(t)) return universalMap.education;
  if (/skill|improve|habit|personal|growth|motivation|focus|discipline|confident|creative|communicat|mindset|productiv|life/.test(t)) return universalMap.personal;
  if (/business|startup|entrepre|found|launch|company|venture/.test(t)) return responseMap.strategy;
  return responseMap.default;
}

/* ═══════════════════════════════════════════════
   DEEP INTELLIGENCE ENGINE
═══════════════════════════════════════════════ */
const STRONG_KW = ['market','marketing','roi','revenue','strategy','financial','growth','analysis',
  'invest','profit','risk','competitive','customer','product','sales','forecast','trend','data',
  'insight','business','startup','expansion','funding','brand','digital','analytics','performance',
  'comparison','kpi','margin','cash','ebitda','npv','irr','tam','cagr','swot','benchmark',
  'innovation','leadership','demand','supply','pricing','fintech','saas','b2b','b2c','agile',
  /* Universal domains */
  'career','job','profession','salary','engineer','doctor','developer','designer','education',
  'degree','college','university','course','certification','learn','study','exam','skill',
  'improve','habit','personal','motivation','focus','discipline','health','medical','healthcare',
  'wellness','creative','communication','mindset','productivity','life','goal','plan','path'];
const DOMAIN_MAP:Record<string,Domain> = {
  marketing:'marketing',market:'marketing',brand:'marketing',campaign:'marketing',seo:'marketing',
  roi:'finance',revenue:'finance',financial:'finance',profit:'finance',investment:'finance',margin:'finance',irr:'finance',npv:'finance',
  technology:'technology',tech:'technology',saas:'technology',software:'technology',ai:'technology',digital:'technology',
  strategy:'strategy',growth:'strategy',expansion:'strategy',competitive:'strategy',leadership:'strategy',
  risk:'risk',threat:'risk',vulnerab:'risk',mitigation:'risk',compliance:'risk',
  /* Universal domains */
  career:'career',job:'career',profession:'career',salary:'career',hire:'career',resume:'career',promotion:'career',
  education:'education',degree:'education',college:'education',university:'education',course:'education',certification:'education',study:'education',exam:'education',
  doctor:'health',medical:'health',healthcare:'health',hospital:'health',nurse:'health',pharma:'health',wellness:'health',
  skill:'personal',improve:'personal',habit:'personal',personal:'personal',motivation:'personal',focus:'personal',discipline:'personal',creative:'personal',mindset:'personal',productivity:'personal',
};
const BIAS_TRIGGERS = [
  {re:/\ball\b|\balways\b|\bnever\b|\beveryone\b/,type:'misleading' as const,msg:'Absolute terms like "all/always/never" may oversimplify — add qualifiers for accurate analysis.',severity:'medium' as const},
  {re:/^.{1,4}$/,type:'vague' as const,msg:'Query too short to extract meaningful business context. Add domain, metric, or intent.',severity:'high' as const},
  {re:/^(what|how|why|when)\s*\??$/i,type:'incomplete' as const,msg:'Incomplete question — missing subject. Specify the business entity or metric.',severity:'high' as const},
  {re:/\bmaybe\b|\bsomething\b|\bstuff\b|\bthings\b/,type:'ambiguous' as const,msg:'Vague terms reduce analytical precision. Replace with specific business terminology.',severity:'medium' as const},
];

function detectDomain(q:string):Domain {
  const t = q.toLowerCase();
  for (const [kw,dom] of Object.entries(DOMAIN_MAP)) {
    if (t.includes(kw)) return dom;
  }
  return 'general';
}

function analyzeIntelligence(q:string): QueryIntelligence {
  const t      = q.toLowerCase().trim();
  const words  = t.split(/\s+/);
  const wCount = words.length;
  const strongMatches = STRONG_KW.filter(k => t.includes(k));
  const hasNums = /\d/.test(t);
  const hasPunct = /[?!.,]/.test(t);
  const domain = detectDomain(q);

  /* Score 0-100 */
  let score = 35;
  score += strongMatches.length * 10;
  score += wCount > 2 ? 8 : 0;
  score += wCount > 5 ? 8 : 0;
  score += hasNums   ? 7 : 0;
  score += hasPunct  ? 4 : 0;
  score += domain !== 'general' ? 6 : 0;
  score = Math.max(5, Math.min(98, score));

  const theme: QueryTheme = score >= 85 ? 'strong-green' : score >= 68 ? 'green' : score >= 52 ? 'golden' : score >= 40 ? 'neutral' : score >= 22 ? 'red' : 'weak-red';
  const confidence = Math.min(98, score + (strongMatches.length * 3));

  /* Bias detection */
  const biasFlags: BiasFlag[] = [];
  for (const bt of BIAS_TRIGGERS) {
    if (bt.re.test(q)) biasFlags.push({ type:bt.type, message:bt.msg, severity:bt.severity });
  }

  /* Keyword strengths for heatmap */
  const keywordStrengths = words.slice(0,8).map(w => {
    const idx = STRONG_KW.indexOf(w);
    const str = idx !== -1 ? 70 + Math.min(30, (STRONG_KW.length - idx) * 2) : 15 + Math.random() * 20;
    const col = str > 65 ? '#10b981' : str > 35 ? '#f59e0b' : '#ef4444';
    return { word:w, strength:Math.round(str), color:col };
  });

  /* Auto-enhanced query */
  const enhancements: Record<Domain,string> = {
    marketing: `${q} — with campaign ROI metrics, channel attribution, and 5-year brand equity forecast`,
    finance:   `${q} — including IRR, NPV, sensitivity analysis, and 5-year cash flow projections`,
    technology:`${q} — with scalability assessment, tech-debt risk scoring, and adoption trajectory`,
    strategy:  `${q} — backed by competitive SWOT, market positioning, and 5-year scenario modelling`,
    risk:      `${q} — with 6-factor composite scoring, mitigation playbook, and contingency timelines`,
    career:    `${q} — with skill gap analysis, salary trajectory, competition level, and career growth forecast`,
    education: `${q} — with degree ROI comparison, institution rankings, cost-benefit analysis, and placement rates`,
    health:    `${q} — with demand analysis, training pathway, specialization options, and career stability metrics`,
    personal:  `${q} — with skill assessment, habit framework, milestone tracking, and growth trajectory model`,
    general:   `${q} — with industry benchmarks, trend analysis, and predictive confidence intervals`,
  };

  /* Alternative perspectives */
  const altMap: Record<Domain,{domain:string;query:string;icon:React.ComponentType<any>}[]> = {
    marketing:[{domain:'Financial',query:`Revenue impact of ${q}`,icon:DollarSign},{domain:'Risk',query:`Risk exposure in ${q}`,icon:AlertTriangle},{domain:'Strategy',query:`${q} competitive positioning`,icon:Target}],
    finance:  [{domain:'Market',query:`Market dynamics affecting ${q}`,icon:TrendingUp},{domain:'Strategy',query:`${q} strategic implications`,icon:Brain},{domain:'Risk',query:`${q} risk-adjusted returns`,icon:ShieldCheck}],
    technology:[{domain:'Business',query:`Business case for ${q}`,icon:Briefcase},{domain:'Market',query:`Market adoption of ${q}`,icon:Globe},{domain:'Risk',query:`${q} implementation risks`,icon:AlertTriangle}],
    strategy:[{domain:'Finance',query:`Financial model for ${q}`,icon:DollarSign},{domain:'Market',query:`${q} market opportunity`,icon:TrendingUp},{domain:'Operations',query:`${q} execution roadmap`,icon:Target}],
    risk:    [{domain:'Finance',query:`Financial impact of ${q}`,icon:DollarSign},{domain:'Strategy',query:`${q} mitigation strategy`,icon:Brain},{domain:'Compliance',query:`Regulatory view of ${q}`,icon:ShieldCheck}],
    career:  [{domain:'Education',query:`Best education path for ${q}`,icon:Brain},{domain:'Finance',query:`Salary & earning potential: ${q}`,icon:DollarSign},{domain:'Personal',query:`Lifestyle impact of ${q}`,icon:Target}],
    education:[{domain:'Career',query:`Career outcomes of ${q}`,icon:TrendingUp},{domain:'Finance',query:`Cost-benefit analysis: ${q}`,icon:DollarSign},{domain:'Alternative',query:`Alternative paths to ${q}`,icon:Lightbulb}],
    health:  [{domain:'Education',query:`Education required for ${q}`,icon:Brain},{domain:'Career',query:`Related careers: ${q}`,icon:Briefcase},{domain:'Finance',query:`Financial outlook: ${q}`,icon:DollarSign}],
    personal:[{domain:'Career',query:`Career impact of ${q}`,icon:Briefcase},{domain:'Education',query:`Courses for ${q}`,icon:Brain},{domain:'Health',query:`Wellness aspects of ${q}`,icon:ShieldCheck}],
    general: [{domain:'Career',query:`Career angle: ${q}`,icon:Briefcase},{domain:'Finance',query:`Financial view: ${q}`,icon:DollarSign},{domain:'Education',query:`Learning path: ${q}`,icon:Brain}],
  };

  /* Knowledge gaps */
  const gapMap: Record<Domain,string[]> = {
    marketing:['Customer lifetime value (CLV) metrics not specified','Attribution model undefined — multi-touch vs last-click?','No A/B testing hypothesis included'],
    finance:  ['Discount rate assumption missing','Working capital cycles not addressed','Tax implications not factored in'],
    technology:['Infrastructure scaling assumptions unclear','Security and compliance posture not addressed','Integration complexity not estimated'],
    strategy: ['Competitive moat not defined','Execution timeline and milestones missing','Resource allocation model absent'],
    risk:     ['Regulatory jurisdiction not specified','Counterparty risk not assessed','Black-swan scenario not modelled'],
    general:  ['Industry sector not specified — generalised analysis applied','Time horizon not defined','Benchmark dataset not selected'],
  };

  /* Future impact score (0-100) */
  const futureImpactScore = Math.min(95, score * 0.9 + strongMatches.length * 2);

  /* Scenario simulations */
  const baseScenarios = [
    { label:'As-is (current query)',        description:'Baseline analysis with current context level',               impact:'neutral'  as const, delta: 0    },
    { label:'+ Time horizon (5yr)',         description:'Adding explicit timeframe increases forecast precision 28%', impact:'positive' as const, delta:+18   },
    { label:'+ Sector specificity',         description:'Adding industry vertical improves benchmark accuracy 35%',   impact:'positive' as const, delta:+22   },
    { label:'+ Metric target',             description:'Adding a success KPI makes recommendation 40% more actionable',impact:'positive'as const, delta:+28   },
    { label:'Vague (remove domain terms)', description:'Removing domain terms reduces confidence to <30%',           impact:'negative' as const, delta:-35   },
  ];

  /* Green vs Red logic */
  const isStrong = score >= 68;
  return {
    theme, score, domain, confidence,
    confidenceJustification: isStrong
      ? `High confidence: ${strongMatches.length} strong domain signals (${strongMatches.slice(0,3).join(', ')}) with ${wCount}-word query depth. Domain: ${domain}. No bias flags.`
      : score >= 40
      ? `Moderate confidence: partial domain match. Add a specific metric or time horizon to improve from ${confidence}% to 85%+.`
      : `Low confidence: query lacks domain specificity. Only ${strongMatches.length} weak signals detected. Rewording is strongly recommended.`,
    verdict: score>=85?'Exceptional Query — Maximum Analytical Depth':score>=68?'Strong Query — High Signal Strength':score>=52?'Good Query — Moderate Signal':score>=40?'Moderate — Some Signal Detected':score>=22?'Weak Query — Low Signal':'Very Weak — Insufficient Context',
    explanation: isStrong
      ? `"${q}" carries strong ${domain} domain signals (${strongMatches.slice(0,4).join(', ')}), enabling CideDec to cross-reference 2,400+ industry benchmarks with ${confidence}% confidence.`
      : score >= 40
      ? `"${q}" has partial relevance but lacks the specificity needed for deep analysis. Enriching with a metric (revenue, CAC, NPS) or timeframe will improve output quality significantly.`
      : `"${q}" does not map to known business frameworks. It appears ${biasFlags[0]?.type ?? 'too vague'} for meaningful analysis. Use the suggestions below.`,
    strengths: isStrong ? [
      `${strongMatches.length} strong domain signals: ${strongMatches.slice(0,4).join(', ')}`,
      `${domain.charAt(0).toUpperCase()+domain.slice(1)} domain — well-indexed in CideDec engine`,
      `${wCount}-word query provides sufficient semantic depth for AI modelling`,
      'Enables multi-module cross-referencing (financial + market + risk)',
      'Supports 5-year predictive forecasting with high confidence intervals',
    ] : [],
    gaps: !isStrong ? [
      strongMatches.length === 0 ? 'No recognisable business domain detected' : `Only ${strongMatches.length} weak signal(s) found`,
      wCount < 3 ? 'Query too short for multi-module analysis' : 'Insufficient specificity for benchmark matching',
      'Missing time horizon — 5-year forecast cannot be accurately calibrated',
      'No target metric specified — success criteria cannot be measured',
    ] : [],
    suggestions: isStrong ? [
      `Add a time horizon: "${q} over next 5 years"`,
      `Add a target metric: "${q} impact on customer lifetime value"`,
      `Specify a region: "${q} in Tier 3 markets"`,
    ] : [
      `Try: "marketing campaign ROI for Q3 product launch" — adds domain + metric + timeframe`,
      `Try: "financial risk assessment for SaaS expansion" — adds domain + intent + context`,
      `Try: "competitive market share strategy 2025–2030" — adds domain + goal + horizon`,
      'Use the quick prompts below for pre-structured, high-value queries',
    ],
    biasFlags,
    autoEnhanced: enhancements[domain],
    alternativePerspectives: altMap[domain],
    knowledgeGaps: gapMap[domain],
    futureImpactScore: Math.round(futureImpactScore),
    scenarios: baseScenarios,
    keywordStrengths,
  };
}

/* ═══════════════════════════════════════════════
   5-YEAR FORECAST GENERATOR
═══════════════════════════════════════════════ */
function generateForecast(q:string, intel:QueryIntelligence): ChartSpec[] {
  const b = intel.score / 100;
  const yr = (base:number, i:number, growth:number) => Math.round(base * Math.pow(1+growth,i) * b);
  const years = ['2025','2026','2027','2028','2029','2030'];

  return [
    { type:'area', title:'5-Year Revenue Projection (₹L/mo)',
      data: years.map((y,i)=>({ year:y, optimistic:yr(42.8,i,0.22), projected:yr(42.8,i,0.15), conservative:yr(42.8,i,0.07) })),
      dataKeys:[{key:'optimistic',color:C.emerald},{key:'projected',color:C.blue},{key:'conservative',color:C.violet}], xKey:'year' },
    { type:'line', title:'Market Share Trajectory vs Competitor (%)',
      data: years.map((y,i)=>({ year:y, ours:parseFloat((24.6 + i*2.1*b).toFixed(1)), competitor:parseFloat((32.1 - i*0.8).toFixed(1)) })),
      dataKeys:[{key:'ours',color:intel.score>=60?C.green:C.red},{key:'competitor',color:'#94a3b8'}], xKey:'year' },
    { type:'bar', title:'AI Confidence Score Trajectory (%)',
      data: years.map((y,i)=>({ year:y, confidence:Math.min(98,Math.round(intel.confidence + (b>0.6 ? i*2.1 : -i*3.2))) })),
      dataKeys:[{key:'confidence',color:intel.score>=60?C.teal:C.amber}], xKey:'year' },
  ];
}

/* ═══════════════════════════════════════════════
   GAMIFICATION ENGINE
═══════════════════════════════════════════════ */
function computeGamification(totalQueries:number, totalScore:number): GamificationState {
  const avg = totalQueries>0 ? totalScore/totalQueries : 0;
  const level: UserLevel = avg>=80 ? 'expert' : avg>=65 ? 'advanced' : avg>=45 ? 'intermediate' : 'beginner';
  const badges: string[] = [];
  if (totalQueries >= 1)   badges.push('First Search');
  if (totalQueries >= 5)   badges.push('Explorer');
  if (totalQueries >= 10)  badges.push('Analyst');
  if (avg >= 70)           badges.push('Precision Thinker');
  if (avg >= 85)           badges.push('Domain Expert');
  if (totalScore >= 500)   badges.push('Power User');
  return { score:Math.round(totalScore), level, totalQueries, badges, streak:Math.min(totalQueries,7) };
}

/* ═══════════════════════════════════════════════
   CHART RENDERER
═══════════════════════════════════════════════ */
const PIE_COLORS = [C.blue,C.violet,C.emerald,C.amber,C.rose,C.teal];
function ChartRenderer({ spec }:{ spec:ChartSpec }) {
  const tip = { contentStyle:{ borderRadius:10,border:'none',boxShadow:'0 8px 24px rgba(0,0,0,0.1)',fontSize:11 } };
  if (spec.type==='pie') return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart><Pie data={spec.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({name,value}:{name:string;value:number})=>`${name} ${value}%`} labelLine={false}>
        {spec.data.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
      </Pie><Tooltip {...tip}/></PieChart>
    </ResponsiveContainer>
  );
  if (spec.type==='radar') return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={spec.data}>
        <PolarGrid stroke="#e5e7eb"/><PolarAngleAxis dataKey="axis" tick={{fontSize:10,fill:'#6b7280'}}/>
        <PolarRadiusAxis angle={90} domain={[0,100]} tick={{fontSize:9,fill:'#9ca3af'}} tickCount={4}/>
        {spec.dataKeys.map(dk=><Radar key={dk.key} name={dk.key} dataKey={dk.key} stroke={dk.color} fill={dk.color} fillOpacity={0.2} strokeWidth={2}/>)}
        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}}/><Tooltip {...tip}/>
      </RadarChart>
    </ResponsiveContainer>
  );
  if (spec.type==='area') return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={spec.data} margin={{top:4,right:4,bottom:0,left:-10}}>
        <defs>{spec.dataKeys.map(dk=><linearGradient key={dk.key} id={`g${dk.key.replace(/\W/g,'')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={dk.color} stopOpacity={0.3}/><stop offset="95%" stopColor={dk.color} stopOpacity={0.02}/></linearGradient>)}</defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey={spec.xKey} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...tip}/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}}/>
        {spec.dataKeys.map(dk=><Area key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} strokeWidth={2} fill={`url(#g${dk.key.replace(/\W/g,'')})`} dot={false} connectNulls={false}/>)}
      </AreaChart>
    </ResponsiveContainer>
  );
  if (spec.type==='line') return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={spec.data} margin={{top:4,right:4,bottom:0,left:-10}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey={spec.xKey} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...tip}/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}}/>
        {spec.dataKeys.map(dk=><Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} strokeWidth={2} dot={{r:3,fill:dk.color}} activeDot={{r:5}} connectNulls={false}/>)}
      </LineChart>
    </ResponsiveContainer>
  );
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={spec.data} margin={{top:4,right:4,bottom:0,left:-10}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey={spec.xKey} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...tip}/><Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:10}}/>
        {spec.dataKeys.map(dk=><Bar key={dk.key} dataKey={dk.key} fill={dk.color} radius={[3,3,0,0]}/>)}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ═══════════════════════════════════════════════
   THEME HELPERS
═══════════════════════════════════════════════ */
function themeConfig(theme:QueryTheme) {
  const map = {
    'strong-green':{ bg:'from-emerald-50/60 to-teal-50/40', border:'border-emerald-200', accent:'text-emerald-700', subtle:'text-emerald-600', badge:'bg-emerald-100 text-emerald-800 border-emerald-200', dot:'bg-emerald-500', ring:'#10b981', panel:'bg-emerald-50/50', forecastBorder:'border-emerald-100', btnGrad:'from-emerald-500 to-teal-600', label:'Excellent', pageTint:'from-emerald-50/30' },
    'green':       { bg:'from-green-50/50 to-emerald-50/30', border:'border-green-200',   accent:'text-green-700',   subtle:'text-green-600',   badge:'bg-green-100 text-green-800 border-green-200',     dot:'bg-green-500',   ring:'#22c55e', panel:'bg-green-50/50',   forecastBorder:'border-green-100',   btnGrad:'from-green-500 to-emerald-600', label:'Strong',    pageTint:'from-green-50/20'  },
    'golden':      { bg:'from-amber-50/50 to-yellow-50/30',  border:'border-amber-200',   accent:'text-amber-700',   subtle:'text-amber-600',   badge:'bg-amber-100 text-amber-800 border-amber-200',     dot:'bg-amber-500',   ring:'#d97706', panel:'bg-amber-50/50',   forecastBorder:'border-amber-100',   btnGrad:'from-amber-500 to-yellow-500', label:'Good',      pageTint:'from-amber-50/20'  },
    'neutral':     { bg:'from-slate-50/40 to-gray-50/20',    border:'border-slate-200',   accent:'text-slate-700',   subtle:'text-slate-600',   badge:'bg-slate-100 text-slate-800 border-slate-200',     dot:'bg-slate-400',   ring:'#94a3b8', panel:'bg-slate-50/50',   forecastBorder:'border-slate-100',   btnGrad:'from-slate-500 to-gray-600',  label:'Moderate',  pageTint:'from-slate-50/20'  },
    'red':         { bg:'from-red-50/50 to-rose-50/30',      border:'border-red-200',     accent:'text-red-700',     subtle:'text-red-600',     badge:'bg-red-100 text-red-800 border-red-200',           dot:'bg-red-500',     ring:'#ef4444', panel:'bg-red-50/50',     forecastBorder:'border-red-100',     btnGrad:'from-red-500 to-rose-600',    label:'Weak',      pageTint:'from-red-50/20'    },
    'weak-red':    { bg:'from-rose-50/60 to-red-50/40',      border:'border-rose-200',    accent:'text-rose-700',    subtle:'text-rose-600',    badge:'bg-rose-100 text-rose-800 border-rose-200',         dot:'bg-rose-500',    ring:'#f43f5e', panel:'bg-rose-50/50',    forecastBorder:'border-rose-100',    btnGrad:'from-rose-500 to-red-600',    label:'Very Weak', pageTint:'from-rose-50/30'   },
  };
  return map[theme];
}

/* ═══════════════════════════════════════════════
   EXPLAINABLE AI PANEL
═══════════════════════════════════════════════ */
function ExplainableAIPanel({ intel, onUseEnhanced }:{ intel:QueryIntelligence; onUseEnhanced:(q:string)=>void }) {
  const [tab, setTab] = useState<'reasoning'|'bias'|'gaps'|'scenarios'>('reasoning');
  const [expandScenario, setExpandScenario] = useState<number|null>(null);
  const tc = themeConfig(intel.theme);
  const isStrong = intel.score >= 52;
  const ScoreIcon = intel.score>=68 ? CheckCircle2 : intel.score>=40 ? Info : XCircle;
  const circumference = 2*Math.PI*26;
  const dashOffset = circumference - (intel.score/100)*circumference;

  return (
    <motion.div className={`rounded-2xl border ${tc.border} ${tc.bg} bg-gradient-to-br p-5 mb-6`}
      initial={{ opacity:0,y:14,scale:0.98 }} animate={{ opacity:1,y:0,scale:1 }}
      transition={{ type:'spring',stiffness:200,damping:22 }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isStrong?'bg-emerald-100':'bg-red-100'}`}>
            <ScoreIcon className={`w-5 h-5 ${tc.accent}`}/>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[14px] font-extrabold leading-tight ${tc.accent}`}>{intel.verdict}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tc.badge}`}>{tc.label} · {intel.domain}</span>
              {intel.biasFlags.length > 0 && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">{intel.biasFlags.length} bias flag{intel.biasFlags.length>1?'s':''}</span>}
            </div>
          </div>
        </div>

        {/* Confidence ring */}
        <div className="flex flex-col items-center shrink-0">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
            <circle cx="30" cy="30" r="26" fill="none" stroke={tc.ring} strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" transform="rotate(-90 30 30)"/>
            <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="800" fill={tc.ring}>{intel.score}</text>
          </svg>
          <p className={`text-[9px] font-bold uppercase tracking-wider ${tc.subtle} -mt-1`}>Quality</p>
        </div>
      </div>

      {/* Explanation */}
      <p className={`text-[12px] leading-relaxed mb-4 ${tc.accent}`}>{intel.explanation}</p>

      {/* Confidence meter with justification */}
      <div className={`rounded-xl px-3.5 py-3 mb-4 ${tc.panel} border ${tc.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${tc.accent}`}>AI Confidence Meter</span>
          <span className={`text-[11px] font-bold ${tc.accent}`}>{intel.confidence}%</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
          <motion.div className="h-full rounded-full" style={{ background:tc.ring }}
            initial={{ width:0 }} animate={{ width:`${intel.confidence}%` }} transition={{ delay:0.2,duration:0.7,ease:'easeOut' }}/>
        </div>
        <p className={`text-[10.5px] leading-snug ${tc.subtle}`}>{intel.confidenceJustification}</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {(['reasoning','bias','gaps','scenarios'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all border ${tab===t?`${tc.badge} border-current`:'bg-white/50 text-gray-500 border-gray-200 hover:bg-white'}`}>
            {t==='reasoning'?'AI Reasoning':t==='bias'?`Bias Flags ${intel.biasFlags.length>0?`(${intel.biasFlags.length})`:''}`:t==='gaps'?'Knowledge Gaps':'Scenarios'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Reasoning tab */}
        {tab==='reasoning' && (
          <motion.div key="reasoning" initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            {isStrong && intel.strengths.length>0 && (
              <div className="mb-3">
                <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${tc.accent}`}>Why this query works</p>
                {intel.strengths.map((s,i)=>(
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${tc.dot} mt-1.5 shrink-0`}/>
                    <p className={`text-[11.5px] ${tc.accent}`}>{s}</p>
                  </div>
                ))}
              </div>
            )}
            {!isStrong && intel.gaps.length>0 && (
              <div className="mb-3">
                <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${tc.accent}`}>Identified gaps</p>
                {intel.gaps.map((g,i)=>(
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${tc.dot} mt-1.5 shrink-0`}/>
                    <p className={`text-[11.5px] ${tc.accent}`}>{g}</p>
                  </div>
                ))}
              </div>
            )}
            {intel.suggestions.length>0 && (
              <div className={`rounded-xl p-3 ${tc.panel} border ${tc.border}`}>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${tc.accent}`}>{isStrong?'Optimise further':'Actionable fixes'}</p>
                {intel.suggestions.map((s,i)=><p key={i} className={`text-[11px] mb-1 ${tc.subtle}`}>→ {s}</p>)}
              </div>
            )}
          </motion.div>
        )}

        {/* Bias flags tab */}
        {tab==='bias' && (
          <motion.div key="bias" initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            {intel.biasFlags.length===0 ? (
              <div className="flex items-center gap-2 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                <p className="text-[12px] text-emerald-700 font-semibold">No bias flags detected. Query is well-formed.</p>
              </div>
            ) : intel.biasFlags.map((bf,i)=>(
              <div key={i} className={`rounded-xl p-3 mb-2 border ${bf.severity==='high'?'bg-red-50 border-red-200':bf.severity==='medium'?'bg-orange-50 border-orange-200':'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${bf.severity==='high'?'text-red-600':'text-orange-600'}`}/>
                  <span className={`text-[10px] font-bold uppercase ${bf.severity==='high'?'text-red-700':'text-orange-700'}`}>{bf.severity} · {bf.type}</span>
                </div>
                <p className={`text-[11.5px] ${bf.severity==='high'?'text-red-800':'text-orange-800'}`}>{bf.message}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Knowledge gaps tab */}
        {tab==='gaps' && (
          <motion.div key="gaps" initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-3 ${tc.accent}`}>Missing context in your query</p>
            {intel.knowledgeGaps.map((g,i)=>(
              <div key={i} className="flex items-start gap-2 mb-2">
                <Info className={`w-3.5 h-3.5 ${tc.subtle} shrink-0 mt-0.5`}/>
                <p className={`text-[11.5px] ${tc.accent}`}>{g}</p>
              </div>
            ))}
            <div className={`mt-3 p-3 rounded-xl ${tc.panel} border ${tc.border}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${tc.accent}`}>Auto-enhanced query suggestion</p>
              <p className={`text-[11px] italic ${tc.subtle} mb-2`}>"{intel.autoEnhanced}"</p>
              <button onClick={()=>onUseEnhanced(intel.autoEnhanced)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r ${tc.btnGrad} text-white shadow-sm`}>
                <Wand2 className="w-3 h-3"/> Use this query
              </button>
            </div>
          </motion.div>
        )}

        {/* Scenarios tab */}
        {tab==='scenarios' && (
          <motion.div key="scenarios" initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-3 ${tc.accent}`}>Interactive scenario simulator</p>
            {intel.scenarios.map((sc,i)=>(
              <motion.div key={i}
                className={`rounded-xl border mb-2 overflow-hidden cursor-pointer ${expandScenario===i?tc.panel:''} ${sc.impact==='positive'?'border-emerald-200':sc.impact==='negative'?'border-red-200':'border-gray-200'}`}
                onClick={()=>setExpandScenario(expandScenario===i?null:i)}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {sc.impact==='positive'?<TrendingUp className="w-3.5 h-3.5 text-emerald-600"/>:sc.impact==='negative'?<TrendingDown className="w-3.5 h-3.5 text-red-600"/>:<Activity className="w-3.5 h-3.5 text-slate-500"/>}
                    <span className="text-[12px] font-semibold text-gray-800">{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold ${sc.delta>0?'text-emerald-600':sc.delta<0?'text-red-600':'text-gray-500'}`}>{sc.delta>0?'+':''}{sc.delta}%</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandScenario===i?'rotate-180':''}`}/>
                  </div>
                </div>
                <AnimatePresence>
                  {expandScenario===i && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.2 }}
                      className="px-3 pb-2.5 border-t border-gray-100">
                      <p className="text-[11px] text-gray-600 mt-2">{sc.description}</p>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full ${sc.impact==='positive'?'bg-emerald-500':sc.impact==='negative'?'bg-red-400':'bg-slate-400'}`}
                          initial={{ width:0 }} animate={{ width:`${Math.min(100,intel.score+sc.delta)}%` }} transition={{ duration:0.5 }}/>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Projected score: {Math.max(0,Math.min(100,intel.score+sc.delta))}/100</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   KEYWORD HEATMAP
═══════════════════════════════════════════════ */
function KeywordHeatmap({ words }:{ words:{word:string;strength:number;color:string}[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-violet-500"/>
        <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">Keyword Strength Heatmap</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((w,i)=>(
          <motion.div key={i}
            className="relative flex flex-col items-center gap-1"
            initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*0.05 }}>
            <div className="relative">
              <span className="absolute inset-0 rounded-lg blur-sm opacity-30" style={{ background:w.color }}/>
              <span className="relative px-2.5 py-1 rounded-lg text-white text-[11px] font-bold" style={{ background:w.color }}>
                {w.word}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden" style={{ minWidth:40 }}>
              <motion.div className="h-full rounded-full" style={{ background:w.color }}
                initial={{ width:0 }} animate={{ width:`${w.strength}%` }} transition={{ delay:0.2+i*0.04,duration:0.4 }}/>
            </div>
            <span className="text-[9px] text-gray-400 font-bold">{w.strength}%</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-gray-50">
        {[{c:'#10b981',l:'Strong (>65)'},{c:'#f59e0b',l:'Moderate (35–65)'},{c:'#ef4444',l:'Weak (<35)'}].map((leg,i)=>(
          <div key={i} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background:leg.c }}/>
            <span className="text-[9px] text-gray-400">{leg.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FUTURE IMPACT + ALTERNATIVE PERSPECTIVES
═══════════════════════════════════════════════ */
function FutureImpactRow({ intel, onAltQuery }:{ intel:QueryIntelligence; onAltQuery:(q:string)=>void }) {
  const tc = themeConfig(intel.theme);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      {/* Future Impact Score */}
      <div className={`rounded-2xl border ${tc.border} p-4 ${tc.panel} bg-gradient-to-br`}>
        <div className="flex items-center gap-2 mb-2">
          <Telescope className={`w-4 h-4 ${tc.accent}`}/>
          <p className={`text-[11px] font-extrabold uppercase tracking-wider ${tc.accent}`}>Future Impact Score</p>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-[36px] font-extrabold leading-none ${tc.accent}`}>{intel.futureImpactScore}</span>
          <span className={`text-[13px] ${tc.subtle} mb-1`}>/100</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
          <motion.div className="h-full rounded-full" style={{ background:tc.ring }}
            initial={{ width:0 }} animate={{ width:`${intel.futureImpactScore}%` }} transition={{ delay:0.3,duration:0.7 }}/>
        </div>
        <p className={`text-[10.5px] leading-snug ${tc.subtle}`}>
          {intel.futureImpactScore>=75?'High long-term strategic relevance — insights likely to remain valid 5+ years':
           intel.futureImpactScore>=50?'Moderate long-term relevance — refine for better 5-year alignment':
           'Low future relevance — query too narrow or vague for long-term forecasting'}
        </p>
      </div>

      {/* Alternative perspectives */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-500"/>
          <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">Alternative Perspectives</p>
        </div>
        <div className="space-y-2">
          {intel.alternativePerspectives.map((alt,i)=>{
            const AIcon = alt.icon;
            return (
              <motion.button key={i} onClick={()=>onAltQuery(alt.query)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left group"
                whileHover={{ x:2 }}>
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <AIcon className="w-3 h-3 text-indigo-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{alt.domain}</p>
                  <p className="text-[11px] font-semibold text-gray-700 truncate">{alt.query}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 shrink-0"/>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GAMIFICATION BAR
═══════════════════════════════════════════════ */
function GamificationBar({ gami }:{ gami:GamificationState }) {
  const levelColors:Record<UserLevel,string> = { beginner:'text-slate-600', intermediate:'text-blue-600', advanced:'text-violet-600', expert:'text-amber-600' };
  const LevelIcon = gami.level==='expert'?Trophy:gami.level==='advanced'?Award:gami.level==='intermediate'?Star:BookOpen;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-5 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <LevelIcon className={`w-4 h-4 ${levelColors[gami.level]}`}/>
        <span className={`text-[12px] font-extrabold ${levelColors[gami.level]} capitalize`}>{gami.level}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5 text-orange-500"/>
        <span className="text-[11px] font-bold text-gray-600">{gami.streak} streak</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-blue-500"/>
        <span className="text-[11px] font-bold text-gray-600">{gami.score} pts</span>
      </div>
      {gami.badges.slice(0,3).map((badge,i)=>(
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-bold text-violet-700">
          <Award className="w-2.5 h-2.5"/> {badge}
        </span>
      ))}
      {gami.badges.length>3 && <span className="text-[10px] text-gray-400">+{gami.badges.length-3} more</span>}
      <div className="ml-auto hidden sm:flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400">{gami.totalQueries} queries</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SPLIT-SCREEN MODE
═══════════════════════════════════════════════ */
function SplitScreen({ left, right, onClose }:{ left:QueryResult; right:QueryResult|null; onClose:()=>void }) {
  const tcL = themeConfig(left.intelligence.theme);
  const tcR = right ? themeConfig(right.intelligence.theme) : null;
  return (
    <motion.div className="fixed inset-0 z-[995] bg-gray-900/80 backdrop-blur-sm flex flex-col"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="w-4 h-4 text-white"/>
          <span className="text-[13px] font-bold text-white">Split-Screen Query Comparison</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
          <X className="w-4 h-4 text-white"/>
        </button>
      </div>
      <div className="flex-1 overflow-auto grid grid-cols-2 gap-0">
        {[left, right].map((res,i)=>{
          if (!res) return (
            <div key={i} className="flex items-center justify-center bg-gray-800/50 text-gray-500 text-sm">
              Run a second query to compare
            </div>
          );
          const tc = i===0 ? tcL : tcR!;
          return (
            <div key={i} className={`overflow-auto p-5 ${i===0?'border-r border-gray-700':''} bg-gray-50`}>
              <div className={`rounded-xl border ${tc.border} ${tc.panel} p-4 mb-4`}>
                <p className={`text-[12px] font-bold ${tc.accent} mb-1`}>"{res.query}"</p>
                <div className="flex items-center gap-3">
                  <span className={`text-[22px] font-extrabold ${tc.accent}`}>{res.intelligence.score}</span>
                  <div className="flex-1">
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${res.intelligence.score}%`, background:tc.ring }}/>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${tc.badge} px-2 py-0.5 rounded-full`}>{tc.label}</span>
                </div>
                <p className={`text-[11px] ${tc.subtle} mt-2 leading-snug`}>{res.intelligence.verdict}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {res.kpis.slice(0,4).map((kpi,j)=>(
                  <div key={j} className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-[16px] font-extrabold text-gray-900">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   GOAL MODE SELECTOR
═══════════════════════════════════════════════ */
function GoalModeBar({ mode, onChange }:{ mode:GoalMode; onChange:(m:GoalMode)=>void }) {
  const modes:{ id:GoalMode; label:string; icon:React.ComponentType<any>; desc:string }[] = [
    { id:'business', label:'Business', icon:Briefcase, desc:'ROI-driven, KPI-focused' },
    { id:'learning', label:'Learning', icon:GraduationCap, desc:'Deep explanations & context' },
    { id:'research', label:'Research', icon:BookOpen, desc:'Comprehensive data analysis' },
  ];
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {modes.map(m=>{
        const MIcon = m.icon;
        const active = mode===m.id;
        return (
          <motion.button key={m.id} onClick={()=>onChange(m.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${active?'bg-zinc-900 text-white border-transparent shadow-sm':'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700'}`}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <MIcon className="w-3 h-3"/> {m.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REAL-TIME INPUT CORRECTION
═══════════════════════════════════════════════ */
function InputCorrection({ value }:{ value:string }) {
  if (value.length < 3) return null;
  const strongMatches = STRONG_KW.filter(k => value.toLowerCase().includes(k));
  const score = Math.min(100, 30 + strongMatches.length*10 + (value.split(' ').length>2?15:0));
  const col = score>=65?'text-emerald-600 bg-emerald-50 border-emerald-200':score>=40?'text-amber-600 bg-amber-50 border-amber-200':'text-red-600 bg-red-50 border-red-200';
  const label = score>=65?'Strong':'Fair';
  return (
    <motion.div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10.5px] font-bold ${col} mt-2`}
      initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
      <div className="flex gap-0.5">
        {[0,1,2,3,4].map(i=>(
          <span key={i} className={`w-1.5 h-3 rounded-sm ${i<Math.ceil(score/20)?'opacity-100':'opacity-20'}`} style={{ background:'currentColor' }}/>
        ))}
      </div>
      Signal: {label} ({score}/100)
      {strongMatches.length>0 && <span className="ml-1 opacity-70">· {strongMatches.slice(0,2).join(', ')}</span>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   5-YEAR FORECAST SECTION
═══════════════════════════════════════════════ */
function ForecastSection({ result }:{ result:QueryResult }) {
  const tc = themeConfig(result.intelligence.theme);
  return (
    <motion.div className="mb-6" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
      <div className={`flex items-center justify-between mb-4 p-4 rounded-2xl border ${tc.border} ${tc.panel} bg-gradient-to-br`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tc.panel}`}>
            <Telescope className={`w-4 h-4 ${tc.accent}`}/>
          </div>
          <div>
            <h2 className={`text-[13px] font-extrabold tracking-tight ${tc.accent}`}>5-Year Predictive Analytics (2025–2030)</h2>
            <p className={`text-[11px] mt-0.5 ${tc.subtle}`}>
              {result.intelligence.score>=65?'High-confidence multi-scenario projections based on strong query signal':result.intelligence.score>=40?'Moderate-confidence projections — refine query to improve accuracy':'Low-confidence projections — query signal insufficient for reliable forecasting'}
            </p>
          </div>
        </div>
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${tc.badge}`}>
          <Gauge className="w-3.5 h-3.5"/> {result.intelligence.confidence}% confidence
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {result.forecastCharts.map((spec,ci)=>(
          <motion.div key={ci} className={`bg-white rounded-2xl border ${tc.forecastBorder} shadow-sm p-4`}
            initial={{ opacity:0,scale:0.97,y:10 }} animate={{ opacity:1,scale:1,y:0 }}
            transition={{ delay:0.12+ci*0.1,type:'spring',stiffness:220,damping:22 }}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>
              <p className="text-[10.5px] font-extrabold text-gray-700 uppercase tracking-wider">{spec.title}</p>
            </div>
            <ChartRenderer spec={spec}/>
            <p className={`text-[9.5px] mt-1.5 text-center font-medium ${tc.subtle}`}>
              {result.intelligence.confidence}% confidence · {result.intelligence.domain} domain
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
interface SmartSuggestionsProps { onNavigate: (page: Page) => void }

export function SmartSuggestions({ onNavigate }: SmartSuggestionsProps) {
  const { isAuthenticated, currentUser, addNotification, setLastQuery, pendingQuery, setPendingQuery } = useApp();

  const [inputValue,    setInputValue]    = useState('');
  const [hasQueried,    setHasQueried]    = useState(false);
  const [isAnalysing,   setIsAnalysing]   = useState(false);
  const [result,        setResult]        = useState<QueryResult | null>(null);
  const [prevResult,    setPrevResult]    = useState<QueryResult | null>(null);
  const [revealedMods,  setRevealedMods]  = useState<ModuleKey[]>([]);
  const [conversation,  setConversation]  = useState<{role:'user'|'ai';text:string}[]>([]);
  const [selectedCard,  setSelectedCard]  = useState<Suggestion | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForecast,  setShowForecast]  = useState(false);
  const [showSplit,     setShowSplit]     = useState(false);
  const [goalMode,      setGoalMode]      = useState<GoalMode>('business');
  const [totalScore,    setTotalScore]    = useState(0);
  const [totalQueries,  setTotalQueries]  = useState(0);
  const [isVoice,       setIsVoice]       = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [decisionDNA,   setDecisionDNA]   = useState<DecisionDNAData | null>(null);
  const [aiVsHuman,     setAiVsHuman]     = useState<AIvsHumanData | null>(null);
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);

  const inputRef   = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const gamification = useMemo(()=>computeGamification(totalQueries,totalScore),[totalQueries,totalScore]);

  useEffect(() => {
    if (!result) return;
    setRevealedMods([]);
    result.modules.forEach((mod,i) => {
      setTimeout(()=>setRevealedMods(prev=>[...prev,mod]),200+i*180);
    });
    setShowForecast(false);
    setTimeout(()=>setShowForecast(true),800);
  }, [result]);

  const executeQuery = useCallback((q:string) => {
    if (!q.trim() || isAnalysing) return;
    setLastQuery(q);
    setConversation(prev=>[...prev,{role:'user',text:q}]);
    setInputValue('');
    setHasQueried(true);
    setIsAnalysing(true);
    if (result) setPrevResult(result);
    setResult(null);
    setTimeout(()=>{
      const tpl = classify(q);
      const intelligence = analyzeIntelligence(q);
      const forecastCharts = generateForecast(q,intelligence);
      const res: QueryResult = { ...tpl, query:q, intelligence, forecastCharts };
      setResult(res);
      /* Decision Intelligence modules */
      setDecisionDNA(generateDecisionDNA(q, intelligence.domain, intelligence.score, intelligence.confidence));
      setAiVsHuman(generateAIvsHuman(q, intelligence.domain, intelligence.score, intelligence.confidence));
      setTimelineNodes(generateTimeline(q, intelligence.domain, intelligence.score));
      setIsAnalysing(false);
      setTotalScore(prev=>prev+intelligence.score);
      setTotalQueries(prev=>prev+1);
      setConversation(prev=>[...prev,{role:'ai',text:res.summary}]);
      if (res.notif) addNotification(res.notif);
      /* Gamification notifications */
      if (intelligence.score>=85) addNotification({ title:'Exceptional Query!', body:`Score: ${intelligence.score}/100 — Expert-level business analysis.`, type:'success' });
      else if (intelligence.score<30) addNotification({ title:'Query Needs Improvement', body:'Try adding domain, metric, or time horizon for better results.', type:'alert' });
      setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    },1700);
  },[isAnalysing,setLastQuery,addNotification,result]);

  const runQuery = useCallback((text?:string) => {
    const q = (text ?? inputValue).trim();
    if (!q) return;
    if (!isAuthenticated) { setPendingQuery(q); setShowAuthModal(true); return; }
    executeQuery(q);
  },[inputValue,isAuthenticated,setPendingQuery,executeQuery]);

  const handleAuthSuccess = useCallback((q:string) => {
    setShowAuthModal(false); setPendingQuery('');
    setTimeout(()=>executeQuery(q||inputValue),180);
  },[executeQuery,inputValue,setPendingQuery]);

  const handleSearchFocus = () => {
    if (!isAuthenticated) { setPendingQuery(inputValue); setShowAuthModal(true); inputRef.current?.blur(); }
  };

  const resetAll = () => {
    setHasQueried(false); setResult(null); setPrevResult(null);
    setRevealedMods([]); setConversation([]); setInputValue(''); setShowForecast(false);
    setDecisionDNA(null); setAiVsHuman(null); setTimelineNodes([]);
    setTimeout(()=>inputRef.current?.focus(),150);
  };

  const tc = result ? themeConfig(result.intelligence.theme) : null;
  const pageBg = tc ? `bg-gradient-to-b ${tc.pageTint} via-[#f7f8fa] to-[#f7f8fa]` : 'bg-[#f7f8fa]';

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-700 ${pageBg}`}>
      <FloatingParticles />
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8">

        {/* HERO */}
        <motion.div className="text-center"
          animate={hasQueried?{paddingTop:'2rem',paddingBottom:'1rem'}:{paddingTop:'6rem',paddingBottom:'0rem'}}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}>
          <motion.div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 mb-5"
            initial={{ opacity:0,y:-12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse"/>
            <span className="text-[10.5px] text-zinc-500 font-semibold tracking-widest uppercase">Next-Gen AI Intelligence Platform</span>
          </motion.div>
          <motion.h1 className="font-extrabold text-black leading-[1.1] tracking-tight"
            animate={hasQueried?{fontSize:'1.6rem'}:{fontSize:'2.75rem'}} style={{fontSize:'2.75rem'}}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}>
            Smart AI Suggestions
          </motion.h1>
          <AnimatePresence>
            {!hasQueried && (
              <motion.p className="text-[14px] text-zinc-400 max-w-[460px] mx-auto leading-relaxed mt-4"
                initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }}
                exit={{ opacity:0,y:-6,height:0,marginTop:0 }} transition={{ duration:0.3 }}>
                Emotion-aware AI that scores your query, detects bias, shows a 5-year forecast, and evolves the UI based on analytical depth.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* GOAL MODE */}
        <AnimatePresence>
          {!hasQueried && (
            <motion.div className="flex justify-center mb-4 mt-6"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <GoalModeBar mode={goalMode} onChange={setGoalMode}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH BAR */}
        <motion.div className="relative max-w-[680px] mx-auto mb-3"
          initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
          <div className={`absolute -inset-px rounded-[18px] blur-[6px] pointer-events-none transition-all duration-700 ${tc?`bg-gradient-to-r ${tc.bg} opacity-60`:'bg-zinc-200/30'}`}/>
          <div className="relative flex items-center gap-3 bg-white rounded-[18px] border border-zinc-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-3.5">
            <Search className={`w-[17px] h-[17px] shrink-0 transition-colors duration-500 ${tc?tc.accent.replace('text-','text-'):'text-zinc-400'}`}/>
            <input ref={inputRef} type="text" value={inputValue}
              onChange={e=>setInputValue(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={e=>{ if(e.key==='Enter') runQuery(); }}
              placeholder={isAuthenticated?'Ask anything — marketing ROI, market trends, risk score, financial analysis…':'Click to sign in and run AI-powered analysis…'}
              className="flex-1 bg-transparent outline-none text-[13.5px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              readOnly={!isAuthenticated}/>
            <AnimatePresence>
              {!isAuthenticated && (
                <motion.button initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.9 }}
                  onClick={()=>{ setPendingQuery(inputValue); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[11px] font-semibold shadow-sm shrink-0 transition-colors"
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.96 }}>
                  <Lock className="w-3 h-3"/> Sign in to analyse
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isAuthenticated && inputValue.trim() && (
                <motion.button initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0,opacity:0 }}
                  transition={{ type:'spring',stiffness:440,damping:26 }}
                  onClick={()=>runQuery()} disabled={isAnalysing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm disabled:opacity-50 shrink-0 transition-colors"
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.95 }}>
                  Analyse <Send className="w-3 h-3"/>
                </motion.button>
              )}
            </AnimatePresence>
            {isAuthenticated && (
              <motion.button onClick={()=>setIsVoice(v=>!v)} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors shrink-0 ${isVoice?'bg-red-50 text-red-500':'text-gray-300 hover:text-gray-500 hover:bg-gray-50'}`} whileTap={{ scale:0.93 }} title="Voice input (demo)">
                {isVoice?<MicOff className="w-4 h-4"/>:<Mic className="w-4 h-4"/>}
              </motion.button>
            )}

            {/* 💡 Intelligence Bulb — outline SVG, monochrome black, enterprise */}
            <motion.button
              onClick={()=>setShowAssistant(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
              whileHover={{ scale:1.08, boxShadow:'0 2px 12px rgba(0,0,0,0.10)' }}
              whileTap={{ scale:0.93 }}
              title="Intelligence Assistant — enhance query or analyse resume">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M10 2.5C7.1 2.5 4.75 4.85 4.75 7.75c0 1.9 1 3.55 2.5 4.5v1.5c0 .28.22.5.5.5h4.5c.28 0 .5-.22.5-.5v-1.5c1.5-.95 2.5-2.6 2.5-4.5C15.25 4.85 12.9 2.5 10 2.5z"/>
                <line x1="7.75" y1="16" x2="12.25" y2="16"/>
                <line x1="8.5" y1="17.5" x2="11.5" y2="17.5"/>
              </svg>
            </motion.button>

          </div>

          {/* Real-time correction */}
          <AnimatePresence>
            {isAuthenticated && inputValue.trim() && <InputCorrection value={inputValue}/>}
            {!isAuthenticated && !hasQueried && (
              <motion.p className="text-center text-[11px] text-zinc-400 mt-3"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                Free to browse · Sign in required to run AI analysis
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* QUICK PROMPTS — hidden on homepage, shown after search */}

        {/* CAPABILITY TILES — hidden on homepage, shown after search */}

        {/* LOADING */}
        <AnimatePresence>
          {isAnalysing && (
            <motion.div className="flex flex-col items-center py-16"
              initial={{ opacity:0,scale:0.94 }} animate={{ opacity:1,scale:1 }}
              exit={{ opacity:0,scale:0.94 }} transition={{ duration:0.28 }}>
              <div className="relative w-[56px] h-[56px] mb-5">
                {[0,1,2].map(i=>(
                  <motion.span key={i} className="absolute inset-0 rounded-full border border-blue-300/70"
                    animate={{ scale:[1,2.1,1],opacity:[0.5,0,0.5] }}
                    transition={{ duration:1.9,repeat:Infinity,delay:i*0.5 }}/>
                ))}
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-md">
                  <Brain className="w-6 h-6 text-blue-600"/>
                </div>
              </div>
              <p className="text-[14px] font-extrabold text-gray-800 mb-1">Deep AI analysis running…</p>
              <p className="text-[12px] text-gray-400 mb-5">Bias detection · Confidence scoring · 5-year forecast · Gamification</p>
              <div className="flex gap-2">
                {['Scoring','Bias Check','Forecast','Insights'].map((lbl,i)=>(
                  <motion.span key={lbl} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-blue-100 text-blue-600 font-bold shadow-sm"
                    animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.2,repeat:Infinity,delay:i*0.25 }}>
                    {lbl}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS */}
        <AnimatePresence>
          {result && !isAnalysing && (
            <motion.div ref={resultsRef} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>

              {/* Gamification bar */}
              <GamificationBar gami={gamification}/>

              {/* Action bar */}
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {prevResult && (
                    <motion.button onClick={()=>setShowSplit(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-all"
                      whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                      <SplitSquareHorizontal className="w-3.5 h-3.5"/> Compare
                    </motion.button>
                  )}
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${tc!.badge}`}>{result.intelligence.domain} domain</span>
                </div>
                <motion.button onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                  <RefreshCw className="w-3 h-3"/> New query
                </motion.button>
              </div>

              {/* ═══ Decision DNA Profile ═══ */}
              {decisionDNA && <DecisionDNA dna={decisionDNA} />}

              {/* ═══ AI vs Human Thinking ═══ */}
              {aiVsHuman && <AIvsHumanThinking data={aiVsHuman} />}

              {/* ═══ Decision Consequence Timeline ═══ */}
              {timelineNodes.length > 0 && <DecisionTimeline nodes={timelineNodes} />}

              {/* Explainable AI Panel */}
              <ExplainableAIPanel intel={result.intelligence} onUseEnhanced={q=>runQuery(q)}/>

              {/* Keyword heatmap */}
              <KeywordHeatmap words={result.intelligence.keywordStrengths}/>

              {/* Future impact + alternatives */}
              <FutureImpactRow intel={result.intelligence} onAltQuery={q=>runQuery(q)}/>

              {/* Conversation thread */}
              <div className="mb-5 space-y-2.5">
                {conversation.map((msg,i)=>(
                  <motion.div key={i} className={`flex items-end gap-2.5 ${msg.role==='user'?'justify-end':'justify-start'}`}
                    initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}>
                    {msg.role==='ai' && (
                      <div className="w-[30px] h-[30px] rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        <Bot className="w-[14px] h-[14px] text-white"/>
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl ${msg.role==='user'?'bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-br-[4px] shadow-lg shadow-blue-500/20':'bg-white border border-gray-100 text-gray-700 rounded-bl-[4px] shadow-sm'}`}>
                      {msg.text}
                    </div>
                    {msg.role==='user' && (
                      <div className="w-[30px] h-[30px] rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-[10px] font-extrabold text-gray-500">
                        {currentUser?.fullName?.charAt(0)?? 'U'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {result.kpis.map((kpi,i)=>(
                  <motion.div key={i} className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100/80 shadow-sm"
                    initial={{ opacity:0,y:10,scale:0.96 }} animate={{ opacity:1,y:0,scale:1 }}
                    transition={{ delay:0.08+i*0.07,type:'spring',stiffness:260,damping:22 }}
                    whileHover={{ y:-2,boxShadow:'0 10px 28px rgba(0,0,0,0.07)' }}>
                    <p className="text-[11px] text-gray-400 font-semibold mb-1 tracking-wide uppercase">{kpi.label}</p>
                    <p className="text-[22px] font-extrabold text-gray-900 leading-none mb-2 tracking-tight">{kpi.value}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${kpi.up?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-600'}`}>
                      {kpi.up?<ArrowUp className="w-2.5 h-2.5"/>:<ArrowDown className="w-2.5 h-2.5"/>}{kpi.change}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Current-period charts */}
              {result.charts.length>0 && (
                <motion.div className={`grid gap-4 mb-6 ${result.charts.length>1?'grid-cols-1 sm:grid-cols-2':'grid-cols-1'}`}
                  initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
                  {result.charts.map((spec,ci)=>(
                    <motion.div key={ci} className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-4"
                      initial={{ opacity:0,scale:0.97 }} animate={{ opacity:1,scale:1 }} transition={{ delay:0.22+ci*0.1 }}>
                      <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-3">{spec.title}</p>
                      <ChartRenderer spec={spec}/>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* 5-Year Forecast */}
              <AnimatePresence>
                {showForecast && <ForecastSection result={result}/>}
              </AnimatePresence>

              {/* Module header + cards */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[14px] font-extrabold text-gray-900 tracking-tight">Live Intelligence Modules</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Click any module for the full deep-dive analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7">
                {result.modules.map(mod=>{
                  const M=MODULES[mod]; const MIcon=M.icon; const show=revealedMods.includes(mod);
                  return (
                    <AnimatePresence key={mod}>
                      {show && (
                        <motion.div className="group bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm cursor-pointer overflow-hidden relative"
                          initial={{ opacity:0,y:20,scale:0.96 }} animate={{ opacity:1,y:0,scale:1 }}
                          exit={{ opacity:0,scale:0.96 }} transition={{ type:'spring',stiffness:230,damping:24 }}
                          onClick={()=>onNavigate(M.page)}
                          whileHover={{ y:-4,boxShadow:'0 20px 44px rgba(0,0,0,0.09)' }} whileTap={{ scale:0.98 }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${M.iconBg} ${M.iconColor} flex items-center justify-center`}>
                              <MIcon style={{ width:17,height:17 }}/>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"/>
                          </div>
                          <h3 className="text-[13px] font-extrabold text-gray-900 mb-0.5">{M.label}</h3>
                          <p className="text-[11px] text-gray-400 leading-snug mb-4">{M.desc}</p>
                          <div className="space-y-2.5">
                            {M.metrics.map((m,j)=>(
                              <div key={j}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] text-gray-400 font-medium">{m.label}</span>
                                  <span className="text-[11px] font-extrabold text-gray-800">{m.value}</span>
                                </div>
                                {m.pct!==undefined && (
                                  <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div className={`h-full rounded-full ${M.barColor}`}
                                      initial={{ width:0 }} animate={{ width:`${m.pct}%` }}
                                      transition={{ delay:0.3+j*0.1,duration:0.55,ease:'easeOut' }}/>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3.5 border-t border-gray-50 flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${M.arrowColor}`}>Open full analysis</span>
                            <ArrowRight className={`w-3.5 h-3.5 ${M.arrowColor} group-hover:translate-x-0.5 transition-transform`}/>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.018] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"/>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {/* Follow-up */}
              <motion.div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-4 mb-8"
                initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.65 }}>
                <p className="text-[11px] text-gray-400 font-semibold mb-2.5 uppercase tracking-wide">Ask a follow-up</p>
                <div className="flex gap-2">
                  <input type="text" value={inputValue}
                    onChange={e=>setInputValue(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter') runQuery(); }}
                    placeholder="e.g. What is the biggest risk to our growth this quarter?"
                    className="flex-1 text-[13px] bg-gray-50/80 border border-gray-200 rounded-[12px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-gray-800 placeholder:text-gray-400 transition-all"/>
                  <motion.button onClick={()=>runQuery()} disabled={!inputValue.trim()||isAnalysing}
                    className="w-[42px] h-[42px] flex items-center justify-center rounded-[12px] bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-40"
                    whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}>
                    <Send className="w-[15px] h-[15px]"/>
                  </motion.button>
                </div>
              </motion.div>

              {/* Bottom spacing */}
              <div className="pb-12" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-query footer */}
        <AnimatePresence>
          {!hasQueried && (
            <motion.p className="text-center text-[11px] text-zinc-300 pb-16 mt-8"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ delay:0.6 }}>
              <span className="font-semibold text-zinc-400">CideDec</span>
              &nbsp;·&nbsp;Emotion-Aware AI · Bias Detection · 5-Year Forecasting · Gamification
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedCard && <SuggestionModal suggestion={selectedCard} onClose={()=>setSelectedCard(null)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {showAuthModal && (
          <SearchAuthModal pendingQuery={pendingQuery}
            onClose={()=>{ setShowAuthModal(false); setPendingQuery(''); }}
            onAuthSuccess={handleAuthSuccess}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSplit && result && (
          <SplitScreen left={result} right={prevResult} onClose={()=>setShowSplit(false)}/>
        )}
      </AnimatePresence>

      {/* ⭐ AI Assistant Modal */}
      <AnimatePresence>
        {showAssistant && (
          <AIAssistantModal
            onClose={()=>setShowAssistant(false)}
            initialQuery={inputValue || (result?.query ?? '')}
            onUseQuery={(q)=>{ setInputValue(q); setShowAssistant(false); setTimeout(()=>runQuery(q),120); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
