import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Star, Sparkles, Brain, Wand2, FileText, Upload, CheckCircle2,
  AlertTriangle, TrendingUp, Target, Lightbulb, ArrowRight, BarChart3,
  ChevronDown, ChevronUp, ClipboardList, Zap, DollarSign,
  RefreshCw, MapPin, Globe, Briefcase, Rocket, Bell,
  Users, Activity, Send,
} from 'lucide-react';
import { ApplyNowModal } from './ApplyNowModal';

/* ══════════════════════════════════════ TYPES ══════════════ */
type AssistMode = 'query' | 'resume';
type ResumeTab  = 'score' | 'jobs' | 'startup' | 'roadmap';
interface ResumeSection {
  title: string; score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'missing'; notes: string[];
}
interface JobOpportunity {
  title: string; company: string; domain: string;
  location: { city: string; state: string; country: string };
  platforms: string[]; salaryRange: string; demandLevel: 'high' | 'medium' | 'low';
  match: number; openings: number; applyUrl: string;
}
interface GeoHotspot {
  city: string; state: string; country: string;
  demandScore: number; avgSalary: string; openings: string;
  growthRate: string; icon: string;
}
interface StartupIdea {
  title: string; domain: string; description: string;
  bestLocations: { city: string; country: string; reason: string }[];
  fundingStage: string; marketSize: string; competitionLevel: 'low' | 'medium' | 'high';
  keySkillsRequired: string[]; timeToLaunch: string;
}
interface ResumeAnalysis {
  overallScore: number; atsScore: number; formattingScore: number; keywordsScore: number;
  summary: string; sections: ResumeSection[];
  skillsFound: string[]; skillsGap: string[];
  jobOpportunities: JobOpportunity[]; geoHotspots: GeoHotspot[];
  startupIdeas: StartupIdea[];
  roadmap: { phase: string; actions: string[]; timeline: string }[];
}
interface EnhancedQuery {
  original: string; enhanced: string;
  hiddenIntent: string[]; improvements: string[]; strategicInsights: string[];
  actionPlan: { step: string; priority: 'high' | 'medium' | 'low' }[];
  relatedAngles: string[]; professionalOutput: string;
}

/* ══════════════════════════════════════ HELPERS ═════════════ */
function sc(s: number) {
  if (s >= 80) return { text:'text-emerald-600', bg:'bg-emerald-50', border:'border-emerald-200', bar:'bg-emerald-500', ring:'#10b981' };
  if (s >= 60) return { text:'text-blue-600',    bg:'bg-blue-50',    border:'border-blue-200',    bar:'bg-blue-500',    ring:'#3b82f6' };
  if (s >= 40) return { text:'text-amber-600',   bg:'bg-amber-50',   border:'border-amber-200',   bar:'bg-amber-500',   ring:'#f59e0b' };
  return           { text:'text-red-600',     bg:'bg-red-50',     border:'border-red-200',     bar:'bg-red-500',     ring:'#ef4444' };
}
const demandColors = {
  high:'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium:'bg-amber-100 text-amber-700 border-amber-200',
  low:'bg-slate-100 text-slate-600 border-slate-200',
};
const statusLabel: Record<ResumeSection['status'], string> = { excellent:'Excellent', good:'Good', 'needs-work':'Needs Work', missing:'Missing' };
const statusColor: Record<ResumeSection['status'], string> = {
  excellent:'text-emerald-600 bg-emerald-50 border-emerald-200',
  good:'text-blue-600 bg-blue-50 border-blue-200',
  'needs-work':'text-amber-600 bg-amber-50 border-amber-200',
  missing:'text-red-600 bg-red-50 border-red-200',
};

function ScoreRing({ score, size = 64, stroke = 5 }: { score: number; size?: number; stroke?: number }) {
  const c = sc(score); const r = (size / 2) - stroke; const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.ring} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ}
          animate={{ strokeDashoffset: circ - (score/100)*circ }}
          transition={{ duration: 1.2, ease:'easeOut', delay: 0.3 }}/>
      </svg>
      <span className={`absolute text-[13px] font-extrabold ${c.text}`}>{score}</span>
    </div>
  );
}
function ThinkDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0,1,2].map(i=>(
        <motion.span key={i} className="w-1 h-1 rounded-full bg-current"
          animate={{ y:[0,-4,0], opacity:[0.4,1,0.4] }}
          transition={{ duration:0.7, repeat:Infinity, delay:i*0.15 }}/>
      ))}
    </span>
  );
}
function SectionBar({ s, i }: { s: ResumeSection; i: number }) {
  const [open, setOpen] = useState(false); const c = sc(s.score);
  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden`}>
      <button onClick={()=>setOpen(v=>!v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-gray-800">{s.title}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[s.status]}`}>{statusLabel[s.status]}</span>
              <span className={`text-[11px] font-extrabold ${c.text}`}>{s.score}</span>
              {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400"/> : <ChevronDown className="w-3.5 h-3.5 text-gray-400"/>}
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${c.bar}`} initial={{ width:0 }} animate={{ width:`${s.score}%` }}
              transition={{ duration:0.7, delay:0.1+i*0.07, ease:'easeOut' }}/>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
            className={`px-4 pb-3 border-t ${c.border} ${c.bg}`}>
            {s.notes.map((n,j)=>(
              <div key={j} className="flex items-start gap-2 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${c.bar} mt-1.5 shrink-0`}/>
                <p className={`text-[11.5px] leading-snug ${c.text}`}>{n}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════ RESUME ENGINE ══════ */
