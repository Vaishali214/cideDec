import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, Building2, Globe, Save,
  Camera, ShieldCheck, Bell, CreditCard,
  ArrowLeft, CheckCircle2, Edit3, Settings,
  MapPin, Upload, Trash2, X, Briefcase,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { SettingsPanel } from './SettingsPanel';
import type { Page } from '../App';

interface MyProfileProps { onNavigate: (page: Page) => void }

export function MyProfile({ onNavigate }: MyProfileProps) {
  const { currentUser, notifications } = useApp();
  const [editing,      setEditing]      = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const initials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const [fields, setFields] = useState({
    fullName:  currentUser?.fullName ?? 'User',
    email:     currentUser?.email    ?? '',
    phone:     '+91 98765 43210',
    company:   'CideDec Technologies',
    role:      'Chief Analytics Officer',
    website:   'https://cidedec.com',
    bio:       'Data-driven strategist specialising in AI-led business intelligence and growth analytics.',
    location:  'Mumbai, India',
  });

  const personalFields = [
    { label: 'Full Name',    value: fields.fullName, key: 'fullName', icon: User,      type: 'text'  },
    { label: 'Email',        value: fields.email,    key: 'email',    icon: Mail,      type: 'email' },
    { label: 'Phone',        value: fields.phone,    key: 'phone',    icon: Phone,     type: 'tel'   },
    { label: 'Location',     value: fields.location, key: 'location', icon: MapPin,    type: 'text'  },
  ] as const;

  const professionalFields = [
    { label: 'Company',      value: fields.company,  key: 'company',  icon: Building2, type: 'text'  },
    { label: 'Designation',  value: fields.role,     key: 'role',     icon: Briefcase, type: 'text'  },
    { label: 'Website',      value: fields.website,  key: 'website',  icon: Globe,     type: 'url'   },
  ] as const;

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /* ── Photo handlers ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target?.result as string);
      setShowPhotoMenu(false);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setShowPhotoMenu(false);
  };

  const statCards = [
    { label: 'Queries Run',    value: '142' },
    { label: 'Reports Saved',  value: '38'  },
    { label: 'Insights Found', value: '294' },
    { label: 'Days Active',    value: '61'  },
  ];

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-16">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <motion.button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-[16px] font-extrabold text-black tracking-tight">My Profile</h1>
            <p className="text-[11px] text-zinc-400 mt-0.5">Manage your account and personal information</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AnimatePresence>
              {saved && (
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[12px] text-emerald-700 font-semibold"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50 shadow-sm transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </motion.button>
            {editing ? (
              <motion.button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 space-y-6">

        {/* ═══ Avatar Card ═══ */}
        <motion.div
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex items-start gap-5"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {/* Profile photo with upload */}
          <div className="relative shrink-0">
            <div className="w-[80px] h-[80px] rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-[24px] font-extrabold shadow-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Camera button */}
            <motion.button
              onClick={() => setShowPhotoMenu(prev => !prev)}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-zinc-900 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <Camera className="w-3.5 h-3.5" />
            </motion.button>

            {/* Photo dropdown menu */}
            <AnimatePresence>
              {showPhotoMenu && (
                <motion.div
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50"
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <button
                    onClick={() => { cameraInputRef.current?.click(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-zinc-400" /> Take a photo
                  </button>
                  <button
                    onClick={() => { fileInputRef.current?.click(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors border-t border-zinc-50"
                  >
                    <Upload className="w-4 h-4 text-zinc-400" /> Upload from device
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleRemovePhoto}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-zinc-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" /> Remove photo
                    </button>
                  )}
                  <button
                    onClick={() => setShowPhotoMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-zinc-400 hover:bg-zinc-50 transition-colors border-t border-zinc-100"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile summary */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-extrabold text-black leading-tight">{fields.fullName}</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">{fields.role} · {fields.company}</p>
            <p className="text-[12px] text-zinc-400 mt-0.5 truncate">{fields.email}</p>
            <div className="flex items-center gap-2 mt-3.5">
              <div className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
                <span className="text-[11px] font-bold text-zinc-700">{currentUser?.plan ?? 'Pro'} Plan · Active</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1">
                <MapPin className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px] font-medium text-zinc-500">{fields.location}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Statistics ═══ */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {statCards.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm text-center">
              <p className="text-[24px] font-extrabold text-black leading-none">{s.value}</p>
              <p className="text-[11px] text-zinc-400 font-medium mt-1.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ═══ Subscription Plan ═══ */}
        <motion.div
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-extrabold text-black uppercase tracking-wider">Subscription Plan</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Manage your billing and subscription</p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-white rounded-full px-3 py-1">
              <CreditCard className="w-3 h-3" />
              <span className="text-[11px] font-bold">{currentUser?.plan ?? 'Pro'}</span>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[28px] font-extrabold text-black">₹4,999</span>
              <span className="text-[13px] text-zinc-400">/month</span>
            </div>
            <p className="text-[12px] text-zinc-500 mb-4">Renews on 12 August 2025 · Auto-renewal ON</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
              {['Unlimited queries & analysis', 'All 6 analytics modules', 'Export reports (PDF/Excel)', 'Priority support'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-zinc-600">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowSettings(true)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              >
                Manage Billing
              </motion.button>
              <motion.button
                onClick={() => setShowSettings(true)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-semibold shadow-sm transition-colors"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              >
                Upgrade Plan
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ═══ Personal Information ═══ */}
        <motion.div
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="px-5 py-4 border-b border-zinc-100">
            <p className="text-[12px] font-extrabold text-black uppercase tracking-wider">Personal Information</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Your private details — only visible to you</p>
          </div>
          <div className="divide-y divide-zinc-50">
            {personalFields.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <FIcon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">{f.label}</p>
                    {editing ? (
                      <input
                        type={f.type}
                        value={fields[f.key]}
                        onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full text-[13px] font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all"
                      />
                    ) : (
                      <p className="text-[13px] font-medium text-zinc-800 truncate">{f.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ Professional Information ═══ */}
        <motion.div
          className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-5 py-4 border-b border-zinc-100">
            <p className="text-[12px] font-extrabold text-black uppercase tracking-wider">Professional Information</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Company and role details</p>
          </div>
          <div className="divide-y divide-zinc-50">
            {professionalFields.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <FIcon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">{f.label}</p>
                    {editing ? (
                      <input
                        type={f.type}
                        value={fields[f.key]}
                        onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full text-[13px] font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all"
                      />
                    ) : (
                      <p className="text-[13px] font-medium text-zinc-800 truncate">{f.value}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bio */}
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <Edit3 className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Bio</p>
                {editing ? (
                  <textarea
                    value={fields.bio}
                    onChange={e => setFields(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full text-[13px] font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all resize-none"
                  />
                ) : (
                  <p className="text-[13px] font-medium text-zinc-600 leading-relaxed">{fields.bio}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Quick Access ═══ */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {[
            { icon: ShieldCheck, label: 'Privacy & Security', desc: '2FA enabled · E2E encrypted',             action: () => onNavigate('privacy')      },
            { icon: Bell,        label: 'Notifications',      desc: `${unread} unread alert${unread !== 1 ? 's' : ''}`,  action: () => setShowSettings(true) },
            { icon: CreditCard,  label: 'Billing & Plan',     desc: `${currentUser?.plan ?? 'Pro'} · Renews Aug 2025`,   action: () => setShowSettings(true) },
          ].map((t, i) => {
            const TIcon = t.icon;
            return (
              <motion.button
                key={i}
                onClick={t.action}
                className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm cursor-pointer hover:shadow-md transition-all text-left group"
                whileHover={{ y: -2 }}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-3 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <TIcon style={{ width: 18, height: 18 }} />
                </div>
                <p className="text-[13px] font-bold text-black mb-0.5">{t.label}</p>
                <p className="text-[11px] text-zinc-400">{t.desc}</p>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} onNavigate={(p) => { setShowSettings(false); onNavigate(p); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
