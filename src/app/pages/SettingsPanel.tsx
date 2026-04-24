import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, User, Shield, Bell, CreditCard, Database,
  LogOut, ChevronRight, Check, Settings as SettingsIcon,
  Lock, Trash2, AlertTriangle, CheckCircle2, Download,
} from 'lucide-react';
import { useApp } from '../AppContext';
import type { Page } from '../App';

interface SettingsPanelProps {
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'subscription' | 'data' | 'logout';

export function SettingsPanel({ onClose, onNavigate }: SettingsPanelProps) {
  const { currentUser, signOut, notifications } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saved, setSaved] = useState(false);

  /* toggle states */
  const [twoFA,        setTwoFA]        = useState(true);
  const [biometric,    setBiometric]    = useState(false);
  const [sessionAlert, setSessionAlert] = useState(true);
  const [notifInsight, setNotifInsight] = useState(true);
  const [notifAlert,   setNotifAlert]   = useState(true);
  const [notifUpdate,  setNotifUpdate]  = useState(false);
  const [notifEmail,   setNotifEmail]   = useState(true);
  const [analyticsShare, setAnalyticsShare] = useState(false);
  const [crashReports,   setCrashReports]   = useState(true);
  const [dataRetention,  setDataRetention]  = useState('90');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'account',       label: 'Account',            icon: User         },
    { id: 'privacy',       label: 'Privacy & Security', icon: Shield       },
    { id: 'notifications', label: 'Notifications',      icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'subscription',  label: 'Subscription',       icon: CreditCard   },
    { id: 'data',          label: 'Data Preferences',   icon: Database     },
    { id: 'logout',        label: 'Sign Out',           icon: LogOut       },
  ];

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`rounded-full transition-colors relative shrink-0 ${on ? 'bg-zinc-900' : 'bg-zinc-200'}`}
      style={{ height: 22, width: 42 }}>
      <motion.span
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow"
        animate={{ x: on ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  const Row = ({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-zinc-50 last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-zinc-800">{label}</p>
        {desc && <p className="text-[11px] text-zinc-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[998] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-black tracking-tight">Settings</h2>
              <p className="text-[11px] text-zinc-400">{currentUser?.fullName} · {currentUser?.plan} Plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <motion.span
                className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 className="w-3 h-3" /> Saved
              </motion.span>
            )}
            <motion.button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors" whileTap={{ scale: 0.93 }}>
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar tabs */}
          <div className="w-44 sm:w-52 border-r border-zinc-100 py-3 px-2 shrink-0 overflow-y-auto">
            {tabs.map(tab => {
              const TIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium mb-0.5 transition-colors text-left ${active ? 'bg-zinc-100 text-zinc-900 font-semibold' : tab.id === 'logout' ? 'text-red-500 hover:bg-red-50' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                  <TIcon className={`w-4 h-4 shrink-0 ${active ? 'text-zinc-900' : tab.id === 'logout' ? 'text-red-500' : 'text-zinc-400'}`} />
                  <span className="flex-1 truncate">{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? <span className="w-4 h-4 bg-zinc-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">{tab.badge}</span> : null}
                  {active && tab.id !== 'logout' && <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait">

              {/* ── ACCOUNT ── */}
              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Account Details</h3>
                  <div className="bg-zinc-50 rounded-2xl p-4 mb-5 flex items-center gap-4 border border-zinc-100">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-[18px] font-extrabold shadow-md">
                      {currentUser?.fullName?.charAt(0) ?? 'U'}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-black">{currentUser?.fullName}</p>
                      <p className="text-[12px] text-zinc-500">{currentUser?.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 bg-zinc-200 text-zinc-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />{currentUser?.plan} Plan · Active
                      </span>
                    </div>
                  </div>
                  {[
                    { label: 'Full Name', value: currentUser?.fullName ?? '', key: 'name' },
                    { label: 'Email Address', value: currentUser?.email ?? '', key: 'email' },
                    { label: 'Username', value: currentUser?.username ?? '', key: 'user' },
                  ].map(f => (
                    <div key={f.key} className="mb-4">
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">{f.label}</label>
                      <input type="text" defaultValue={f.value}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all"
                      />
                    </div>
                  ))}
                  <motion.button onClick={handleSave} className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    Save Changes
                  </motion.button>
                </motion.div>
              )}

              {/* ── PRIVACY & SECURITY ── */}
              {activeTab === 'privacy' && (
                <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Privacy & Security</h3>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-bold text-emerald-800">End-to-End Encrypted</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">All your queries, analytics data, and session activity are encrypted in transit and at rest using AES-256. CideDec cannot read your data.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <Row label="Two-Factor Authentication" desc="Verify identity via OTP on every login" on={twoFA} onToggle={() => setTwoFA(v => !v)} />
                    <Row label="Biometric Login" desc="Use fingerprint or Face ID to sign in" on={biometric} onToggle={() => setBiometric(v => !v)} />
                    <Row label="New Session Alerts" desc="Get notified of logins from new devices" on={sessionAlert} onToggle={() => setSessionAlert(v => !v)} />
                  </div>

                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pt-3.5 pb-2">Data Transparency</p>
                    {[
                      'Query logs are stored for 90 days then auto-deleted',
                      'We never sell your data to third parties',
                      'Analytics are computed on-device where possible',
                      'You can download or delete your data at any time',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 py-2 border-b border-zinc-50 last:border-0">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-[12px] text-zinc-700">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pt-3.5 pb-2">Permission Controls</p>
                    {[
                      { label: 'Location Access', desc: 'Used for market localisation', on: false },
                      { label: 'Camera Access',   desc: 'For profile photo upload',     on: true  },
                      { label: 'Clipboard Read',  desc: 'For quick query paste',        on: true  },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
                        <div>
                          <p className="text-[13px] font-semibold text-zinc-800">{p.label}</p>
                          <p className="text-[11px] text-zinc-400">{p.desc}</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.on ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                          {p.on ? 'Allowed' : 'Blocked'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <motion.button onClick={() => onNavigate('privacy')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-[12px] font-semibold hover:bg-zinc-100 transition-colors" whileHover={{ scale: 1.01 }}>
                    <span>View full Privacy Policy</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <motion.div key="notifs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Notification Preferences</h3>
                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pt-3.5 pb-2">In-App Alerts</p>
                    <Row label="AI Insights"   desc="New patterns and opportunities"   on={notifInsight} onToggle={() => setNotifInsight(v => !v)} />
                    <Row label="Risk Alerts"   desc="Critical risk score changes"      on={notifAlert}   onToggle={() => setNotifAlert(v => !v)}   />
                    <Row label="System Updates" desc="Platform updates and maintenance" on={notifUpdate}  onToggle={() => setNotifUpdate(v => !v)}  />
                  </div>
                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider pt-3.5 pb-2">Email Notifications</p>
                    <Row label="Weekly Digest" desc="Summarised analytics report" on={notifEmail} onToggle={() => setNotifEmail(v => !v)} />
                  </div>
                  <motion.button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    Save Preferences
                  </motion.button>
                </motion.div>
              )}

              {/* ── SUBSCRIPTION ── */}
              {activeTab === 'subscription' && (
                <motion.div key="sub" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Subscription Plan</h3>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-extrabold text-black">Current Plan</span>
                      <span className="bg-zinc-900 text-white text-[11px] font-bold px-3 py-1 rounded-full">{currentUser?.plan ?? 'Pro'}</span>
                    </div>
                    <p className="text-[22px] font-extrabold text-black mb-1">₹4,999<span className="text-[13px] text-zinc-400 font-normal">/month</span></p>
                    <p className="text-[12px] text-zinc-500 mb-4">Renews on 12 August 2025 · Auto-renewal ON</p>
                    {['Unlimited queries & analysis', 'All 6 analytics modules', 'Export reports (PDF/Excel)', 'Priority support', 'Real-time risk scoring'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-zinc-700 mb-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />{f}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 rounded-xl border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Manage Billing</button>
                    <button className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors">Upgrade Plan</button>
                  </div>
                </motion.div>
              )}

              {/* ── DATA PREFERENCES ── */}
              {activeTab === 'data' && (
                <motion.div key="data" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Data Preferences</h3>
                  <div className="bg-white border border-zinc-100 rounded-2xl px-4 mb-4">
                    <Row label="Share Analytics Data" desc="Help improve CideDec (anonymised)" on={analyticsShare} onToggle={() => setAnalyticsShare(v => !v)} />
                    <Row label="Crash Reports"        desc="Auto-send error reports"             on={crashReports}   onToggle={() => setCrashReports(v => !v)}   />
                  </div>
                  <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-4">
                    <p className="text-[12px] font-semibold text-zinc-700 mb-2">Query history retention</p>
                    <select value={dataRetention} onChange={e => setDataRetention(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all">
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Export My Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── SIGN OUT ── */}
              {activeTab === 'logout' && (
                <motion.div key="logout" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-[13px] font-extrabold text-black mb-4 uppercase tracking-wider">Sign Out</h3>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-[13px] font-bold text-red-800">You are about to sign out</p>
                    </div>
                    <p className="text-[12px] text-red-700 leading-relaxed">Your session will be securely ended. All unsaved analysis results will be cleared. Your account data, settings, and query history are safely stored in the cloud.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors">Cancel</button>
                    <motion.button onClick={() => { onClose(); signOut(); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold shadow-sm transition-colors"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