function buildResumeAnalysis(fileName: string, text: string): ResumeAnalysis {
  const hasSummary = /summary|profile|objective|about/i.test(text);
  const hasAction  = /led|built|improved|increased|reduced|delivered|launched|managed|designed|developed/i.test(text);
  const hasNumbers = /\d+%|\d+\s*(cr|l|k|m|lakh|crore|million)|₹|\$/i.test(text);
  const hasSkills  = /skill|proficiency|expertise|technologies/i.test(text);
  const isTech     = /python|javascript|react|node|sql|aws|cloud|software|developer|engineer/i.test(text);
  const isMktg     = /marketing|brand|campaign|seo|social media|content|digital/i.test(text);
  const isFin      = /finance|accounting|ca|cfa|cpa|audit|tax|investment|banking/i.test(text);
  const domain     = isTech ? 'tech' : isMktg ? 'marketing' : isFin ? 'finance' : 'strategy';

  const sections: ResumeSection[] = [
    { title:'Professional Summary', score:hasSummary?83:36, status:hasSummary?'good':'missing',
      notes:hasSummary?['Clear value proposition detected','Quantify 1–2 headline achievements (revenue, growth, team size)','Add target role + years of experience in opening line']:['Critical gap: no professional summary found','Recruiters spend 6 seconds — a strong 3-line summary is non-negotiable','Add: [Role] with [X years] in [domain] driving [key outcome]'] },
    { title:'Work Experience', score:hasAction?79:52, status:hasAction?'good':'needs-work',
      notes:hasAction?['Strong action verbs detected across bullet points','Add scope: team size, budget, revenue managed per role','Convert remaining descriptions to CAR format (Context→Action→Result)']:['Most bullet points lack impact verbs','Use: led, built, delivered, optimised, reduced, scaled, launched','Add at least 2 quantified outcomes per role (%, ₹, time, headcount)'] },
    { title:'Skills & Technologies', score:hasSkills?76:30, status:hasSkills?'good':'needs-work',
      notes:['Group into: Technical / Domain / Tools / Soft Skills','Add proficiency levels: Advanced / Intermediate / Familiar','Include platforms and certifications matching your target JD keywords'] },
    { title:'Quantified Achievements', score:hasNumbers?87:25, status:hasNumbers?'excellent':'missing',
      notes:hasNumbers?['Multiple metrics found — strong signal for recruiters','Ensure every bullet has at least one number, %, or monetary value','Frame as: "Improved X by Y% resulting in Z impact"']:['Zero quantified outcomes — highest-impact gap to fix','Add revenue generated, cost saved, growth driven, team managed','Even estimates work: "managed team of ~8", "saved ~30% on CAC"'] },
    { title:'Keywords & ATS Optimisation', score:56, status:'needs-work',
      notes:['Missing JD keywords: agile, cross-functional, stakeholder, P&L','Scan target JDs and mirror their exact phrasing','Use a dedicated Skills section so ATS parsers identify keywords cleanly'] },
    { title:'Format & Visual Design', score:72, status:'good',
      notes:['Clean structure detected — good baseline','Ensure consistent margins (0.5–1 inch) and font (Calibri / Garamond 10–11pt)','Add LinkedIn URL, city/country, and professional email in header'] },
    { title:'Education & Certifications', score:68, status:'good',
      notes:['Include graduation year and CGPA if above 7.5','Add in-progress certifications — signals proactive learning','List relevant academic projects or thesis for early-career roles'] },
  ];
  const overallScore = Math.round(sections.reduce((a,s)=>a+s.score,0)/sections.length);

  const jobsByDomain: Record<string, JobOpportunity[]> = {
    tech:[
      { title:'Senior Software Engineer', company:'Razorpay / Zepto / PhonePe', domain:'Fintech', location:{city:'Bengaluru',state:'Karnataka',country:'India'}, platforms:['LinkedIn','Naukri','AngelList'], salaryRange:'₹30–55 LPA', demandLevel:'high', match:88, openings:420, applyUrl:'https://linkedin.com/jobs' },
      { title:'Full Stack Developer', company:'Zomato / Swiggy / CRED', domain:'Consumer Tech', location:{city:'Gurugram',state:'Haryana',country:'India'}, platforms:['LinkedIn','Cutshort'], salaryRange:'₹20–40 LPA', demandLevel:'high', match:82, openings:310, applyUrl:'https://cutshort.io' },
      { title:'SDE — Backend', company:'Amazon / Microsoft / Google', domain:'Big Tech', location:{city:'Hyderabad',state:'Telangana',country:'India'}, platforms:['LinkedIn','Company Site'], salaryRange:'₹35–80 LPA', demandLevel:'high', match:74, openings:185, applyUrl:'https://linkedin.com/jobs' },
      { title:'Product Engineer', company:'Freshworks / Chargebee', domain:'SaaS', location:{city:'Chennai',state:'Tamil Nadu',country:'India'}, platforms:['LinkedIn','Instahyre'], salaryRange:'₹18–35 LPA', demandLevel:'medium', match:70, openings:94, applyUrl:'https://instahyre.com' },
    ],
    marketing:[
      { title:'Growth Marketing Manager', company:'Urban Company / Meesho', domain:'Consumer', location:{city:'Bengaluru',state:'Karnataka',country:'India'}, platforms:['LinkedIn','Naukri'], salaryRange:'₹15–28 LPA', demandLevel:'high', match:86, openings:160, applyUrl:'https://linkedin.com/jobs' },
      { title:'Performance Marketing Lead', company:'Dentsu / GroupM', domain:'Digital Agency', location:{city:'Mumbai',state:'Maharashtra',country:'India'}, platforms:['LinkedIn','Indeed'], salaryRange:'₹12–22 LPA', demandLevel:'high', match:80, openings:98, applyUrl:'https://linkedin.com/jobs' },
      { title:'Brand Strategy Manager', company:'HUL / ITC / Marico', domain:'FMCG', location:{city:'Mumbai',state:'Maharashtra',country:'India'}, platforms:['LinkedIn','Naukri'], salaryRange:'₹18–32 LPA', demandLevel:'medium', match:75, openings:55, applyUrl:'https://naukri.com' },
    ],
    finance:[
      { title:'Investment Banking Analyst', company:'Kotak / ICICI / Axis Capital', domain:'IB', location:{city:'Mumbai',state:'Maharashtra',country:'India'}, platforms:['LinkedIn','Naukri'], salaryRange:'₹12–24 LPA', demandLevel:'high', match:85, openings:210, applyUrl:'https://linkedin.com/jobs' },
      { title:'FP&A Manager', company:"Flipkart / Ola / Byju's", domain:'Startup Finance', location:{city:'Bengaluru',state:'Karnataka',country:'India'}, platforms:['LinkedIn','Instahyre'], salaryRange:'₹18–35 LPA', demandLevel:'high', match:79, openings:145, applyUrl:'https://linkedin.com/jobs' },
      { title:'Risk Analyst', company:'HDFC / SBI / JP Morgan', domain:'Banking', location:{city:'Pune',state:'Maharashtra',country:'India'}, platforms:['LinkedIn','Naukri','Indeed'], salaryRange:'₹8–18 LPA', demandLevel:'medium', match:72, openings:88, applyUrl:'https://naukri.com' },
    ],
    strategy:[
      { title:'Strategy Manager', company:'McKinsey / BCG / Bain', domain:'Consulting', location:{city:'Mumbai',state:'Maharashtra',country:'India'}, platforms:['LinkedIn','Company Site'], salaryRange:'₹28–55 LPA', demandLevel:'high', match:84, openings:72, applyUrl:'https://linkedin.com/jobs' },
      { title:'Business Analyst — Product', company:'Paytm / MakeMyTrip / OYO', domain:'Product Strategy', location:{city:'Gurugram',state:'Haryana',country:'India'}, platforms:['LinkedIn','Cutshort'], salaryRange:'₹14–28 LPA', demandLevel:'high', match:80, openings:190, applyUrl:'https://cutshort.io' },
      { title:'Operations Lead', company:'Blue Dart / Delhivery / Ecom Express', domain:'Logistics', location:{city:'Delhi',state:'Delhi',country:'India'}, platforms:['Naukri','LinkedIn'], salaryRange:'₹10–22 LPA', demandLevel:'medium', match:68, openings:130, applyUrl:'https://naukri.com' },
    ],
  };
  const geoByDomain: Record<string,GeoHotspot[]> = {
    tech:[{city:'Bengaluru',state:'Karnataka',country:'India',demandScore:96,avgSalary:'₹38 LPA',openings:'12,400+',growthRate:'+28% YoY',icon:'🏙️'},{city:'Hyderabad',state:'Telangana',country:'India',demandScore:88,avgSalary:'₹30 LPA',openings:'8,200+',growthRate:'+22% YoY',icon:'🌇'},{city:'Gurugram',state:'Haryana',country:'India',demandScore:82,avgSalary:'₹34 LPA',openings:'6,100+',growthRate:'+19% YoY',icon:'🌆'},{city:'Pune',state:'Maharashtra',country:'India',demandScore:76,avgSalary:'₹26 LPA',openings:'4,800+',growthRate:'+17% YoY',icon:'🏢'}],
    marketing:[{city:'Mumbai',state:'Maharashtra',country:'India',demandScore:92,avgSalary:'₹20 LPA',openings:'5,600+',growthRate:'+24% YoY',icon:'🏙️'},{city:'Bengaluru',state:'Karnataka',country:'India',demandScore:85,avgSalary:'₹18 LPA',openings:'4,200+',growthRate:'+21% YoY',icon:'🌆'},{city:'Delhi',state:'Delhi',country:'India',demandScore:78,avgSalary:'₹16 LPA',openings:'3,100+',growthRate:'+15% YoY',icon:'🌇'}],
    finance:[{city:'Mumbai',state:'Maharashtra',country:'India',demandScore:97,avgSalary:'₹28 LPA',openings:'9,800+',growthRate:'+20% YoY',icon:'🏙️'},{city:'Bengaluru',state:'Karnataka',country:'India',demandScore:80,avgSalary:'₹22 LPA',openings:'4,200+',growthRate:'+18% YoY',icon:'🌆'},{city:'Chennai',state:'Tamil Nadu',country:'India',demandScore:72,avgSalary:'₹18 LPA',openings:'2,800+',growthRate:'+14% YoY',icon:'🌇'}],
    strategy:[{city:'Mumbai',state:'Maharashtra',country:'India',demandScore:91,avgSalary:'₹35 LPA',openings:'3,400+',growthRate:'+22% YoY',icon:'🏙️'},{city:'Bengaluru',state:'Karnataka',country:'India',demandScore:87,avgSalary:'₹30 LPA',openings:'4,100+',growthRate:'+25% YoY',icon:'🌆'},{city:'Gurugram',state:'Haryana',country:'India',demandScore:82,avgSalary:'₹28 LPA',openings:'2,600+',growthRate:'+20% YoY',icon:'🌇'}],
  };
  const startupByDomain: Record<string,any[]> = {
    tech:[{title:'AI SaaS for SME Compliance',domain:'LegalTech / RegTech',description:'AI-powered compliance automation for Indian SMEs navigating GST, labour laws, and MSME regulations. Target: 63Mn+ registered SMEs.',bestLocations:[{city:'Bengaluru',country:'India',reason:'Deep tech talent & SaaS investor ecosystem'},{city:'Singapore',country:'Singapore',reason:'SEA expansion base + favourable startup laws'},{city:'Dubai',country:'UAE',reason:'High-growth SME market with low regulatory friction'}],fundingStage:'Pre-seed to Seed (₹50L–3Cr)',marketSize:'₹4,200 Cr TAM',competitionLevel:'low',keySkillsRequired:['Product Dev','Regulatory Knowledge','B2B Sales','AI/ML'],timeToLaunch:'3–4 months'},{title:'Developer Productivity Platform',domain:'DevTools / B2B SaaS',description:'AI-assisted code review, test generation, and docs tool for Series A–C engineering teams.',bestLocations:[{city:'Bengaluru',country:'India',reason:'Largest developer community + low cost'},{city:'San Francisco',country:'USA',reason:'Target buyers concentrated here'},{city:'Amsterdam',country:'Netherlands',reason:'Fast-growing EU SaaS hub'}],fundingStage:'Bootstrappable to ₹2Cr seed',marketSize:'$8.4B globally',competitionLevel:'medium',keySkillsRequired:['Full Stack','Product','Growth Hacking','Community Building'],timeToLaunch:'2–3 months'}],
    marketing:[{title:'D2C Brand Growth Agency — Tier 2/3',domain:'Marketing Services',description:'Performance-first growth agency for Tier 2/3 Indian markets — chronically underserved by metro agencies.',bestLocations:[{city:'Jaipur',country:'India',reason:'Low cost base, high regional brand demand'},{city:'Ahmedabad',country:'India',reason:'Established D2C ecosystem, entrepreneurial culture'},{city:'Coimbatore',country:'India',reason:'Growing manufacturing & D2C brands needing marketing'}],fundingStage:'Bootstrappable (₹5–15L)',marketSize:'₹1,800 Cr addressable',competitionLevel:'low',keySkillsRequired:['Performance Marketing','Regional Language Fluency','Creative Strategy','Analytics'],timeToLaunch:'1–2 months'}],
    finance:[{title:'Wealth Tech for Bharat (Tier 2–4)',domain:'Fintech / WealthTech',description:"Mobile-first investment platform for India's 400Mn+ working population in Tier 2–4 cities.",bestLocations:[{city:'Pune',country:'India',reason:'Strong tech talent + fintech regulatory sandbox'},{city:'Ahmedabad',country:'India',reason:'High savings rate population, GIFT City proximity'},{city:'Nairobi',country:'Kenya',reason:'Emerging market blueprint + mobile money infrastructure'}],fundingStage:'Seed to Series A (₹2–15Cr)',marketSize:'₹12,000 Cr TAM',competitionLevel:'medium',keySkillsRequired:['Fintech Regulations','Mobile Dev','Financial Planning','Trust UX'],timeToLaunch:'4–6 months'}],
    strategy:[{title:'AI Strategy Boutique',domain:'Management Consulting / AI',description:'Boutique firm using AI to deliver McKinsey-quality strategic analysis at SME-accessible pricing.',bestLocations:[{city:'Mumbai',country:'India',reason:'Highest density of SME clients + consulting talent'},{city:'Bengaluru',country:'India',reason:'AI-first positioning resonates with tech founders'},{city:'Dubai',country:'UAE',reason:'High-fee market, Indian diaspora founders, low tax'}],fundingStage:'Bootstrappable (₹5–20L setup)',marketSize:'₹6,500 Cr consulting TAM',competitionLevel:'low',keySkillsRequired:['Strategic Frameworks','AI Tools','Client Management','Storytelling'],timeToLaunch:'1–2 months'}],
  };
  const skillsMap: Record<string,string[]> = { tech:['Software Development','System Design','API Integration','Agile Methodology','Code Review','Technical Leadership'], marketing:['Campaign Strategy','Performance Analytics','Brand Positioning','Content Creation','Stakeholder Management','Market Research'], finance:['Financial Modelling','Risk Analysis','Compliance','Portfolio Management','Strategic Planning','Excel/Power BI'], strategy:['Strategic Planning','Business Analysis','Stakeholder Management','Project Delivery','Process Optimisation','Communication'] };
  const gapsMap: Record<string,string[]> = { tech:['System Design (Large Scale)','ML/AI Fundamentals','Cloud Architecture (AWS/GCP)','Data Structures Deep Dive','Open Source Contribution'], marketing:['SQL / Data Querying','Python for Marketing Analytics','CRO & A/B Testing','Marketing Automation (HubSpot)','Attribution Modelling'], finance:['Python / R for Finance','CFA / CPA Certification','Derivatives & Structured Products','Bloomberg Terminal','SEBI/RBI Regulatory Frameworks'], strategy:['SQL / Business Intelligence','Power BI / Tableau','Product Management Basics','Financial Modelling','Agile / Scrum Certification'] };
  return {
    overallScore, atsScore:hasNumbers?74:42, formattingScore:72, keywordsScore:56,
    summary:overallScore>=70?`Strong foundation — ${overallScore}/100. With 2–3 targeted improvements (quantification, keywords, ATS) this resume can reach the top 15% for ${domain} roles.`:`Significant opportunity — ${overallScore}/100. Core gaps in quantification and ATS alignment. The roadmap below will transform this into a competitive profile within 4–6 weeks.`,
    sections, skillsFound:skillsMap[domain], skillsGap:gapsMap[domain],
    jobOpportunities:jobsByDomain[domain]||jobsByDomain.strategy,
    geoHotspots:geoByDomain[domain]||geoByDomain.strategy,
    startupIdeas:startupByDomain[domain]||startupByDomain.strategy,
    roadmap:[{phase:'Phase 1 — Immediate (Week 1–2)',timeline:'2 weeks',actions:['Rewrite professional summary with role + years + 2 quantified wins','Convert every bullet to Action → Result format with a number','Add missing keywords: cross-functional, stakeholder, P&L (if applicable)']},{phase:'Phase 2 — Short-term (Month 1)',timeline:'4 weeks',actions:['Complete 1 industry certification (see Skills Gap above)','Rebuild skills section with proficiency ratings','Create 3 tailored resume versions for your top target role types']},{phase:'Phase 3 — Growth (Month 2–3)',timeline:'8 weeks',actions:['Build a case study PDF or portfolio page with 2–3 project walkthroughs','Apply to 10 target roles weekly with tailored cover notes','Networking: 5 LinkedIn connection requests to hiring managers per week']}],
  };
}

