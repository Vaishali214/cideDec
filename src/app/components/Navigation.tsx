import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, LogOut, Bell, ChevronDown, Lock,
  Shield, Settings, Zap, CheckCheck, Info, AlertCircle,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { SearchAuthModal } from './SearchAuthModal';
import type { Page } from '../App';

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenSettings: () => void;
  onOpenAuthModal?: () => void;
  showAuthModal?: boolean;
  onCloseAuthModal?: () => void;
}

const notifIconMap = { insight: Zap, alert: AlertCircle, update: Info, success: CheckCheck } as const;
const notifColorMap = {
  insight: 'text-zinc-700 bg-zinc-100',
  alert:   'text-zinc-700 bg-zinc-100',
  update:  'text-zinc-700 bg-zinc-100',
  success: 'text-zinc-700 bg-zinc-100',
} as const;

export function Navigation({
  currentPage, onNavigate, onOpenSettings,
  onOpenAuthModal, showAuthModal = false, onCloseAuthModal,
}: NavProps) {
  const { notifications, unreadCount, markAllRead, signOut, currentUser, isAuthenticated, setPendingQuery } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen,    setBellOpen]    = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (bellRef.current    && !bellRef.current.contains(e.target as Node))    setBellOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-150 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-10">
          <div className="flex items-center justify-between h-14">

            {/* Brand */}
            <motion.button
              className="flex items-center gap-2.5 select-none group"
              onClick={() => onNavigate('home')}
              whileTap={{ scale: 0.97 }}>
              <div className="w-7 h-7 shrink-0">
                <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
                  <rect width="28" height="28" rx="7" fill="#111111"/>
                  <path d="M8 20V12C8 10.9 8.9 10 10 10H15.5C17.43 10 19 11.57 19 13.5C19 15.43 17.43 17 15.5 17H10V20"
                    stroke="white" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="20" r="1.2" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-[15px] tracking-[-0.025em] text-zinc-900 group-hover:text-zinc-600 transition-colors">
                CideDec
              </span>
              {isAuthenticated && currentUser?.plan && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[9px] font-bold tracking-[0.08em] uppercase">
                  {currentUser.plan}
                </span>
              )}
            </motion.button>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {!isAuthenticated && (
                <motion.button
                  onClick={() => { setPendingQuery(''); onOpenAuthModal?.(); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white text-[12px] font-medium transition-colors"
                  whileTap={{ scale: 0.97 }}>
                  <Lock className="w-3 h-3" />
                  Sign in
                </motion.button>
              )}

              {/* Bell */}
              {isAuthenticated && (
                <div className="relative" ref={bellRef}>
                  <motion.button
                    onClick={() => { setBellOpen(v => !v); setProfileOpen(false); }}
                    className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      bellOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                    whileTap={{ scale: 0.94 }}>
                    <Bell className="w-[15px] h-[15px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-[8px] right-[8px] w-[6px] h-[6px] bg-zinc-900 rounded-full ring-[1.5px] ring-white" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div
                        className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-zinc-100 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}>

                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-zinc-900">Notifications</p>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-bold rounded-full tabular-nums">{unreadCount}</span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[11px] text-zinc-500 font-medium hover:text-zinc-900 transition-colors">
                              Mark read
                            </button>
                          )}
                        </div>

                        <div className="max-h-[260px] overflow-y-auto">
                          {notifications.map((n, idx) => {
                            const NIcon = notifIconMap[n.type];
                            return (
                              <motion.div key={n.id}
                                className={`flex gap-3 px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50/60 cursor-pointer transition-colors ${!n.read ? 'bg-zinc-50/40' : ''}`}
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notifColorMap[n.type]}`}>
                                  <NIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className={`text-[12px] font-semibold leading-snug ${!n.read ? 'text-zinc-900' : 'text-zinc-500'}`}>{n.title}</p>
                                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0 mt-1" />}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.body}</p>
                                  <p className="text-[10px] text-zinc-300 mt-0.5">{n.time}</p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className="px-4 py-2.5 bg-zinc-50/50 border-t border-zinc-100">
                          <p className="text-[10px] text-zinc-400 text-center tracking-wide">
                            Alerts for new insights are active
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Profile */}
              {isAuthenticated && (
                <div className="relative" ref={profileRef}>
                  <motion.button
                    onClick={() => { setProfileOpen(v => !v); setBellOpen(false); }}
                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg transition-colors ${profileOpen ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                    whileTap={{ scale: 0.97 }}>
                    <div className="w-[28px] h-[28px] rounded-lg bg-zinc-900 flex items-center justify-center text-white text-[10px] font-semibold tracking-wide">
                      {initials}
                    </div>
                    <span className="text-[12.5px] font-medium text-zinc-700 hidden sm:block">{currentUser?.fullName?.split(' ')[0]}</span>
                    <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                      <ChevronDown className="w-3 h-3 text-zinc-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-zinc-100 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
                        <div className="px-4 py-3 bg-zinc-50/60 border-b border-zinc-100">
                          <p className="text-[13px] font-semibold text-zinc-900 truncate">{currentUser?.fullName}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{currentUser?.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { icon: User,     label: 'Profile',  action: () => { onNavigate('profile'); setProfileOpen(false); } },
                            { icon: Settings, label: 'Settings', action: () => { setProfileOpen(false); onOpenSettings(); } },
                            { icon: Shield,   label: 'Privacy',  action: () => { onNavigate('privacy'); setProfileOpen(false); } },
                            { icon: LogOut,   label: 'Sign out', danger: true, action: () => { setProfileOpen(false); signOut(); } },
                          ].map((item, i) => {
                            const IIcon = item.icon;
                            return (
                              <div key={i}>
                                {i === 3 && <div className="my-1 mx-3 border-t border-zinc-100" />}
                                <motion.button onClick={item.action}
                                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${item.danger ? 'hover:bg-red-50' : 'hover:bg-zinc-50'}`}
                                  whileHover={{ x: 1.5 }}>
                                  <IIcon className={`w-3.5 h-3.5 ${item.danger ? 'text-red-400' : 'text-zinc-400'}`} />
                                  <span className={`text-[12.5px] font-medium ${item.danger ? 'text-red-600' : 'text-zinc-700'}`}>{item.label}</span>
                                </motion.button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showAuthModal && (
          <SearchAuthModal
            pendingQuery=""
            onClose={() => onCloseAuthModal?.()}
            onAuthSuccess={() => onCloseAuthModal?.()}
          />
        )}
      </AnimatePresence>
    </>
  );
}
