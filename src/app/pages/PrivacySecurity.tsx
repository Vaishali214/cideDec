import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Shield, Lock, Eye, Smartphone,
  Globe, Database, UserCheck, Bell,
  ChevronRight, Check, AlertTriangle, Download,
} from 'lucide-react';
import type { Page } from '../App';

interface PrivacySecurityProps { onNavigate: (page: Page) => void }

export function PrivacySecurity({ onNavigate }: PrivacySecurityProps) {
  const [twoFA,     setTwoFA]     = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [location,    setLocation]    = useState(false);
  const [showAudit,   setShowAudit]   = useState(false);

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      className={`relative shrink-0 rounded-full transition-colors`}
      style={{ width: 42, height: 22, background: on ? '#3b82f6' : '#e5e7eb' }}>
      <motion.span
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow"
        animate={{ x: on ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  const auditLog = [
    { action: 'Login',           ip: '103.82.44.12', device: 'Chrome · Windows', time: 'Today 9:42 AM'  },
    { action: 'ROI Query',       ip: '103.82.44.12', device: 'Chrome · Windows', time: 'Today 9:48 AM'  },
    { action: 'Export Report',   ip: '103.82.44.12', device: 'Chrome · Windows', time: 'Today 10:15 AM' },
    { action: 'Settings Update', ip: '103.82.44.12', device: 'Chrome · Windows', time: 'Yesterday 4:20 PM' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-16">
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <motion.button onClick={() => onNavigate('home')} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-[16px] font-extrabold text-gray-900">Privacy & Data Security</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">WhatsApp-level end-to-end protection · Full transparency</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 space-y-6">

        {/* E2E banner */}
        <motion.div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[16px] font-extrabold">End-to-End Encrypted</h2>
          </div>
          <p className="text-[13px] text-white/85 leading-relaxed">
            All your queries, analytics, and personal data are encrypted using AES-256 before leaving your device. <strong>We cannot read your data</strong> — not even our engineers. This is the same standard used by WhatsApp and Signal.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['AES-256 Encryption', 'TLS 1.3 Transport', 'Zero-Knowledge Design', 'SOC 2 Compliant'].map(badge => (
              <span key={badge} className="bg-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full">{badge}</span>
            ))}
          </div>
        </motion.div>

        {/* Authentication */}
        <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <p className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Authentication</p>
          </div>
          <div className="px-5 divide-y divide-gray-50">
            {[
              { label: 'Two-Factor Authentication', desc: 'Require OTP to sign in from new devices', on: twoFA,      set: setTwoFA      },
              { label: 'Biometric Login',           desc: 'Use fingerprint or Face ID',              on: biometric,  set: setBiometric  },
              { label: 'New Device Alerts',         desc: 'Email alert on unrecognised sign-ins',    on: loginAlerts, set: setLoginAlerts },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{row.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{row.desc}</p>
                </div>
                <Toggle on={row.on} onToggle={() => row.set(v => !v)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data Transparency */}
        <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-600" />
            <p className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Data Transparency</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { icon: Database,  title: 'What we collect',    desc: 'Query text, session timestamps, anonymised usage patterns. No financial or personal documents.' },
              { icon: Globe,     title: 'How it\'s used',     desc: 'To generate analytics, improve AI models, and personalise your experience. Never for ads.' },
              { icon: UserCheck, title: 'Your rights',        desc: 'Access, correct, export, or delete your data at any time via Settings → Data Preferences.' },
            ].map((item, i) => {
              const IIcon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <IIcon className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Permissions */}
        <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <p className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Permission Controls</p>
          </div>
          <div className="px-5 divide-y divide-gray-50">
            {[
              { label: 'Location Access',    desc: 'Regional market data personalisation', on: location,    set: setLocation    },
              { label: 'Analytics Sharing',  desc: 'Anonymised usage to improve AI models', on: dataSharing, set: setDataSharing },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{row.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{row.desc}</p>
                </div>
                <Toggle on={row.on} onToggle={() => row.set(v => !v)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Audit log */}
        <motion.div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <button
            onClick={() => setShowAudit(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <p className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Recent Activity Log</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showAudit ? 'rotate-90' : ''}`} />
          </button>
          {showAudit && (
            <div className="divide-y divide-gray-50">
              {auditLog.map((log, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-800">{log.action}</p>
                    <p className="text-[11px] text-gray-400">{log.device} · IP {log.ip}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 shrink-0 ml-4">{log.time}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Data management */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Download className="w-4 h-4 text-blue-600" /></div>
            <div>
              <p className="text-[12px] font-bold text-gray-900">Export My Data</p>
              <p className="text-[11px] text-gray-400">Download a copy of all your data</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all text-left">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
            <div>
              <p className="text-[12px] font-bold text-red-700">Delete Account</p>
              <p className="text-[11px] text-gray-400">Permanently erase all data</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