/* ══════════════════════════════════════ QUERY ENGINE ════════ */
function buildQueryEnhancement(q: string): EnhancedQuery {
  const t = q.toLowerCase();
  const domain = /market|brand|campaign|growth|customer/.test(t)?'marketing':/roi|revenue|profit|finance|cost|budget/.test(t)?'finance':/strateg|expand|scale|competi|business/.test(t)?'strategy':/risk|threat|vulnerab|problem|issue/.test(t)?'risk':'general';
  const intentMap: Record<string,string[]> = { marketing:['Underlying goal: revenue growth through brand/channel optimisation','Hidden constraint: budget ceiling & attribution model gaps','Temporal urgency: competitive window is time-sensitive'], finance:['Core objective: capital efficiency and return maximisation','Hidden factor: investor/board scrutiny implied','Risk dimension: downside protection likely a priority'], strategy:['Strategic intent: sustainable competitive advantage','Hidden variable: execution capability & talent readiness','Market timing: first-mover vs fast-follower trade-off'], risk:['Primary concern: operational continuity & regulatory compliance','Hidden dimension: reputational and financial exposure','Stakeholder concern: leadership accountability implied'], general:['Broad exploration: multiple business domains intersect','Benchmarking intent: comparison to industry standard','Decision support: data needed to justify action to stakeholders'] };
  const improvMap: Record<string,string[]> = { marketing:['Specify channel (digital/offline/hybrid) for precision analysis','Add target segment (B2B/B2C/enterprise/SME)','Include time horizon for measurable outcome alignment'], finance:['Add investment amount or budget ceiling for ROI modelling','Specify benchmark (industry/competitor/historical)','Include risk tolerance level for scenario calibration'], strategy:['Define geography & market maturity stage','Clarify competitive moat: tech, brand, cost, or network','Add success metric: market share, revenue, NPS, or margin'], risk:['Specify risk category: operational, financial, or regulatory','Add probability range for quantitative prioritisation','Include mitigation owner and response timeline'], general:['Narrow scope: choose one primary business domain','Add a measurable KPI to anchor the analysis','Include a time horizon (quarterly/annual/5-year)'] };
  const insightMap: Record<string,string[]> = { marketing:['TAM expansion opportunity exists in adjacent segments','Attribution model design determines efficiency gains','CLV optimisation unlocks compounding revenue returns'], finance:['IRR analysis over 3–5 years separates strategic from tactical investments','Working capital cycle efficiency is often the hidden lever','Tax structuring can improve effective ROI by 8–15%'], strategy:['Competitive positioning matrix reveals 2–3 high-leverage pivot points','Scenario planning across 3 futures reduces strategic surprise by 40%','Capability gap assessment must precede resource allocation'], risk:['Composite risk scoring reveals hidden concentration in 1–2 factors','Regulatory horizon scanning (6–18 months) is a competitive advantage','Insurance & hedging strategies reduce tail-risk exposure significantly'], general:['Cross-domain synthesis reveals non-obvious leverage points','Industry benchmark comparison contextualises absolute performance','Predictive modelling improves decision confidence by 30–40%'] };
  const actionMap: Record<string,{step:string;priority:'high'|'medium'|'low'}[]> = { marketing:[{step:`Define SMART KPIs for "${q}"`,priority:'high'},{step:'Map customer journey for attribution model',priority:'high'},{step:'Competitive landscape analysis (top 5)',priority:'medium'},{step:'A/B testing hypothesis for key messages',priority:'medium'},{step:'90-day performance review cadence',priority:'low'}], finance:[{step:`3-year DCF sensitivity analysis for "${q}"`,priority:'high'},{step:'Define discount rate & risk-adjusted return threshold',priority:'high'},{step:'Map cash-flow timing vs working capital',priority:'medium'},{step:'Stress-test against 3 macro scenarios',priority:'medium'},{step:'Prepare board-ready financial narrative',priority:'low'}], strategy:[{step:`SWOT + Porter's Five Forces for "${q}"`,priority:'high'},{step:'Top 3 strategic options with trade-off matrix',priority:'high'},{step:'Map execution readiness: talent, tech, capital',priority:'medium'},{step:'Define OKRs and 12-month milestones',priority:'medium'},{step:'Stakeholder alignment & change management',priority:'low'}], risk:[{step:`Score and rank all risks for "${q}" (1–100)`,priority:'high'},{step:'Assign risk owners and escalation thresholds',priority:'high'},{step:'Build mitigation playbook per category',priority:'medium'},{step:'Design monitoring dashboard',priority:'medium'},{step:'Schedule quarterly risk review',priority:'low'}], general:[{step:`Frame the core decision "${q}" must support`,priority:'high'},{step:'Identify 3 primary data sources',priority:'high'},{step:'Select analytical framework',priority:'medium'},{step:'Define stakeholders and output format',priority:'medium'},{step:'Build continuous refinement loop',priority:'low'}] };
  const outputMap: Record<string,string> = { marketing:`Strategic Analysis: ${q}\n\nExecutive Summary\nHigh-intent marketing query. Primary objective: sustainable revenue growth through optimised positioning.\n\nKey Findings\n• Market opportunity: ₹2,400–4,800Cr addressable segment\n• Competitive differentiation requires a 2–3 pillar strategy\n• CAC optimisation of 25–35% achievable within 6 months\n• Customer retention +12–18% drives compounding LTV gains\n\nStrategic Recommendation\nPrioritise a 90-day sprint on the highest-leverage channel, backed by weekly attribution reporting and a 6-month roadmap targeting 3–5% market share gain.`, finance:`Financial Intelligence Report: ${q}\n\nExecutive Summary\nHigh-value financial query with capital allocation implications.\n\nKey Findings\n• 3-year projected ROI: 140–200% (base case: 170%)\n• Break-even timeline: 18–28 months\n• IRR: 28–38% — above industry cost of capital\n• Risk-adjusted NPV: ₹60–95L positive across all scenarios\n\nStrategic Recommendation\nPhased investment (40% Y1, 35% Y2, 25% Y3) preserves optionality while validating assumptions before full capital deployment.`, strategy:`Strategic Intelligence Briefing: ${q}\n\nExecutive Summary\nPivotal strategic decision junction. 2 high-confidence pathways and 1 high-risk/high-reward option identified.\n\nKey Findings\n• Competitive window: 12–18 months\n• Capability gap: moderate — bridgeable within 6 months\n• Market tailwinds: 22% CAGR in adjacent segment\n• Execution risk: low-to-medium\n\nStrategic Recommendation\nFocused Differentiation path delivers best risk-adjusted outcome over 3 years — 74% probability of achieving target market position.`, risk:`Risk Intelligence Assessment: ${q}\n\nExecutive Summary\nComposite risk analysis across 6 dimensions — manageable profile with 2 critical areas.\n\nKey Findings\n• Overall risk score: 42/100 (Moderate)\n• Critical: Regulatory (68/100) and Talent (61/100)\n• Liquidity buffer: 2.6× current ratio\n• Mitigation coverage: 4 of 6 risks active\n\nStrategic Recommendation\nRegulatory compliance roadmap (30-day) + ESOP revision (60-day) reduces composite risk below 32/100 within 90 days.`, general:`AI Intelligence Report: ${q}\n\nExecutive Summary\nCross-domain synthesis delivers decision-ready output.\n\nKey Findings\n• Benchmarking against 2,400+ data points reveals 3 high-leverage action areas\n• The 12-month opportunity window favours proactive decision-making\n• Strategic clarity emerges when contextualised within a defined business objective\n\nStrategic Recommendation\nStructured framework: (1) Define metrics → (2) Map constraints → (3) Model 3 scenarios → (4) Select path → (5) Build execution roadmap.` };
  return {
    original:q,
    enhanced:`${q} — comprehensive ${domain} analysis with 5-year scenario modelling, benchmarking against 2,400+ data points, risk-adjusted recommendations, and actionable 90-day execution roadmap`,
    hiddenIntent:intentMap[domain], improvements:improvMap[domain], strategicInsights:insightMap[domain],
    actionPlan:actionMap[domain],
    relatedAngles:[`${q} — investor pitch perspective`,`${q} — operational implementation view`,`${q} — risk & compliance lens`,`${q} — customer-centric reframe`],
    professionalOutput:outputMap[domain],
  };
}

/* ══════════════════════════════════════ VIEW: SCORE TAB ════ */
function ResumeScoreTab({ data }: { data: ResumeAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 border border-white/10">
        <ScoreRing score={data.overallScore} size={80} stroke={6}/>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-white mb-1">Career Intelligence Score</p>
          <p className="text-[11px] text-white/50 leading-snug mb-3">{data.summary}</p>
          <div className="grid grid-cols-3 gap-2">
            {[{l:'ATS',v:data.atsScore},{l:'Format',v:data.formattingScore},{l:'Keywords',v:data.keywordsScore}].map((m,i)=>{
              const c = sc(m.v);
              return (
                <div key={i} className="bg-white/[0.06] rounded-xl px-2.5 py-2 text-center">
                  <p className={`text-[15px] font-extrabold ${c.text}`}>{m.v}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-wide">{m.l}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2.5">Section Analysis — Click to expand</p>
        <div className="space-y-2">{data.sections.map((s,i)=><SectionBar key={i} s={s} i={i}/>)}</div>
      </div>
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-2.5">Skills Detected</p>
        <div className="flex flex-wrap gap-2">
          {data.skillsFound.map((s,i)=>(
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3 h-3"/> {s}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <p className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider mb-2.5">Skill Gaps — Add These</p>
        <div className="flex flex-wrap gap-2">
          {data.skillsGap.map((s,i)=>(
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-red-100 border border-red-200 rounded-full text-[11px] font-semibold text-red-800">
              <AlertTriangle className="w-3 h-3"/> {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ VIEW: JOBS TAB ═════ */
function JobsView({ jobs, hotspots, onNotify }: { jobs:JobOpportunity[]; hotspots:GeoHotspot[]; onNotify:()=>void }) {
  const [applyJob, setApplyJob] = useState<JobOpportunity | null>(null);
  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-700 text-white">
          <Bell className="w-5 h-5 shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-extrabold">Enable Smart Job Alerts</p>
            <p className="text-[10px] text-white/70">Get notified when new matching roles are posted</p>
          </div>
          <button onClick={onNotify} className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-[11px] font-bold shrink-0 transition-colors">Enable</button>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">Live Opportunities — Matched to Your Profile</p>
          <div className="space-y-3">
            {jobs.map((job,i)=>{
              const c = sc(job.match);
              return (
                <motion.div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} whileHover={{y:-1}}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="text-[13px] font-extrabold text-gray-900">{job.title}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${demandColors[job.demandLevel]}`}>
                            {job.demandLevel==='high'?'🔥 High Demand':job.demandLevel==='medium'?'📈 Growing':'Steady'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">{job.company} · <span className="text-violet-600 font-semibold">{job.domain}</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[14px] font-extrabold ${c.text}`}>{job.match}%</span>
                        <p className="text-[9px] text-gray-400">match</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div className={`h-full rounded-full ${c.bar}`} initial={{width:0}} animate={{width:`${job.match}%`}} transition={{duration:0.6,delay:0.1+i*0.07}}/>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400 shrink-0"/><span className="text-[11px] text-gray-600">{job.location.city}, {job.location.state}</span></div>
                      <div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-emerald-500 shrink-0"/><span className="text-[11px] text-emerald-700 font-semibold">{job.salaryRange}</span></div>
                      <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-gray-400 shrink-0"/><span className="text-[11px] text-gray-500">{job.location.country}</span></div>
                      <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-blue-400 shrink-0"/><span className="text-[11px] text-gray-500">{job.openings}+ openings</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">{job.platforms.map((p,j)=><span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{p}</span>)}</div>
                      <motion.button onClick={()=>setApplyJob(job)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white text-[11px] font-extrabold shadow-md shadow-blue-500/25 shrink-0"
                        whileHover={{scale:1.04,y:-1}} whileTap={{scale:0.96}}>
                        Apply Now <Send className="w-3 h-3"/>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">📍 Where Demand Is Highest for Your Skillset</p>
          <div className="space-y-2.5">
            {hotspots.map((h,i)=>{
              const c = sc(h.demandScore);
              return (
                <div key={i} className={`rounded-xl border ${c.border} p-3.5`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className="text-[18px]">{h.icon}</span><div><p className="text-[12px] font-extrabold text-gray-800">{h.city}, {h.state}</p><p className="text-[10px] text-gray-400">{h.country}</p></div></div>
                    <div className="text-right"><span className={`text-[15px] font-extrabold ${c.text}`}>{h.demandScore}</span><p className="text-[9px] text-gray-400">demand score</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[{l:'Avg Salary',v:h.avgSalary},{l:'Openings',v:h.openings},{l:'Growth',v:h.growthRate}].map((m,j)=>(
                      <div key={j} className={`rounded-lg px-2.5 py-1.5 text-center ${c.bg}`}><p className={`text-[11px] font-extrabold ${c.text}`}>{m.v}</p><p className="text-[9px] text-gray-400">{m.l}</p></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ApplyNowModal
        open={applyJob !== null} onClose={()=>setApplyJob(null)}
        jobTitle={applyJob?.title??''} company={applyJob?.company??''}
        location={`${applyJob?.location.city??''}, ${applyJob?.location.state??''}, ${applyJob?.location.country??''}`}
        salaryRange={applyJob?.salaryRange??''} domain={applyJob?.domain??''}
      />
    </>
  );
}

/* ══════════════════════════════════════ VIEW: STARTUP TAB ══ */
function StartupView({ ideas }: { ideas: any[] }) {
  const [open, setOpen] = useState<number|null>(0);
  const demandC = { high:'bg-emerald-100 text-emerald-700 border-emerald-200', medium:'bg-amber-100 text-amber-700 border-amber-200', low:'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3.5 mb-1">
        <div className="flex items-center gap-2 mb-1"><Rocket className="w-4 h-4 text-amber-600"/><p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Startup Intelligence</p></div>
        <p className="text-[11.5px] text-amber-800">Based on your skills and current market trends — high-potential startup opportunities with location strategy and initial guidance.</p>
      </div>
      {ideas.map((idea,i)=>(
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-start gap-3 p-4 hover:bg-gray-50/50 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0"><Rocket className="w-4 h-4 text-white"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="text-[13px] font-extrabold text-gray-900">{idea.title}</h3><span className="text-[10px] text-violet-600 font-bold">{idea.domain}</span></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demandC[idea.competitionLevel==='low'?'high':idea.competitionLevel==='medium'?'medium':'low']}`}>
                    {idea.competitionLevel==='low'?'✓ Low Competition':idea.competitionLevel==='medium'?'~ Medium':'⚠ High'}
                  </span>
                  {open===i?<ChevronUp className="w-4 h-4 text-gray-400"/>:<ChevronDown className="w-4 h-4 text-gray-400"/>}
                </div>
              </div>
            </div>
          </button>
          <AnimatePresence>
            {open===i && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="border-t border-gray-100 px-4 pb-4">
                <p className="text-[12px] text-gray-600 leading-relaxed mt-3 mb-4">{idea.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[{l:'Market Size',v:idea.marketSize},{l:'Launch Time',v:idea.timeToLaunch},{l:'Funding',v:idea.fundingStage},{l:'Competition',v:idea.competitionLevel}].map((m,j)=>(
                    <div key={j} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">{m.l}</p>
                      <p className="text-[12px] font-bold text-gray-800 capitalize">{m.v}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">📍 Best Launch Locations</p>
                <div className="space-y-2 mb-4">
                  {idea.bestLocations.map((loc: any,j: number)=>(
                    <div key={j} className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5"/>
                      <div><p className="text-[12px] font-bold text-gray-800">{loc.city}, {loc.country}</p><p className="text-[11px] text-blue-700">{loc.reason}</p></div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Skills Required</p>
                <div className="flex flex-wrap gap-1.5">{idea.keySkillsRequired.map((s: string,j: number)=><span key={j} className="px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-full text-[10px] font-semibold text-violet-800">{s}</span>)}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════ VIEW: ROADMAP TAB ══ */
function RoadmapTab({ phases }: { phases: ResumeAnalysis['roadmap'] }) {
  return (
    <div className="space-y-3">
      {phases.map((phase,i)=>(
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden">
          <div className={`px-4 py-3 flex items-center justify-between ${i===0?'bg-red-50 border-b border-red-200':i===1?'bg-amber-50 border-b border-amber-200':'bg-emerald-50 border-b border-emerald-200'}`}>
            <span className={`text-[12px] font-extrabold ${i===0?'text-red-700':i===1?'text-amber-700':'text-emerald-700'}`}>{phase.phase}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i===0?'bg-red-100 text-red-600':i===1?'bg-amber-100 text-amber-600':'bg-emerald-100 text-emerald-600'}`}>{phase.timeline}</span>
          </div>
          <div className="p-4 bg-white">
            {phase.actions.map((a,j)=>(
              <div key={j} className="flex items-start gap-3 mb-3 last:mb-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${i===0?'bg-red-400':i===1?'bg-amber-400':'bg-emerald-400'}`}>{j+1}</span>
                <p className="text-[12px] text-gray-700 leading-snug">{a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════ VIEW: QUERY ════════ */
function QueryEnhancementView({ data, onUseEnhanced }: { data:EnhancedQuery; onUseEnhanced:(q:string)=>void }) {
  const [tab, setTab] = useState<'output'|'intent'|'plan'|'angles'>('output');
  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 p-4 mb-5">
        <div className="flex items-center gap-2 mb-2"><Wand2 className="w-4 h-4 text-violet-600"/><p className="text-[11px] font-extrabold text-violet-700 uppercase tracking-wider">AI-Enhanced Query</p></div>
        <p className="text-[12.5px] text-violet-800 leading-relaxed italic mb-3">"{data.enhanced}"</p>
        <button onClick={()=>onUseEnhanced(data.enhanced)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[12px] font-bold shadow-md shadow-violet-500/25">
          <Zap className="w-3.5 h-3.5"/> Use Enhanced Query
        </button>
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {([['output','Output',FileText],['intent','Intent',Brain],['plan','Action Plan',ClipboardList],['angles','Angles',Lightbulb]] as const).map(([id,label,Icon])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${tab===id?'bg-gradient-to-r from-violet-500 to-indigo-600 text-white border-transparent shadow-sm':'bg-white text-gray-500 border-gray-200 hover:border-violet-200 hover:text-violet-600'}`}>
            <Icon className="w-3 h-3"/> {label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {tab==='output' && <motion.div key="o" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}><div className="bg-gray-50 rounded-2xl border border-gray-200 p-4"><pre className="text-[11.5px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{data.professionalOutput}</pre></div></motion.div>}
        {tab==='intent' && (
          <motion.div key="i" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4"><p className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider mb-3">Hidden Intent</p>{data.hiddenIntent.map((h,i)=><div key={i} className="flex items-start gap-2 mb-2"><Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5"/><p className="text-[11.5px] text-indigo-800">{h}</p></div>)}</div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4"><p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-3">Improvements</p>{data.improvements.map((imp,i)=><div key={i} className="flex items-start gap-2 mb-2"><TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"/><p className="text-[11.5px] text-amber-800">{imp}</p></div>)}</div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4"><p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-3">Strategic Insights</p>{data.strategicInsights.map((s,i)=><div key={i} className="flex items-start gap-2 mb-2"><Target className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"/><p className="text-[11.5px] text-emerald-800">{s}</p></div>)}</div>
          </motion.div>
        )}
        {tab==='plan' && <motion.div key="p" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2.5">{data.actionPlan.map((ap,i)=><div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${ap.priority==='high'?'bg-red-50 border-red-200':ap.priority==='medium'?'bg-amber-50 border-amber-200':'bg-gray-50 border-gray-200'}`}><div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-extrabold text-white ${ap.priority==='high'?'bg-red-500':ap.priority==='medium'?'bg-amber-500':'bg-gray-400'}`}>{i+1}</div><div><p className="text-[12px] font-semibold text-gray-800">{ap.step}</p><span className={`text-[9px] font-bold uppercase tracking-wider ${ap.priority==='high'?'text-red-600':ap.priority==='medium'?'text-amber-600':'text-gray-500'}`}>{ap.priority} priority</span></div></div>)}</motion.div>}
        {tab==='angles' && <motion.div key="a" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">{data.relatedAngles.map((a,i)=><button key={i} onClick={()=>onUseEnhanced(a)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 transition-all text-left group"><div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><Lightbulb className="w-3.5 h-3.5 text-violet-500"/></div><p className="text-[12px] text-gray-700 flex-1">{a}</p><ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 shrink-0"/></button>)}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════ MAIN EXPORT ════════ */
interface AIAssistantModalProps {
  onClose: () => void;
  initialQuery?: string;
  onUseQuery: (q: string) => void;
}

export function AIAssistantModal({ onClose, initialQuery = '', onUseQuery }: AIAssistantModalProps) {
  const [mode,      setMode]      = useState<AssistMode>('query');
  const [input,     setInput]     = useState(initialQuery);
  const [thinking,  setThinking]  = useState(false);
  const [qResult,   setQResult]   = useState<EnhancedQuery | null>(null);
  const [rResult,   setRResult]   = useState<ResumeAnalysis | null>(null);
  const [resumeTab, setResumeTab] = useState<'score'|'jobs'|'startup'|'roadmap'>('score');
  const [dragging,  setDragging]  = useState(false);
  const [fileName,  setFileName]  = useState('');
  const [notifOn,   setNotifOn]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyse = useCallback(() => {
    if (!input.trim()) return;
    setThinking(true); setQResult(null);
    setTimeout(() => { setQResult(buildQueryEnhancement(input)); setThinking(false); }, 2000);
  }, [input]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name); setThinking(true); setRResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      const text = (e.target?.result as string) ?? '';
      setTimeout(() => { setRResult(buildResumeAnalysis(file.name, text)); setThinking(false); setResumeTab('score'); }, 2600);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };

  const handleUseQuery = (q: string) => { onUseQuery(q); onClose(); };
  const handleNotify = () => { setNotifOn(true); setTimeout(() => setNotifOn(false), 3000); };

  const resumeTabs: { id: 'score'|'jobs'|'startup'|'roadmap'; label: string; icon: React.ComponentType<{className?:string}> }[] = [
    { id:'score',   label:'Score',   icon:BarChart3    },
    { id:'jobs',    label:'Jobs',    icon:Briefcase    },
    { id:'startup', label:'Startup', icon:Rocket       },
    { id:'roadmap', label:'Roadmap', icon:ClipboardList },
  ];

  return (
    <motion.div className="fixed inset-0 z-[990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <motion.div className="relative w-full max-w-[640px] max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{scale:0.92,y:24,opacity:0}} animate={{scale:1,y:0,opacity:1}}
        exit={{scale:0.94,y:16,opacity:0}} transition={{type:'spring',stiffness:280,damping:26}}>

        {/* Toast */}
        <AnimatePresence>
          {notifOn && (
            <motion.div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white shadow-xl text-[12px] font-bold whitespace-nowrap"
              initial={{opacity:0,y:-10,scale:0.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-10}}>
              <Bell className="w-4 h-4"/> Smart job alerts enabled!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-violet-950 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Star className="w-4 h-4 text-white" fill="currentColor"/>
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-white leading-tight">Career Intelligence System</p>
              <p className="text-[10px] text-white/45">Query enhancement · Resume analysis · Job matching · Startup ideas</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.16] transition-colors">
            <X className="w-4 h-4 text-white/60"/>
          </button>
        </div>

        {/* Mode switcher */}
        <div className="flex shrink-0 border-b border-gray-100 bg-white">
          {([['query','Query Enhancer',Brain],['resume','Career Intelligence',Briefcase]] as const).map(([id,label,Icon])=>(
            <button key={id} onClick={()=>{ setMode(id); setQResult(null); setRResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-bold border-b-2 transition-all ${mode===id?'border-violet-500 text-violet-700 bg-violet-50/30':'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4"/> {label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── QUERY MODE ── */}
          {mode==='query' && (
            <div>
              {!qResult && !thinking && (
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2.5">Your Query</p>
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&e.metaKey) handleAnalyse(); }}
                    placeholder="Ask about business strategy, market analysis, ROI, competitive landscape, or any professional topic…"
                    rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 resize-none transition-all leading-relaxed mb-3"/>
                  <motion.button onClick={handleAnalyse} disabled={!input.trim()}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-600 text-white text-[13px] font-bold shadow-lg shadow-violet-500/25 disabled:opacity-40"
                    whileHover={{scale:1.01}} whileTap={{scale:0.98}}>
                    <Sparkles className="w-4 h-4"/> Enhance with AI <span className="text-white/40 text-[10px] ml-1">⌘↵</span>
                  </motion.button>
                </div>
              )}
              {thinking && (
                <div className="flex flex-col items-center py-14">
                  <div className="relative w-14 h-14 mb-5">
                    {[0,1,2].map(i=><motion.span key={i} className="absolute inset-0 rounded-full border border-violet-300/70" animate={{scale:[1,2,1],opacity:[0.5,0,0.5]}} transition={{duration:1.8,repeat:Infinity,delay:i*0.45}}/>)}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-md"><Brain className="w-6 h-6 text-violet-600"/></div>
                  </div>
                  <p className="text-[14px] font-extrabold text-gray-800 mb-1">AI is thinking deeply…</p>
                  <p className="text-[12px] text-gray-400 flex items-center">Identifying hidden intent<ThinkDots/></p>
                </div>
              )}
              {qResult && !thinking && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/><span className="text-[12px] font-bold text-gray-700">Analysis complete</span></div>
                    <button onClick={()=>{ setQResult(null); setInput(''); }} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"><RefreshCw className="w-3 h-3"/> New</button>
                  </div>
                  <QueryEnhancementView data={qResult} onUseEnhanced={handleUseQuery}/>
                </div>
              )}
            </div>
          )}

          {/* ── CAREER MODE ── */}
          {mode==='resume' && (
            <div>
              {!rResult && !thinking && (
                <div>
                  <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
                    onClick={()=>fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${dragging?'border-violet-400 bg-violet-50':'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}`}>
                    <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="sr-only" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto mb-3"><Upload className="w-5 h-5 text-violet-500"/></div>
                    <p className="text-[13px] font-bold text-gray-800 mb-1">Upload your resume</p>
                    <p className="text-[11px] text-gray-400">Drag & drop or click · PDF, DOC, DOCX, TXT</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5">
                    <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-2">Career Intelligence Outputs</p>
                    {['7-dimension resume scoring with section analysis','Skills gap + recommended certifications','Matched job openings with location, salary & apply links','Geographic demand hotspots for your skillset','Startup ideas with launch location strategy','3-phase personalised improvement roadmap'].map((f,i)=>(
                      <div key={i} className="flex items-center gap-2 mb-1.5 last:mb-0">
                        <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0"/><span className="text-[11px] text-blue-800">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {thinking && (
                <div className="flex flex-col items-center py-14">
                  <div className="relative w-14 h-14 mb-5">
                    {[0,1,2].map(i=><motion.span key={i} className="absolute inset-0 rounded-full border border-blue-300/70" animate={{scale:[1,2,1],opacity:[0.5,0,0.5]}} transition={{duration:1.8,repeat:Infinity,delay:i*0.45}}/>)}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-md"><FileText className="w-6 h-6 text-blue-600"/></div>
                  </div>
                  <p className="text-[14px] font-extrabold text-gray-800 mb-1">Building career intelligence…</p>
                  <p className="text-[11px] text-gray-400 mb-4">{fileName && `"${fileName}"`}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Scoring','Matching jobs','Finding locations','Startup ideas'].map((s,i)=>(
                      <motion.span key={s} className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-blue-100 text-blue-600 font-bold shadow-sm" animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.2,repeat:Infinity,delay:i*0.28}}>{s}</motion.span>
                    ))}
                  </div>
                </div>
              )}
              {rResult && !thinking && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/><span className="text-[12px] font-bold text-gray-700 truncate max-w-[200px]">{fileName||'Resume'} analysed</span></div>
                    <button onClick={()=>{setRResult(null);setFileName('');}} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"><RefreshCw className="w-3 h-3"/> Upload new</button>
                  </div>
                  <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
                    {resumeTabs.map(t=>{const TIcon=t.icon;return(
                      <button key={t.id} onClick={()=>setResumeTab(t.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold border whitespace-nowrap transition-all ${resumeTab===t.id?'bg-gradient-to-r from-blue-500 to-violet-600 text-white border-transparent shadow-md':'bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600'}`}>
                        <TIcon className="w-3.5 h-3.5"/> {t.label}
                      </button>
                    );})}
                  </div>
                  <AnimatePresence mode="wait">
                    {resumeTab==='score'   && <motion.div key="sc" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}><ResumeScoreTab data={rResult}/></motion.div>}
                    {resumeTab==='jobs'    && <motion.div key="jb" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}><JobsView jobs={rResult.jobOpportunities} hotspots={rResult.geoHotspots} onNotify={handleNotify}/></motion.div>}
                    {resumeTab==='startup' && <motion.div key="st" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}><StartupView ideas={rResult.startupIdeas}/></motion.div>}
                    {resumeTab==='roadmap' && <motion.div key="rm" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}><RoadmapTab phases={rResult.roadmap}/></motion.div>}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
