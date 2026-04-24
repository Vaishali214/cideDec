import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, EyeIcon, EyeOffIcon, Key, Loader2, Search, ShieldCheck, AlertCircle, UserPlus } from 'lucide-react';
import { useApp } from '../AppContext';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SearchAuthModalProps {
  pendingQuery: string;
  onClose: () => void;
  onAuthSuccess: (query: string) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Pro Demo',   user: 'vaishali', pw: 'DecisionAI@123' },
  { label: 'Admin',      user: 'admin',    pw: 'admin123'        },
  { label: 'Free Trial', user: 'demo',     pw: 'demo'            },
];

/* ── CideDec Logo ── */
const CideDecLogo = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-10 h-10">
    <rect width="28" height="28" rx="7" fill="#111111" />
    <path
      d="M8 20V12C8 10.9 8.9 10 10 10H15.5C17.43 10 19 11.57 19 13.5C19 15.43 17.43 17 15.5 17H10V20"
      stroke="white" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="8" cy="20" r="1.2" fill="white" />
  </svg>
);

export function SearchAuthModal({ pendingQuery, onClose, onAuthSuccess }: SearchAuthModalProps) {
  const { login, register } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  /* Sign-in fields */
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]  = useState('');

  /* Sign-up fields */
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName,  setSignupLastName]  = useState('');
  const [signupEmail,     setSignupEmail]     = useState('');
  const [signupUsername,  setSignupUsername]   = useState('');
  const [signupPassword,  setSignupPassword]  = useState('');

  const [showPw,      setShowPw]     = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState('');
  const [rememberMe,  setRememberMe] = useState(true);
  const [agreeTerms,  setAgreeTerms] = useState(false);

  /* Escape key closes modal */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Reset errors when switching modes */
  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setError('');
    setShowPw(false);
  };

  /* ── Sign In ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter your username.'); return; }
    if (!password)         { setError('Please enter your password.');  return; }

    setError('');
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.ok) { setError(result.error ?? 'Login failed.'); return; }
    onAuthSuccess(pendingQuery);
  };

  /* ── Sign Up ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupFirstName.trim()) { setError('Please enter your first name.'); return; }
    if (!signupEmail.trim())     { setError('Please enter your email.');      return; }
    if (!signupUsername.trim())   { setError('Please choose a username.');     return; }
    if (!signupPassword)         { setError('Please create a password.');     return; }
    if (signupPassword.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (!agreeTerms)             { setError('Please agree to the Terms & Conditions.'); return; }

    setError('');
    setLoading(true);
    const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`.trim();
    const result = await register({
      username: signupUsername.trim(),
      email: signupEmail.trim(),
      fullName,
      password: signupPassword,
    });
    setLoading(false);

    if (!result.ok) { setError(result.error ?? 'Registration failed.'); return; }
    onAuthSuccess(pendingQuery);
  };

  const fillDemo = (user: string, pw: string) => {
    setUsername(user);
    setPassword(pw);
    setError('');
    setMode('signin');
  };

  return (
    <motion.div
      className="fixed inset-0 z-[980] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[10px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-none shadow-2xl pb-0 overflow-hidden">
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            whileTap={{ scale: 0.92 }}
            title="Close"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-7">
            <CideDecLogo />
            <div className="space-y-0.5 flex flex-col items-center">
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'signin' ? 'Sign in to CideDec' : 'Create an account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'signin'
                  ? 'Welcome back! Please enter your details.'
                  : 'Sign up to unlock AI-powered insights.'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-7">
            {/* Pending query preview */}
            <AnimatePresence>
              {pendingQuery && (
                <motion.div
                  className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: 0.08, duration: 0.2 }}
                >
                  <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-[12px] text-zinc-600 font-medium flex-1 truncate">"{pendingQuery}"</p>
                  <span className="text-[10px] text-zinc-400 font-semibold shrink-0">runs after login</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ═══ SIGN IN FORM ═══ */}
              {mode === 'signin' && (
                <motion.form
                  key="signin"
                  onSubmit={handleSignIn}
                  noValidate
                  className="space-y-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="auth-username">Username</Label>
                    <Input
                      id="auth-username"
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); if (error) setError(''); }}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-0">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="auth-password">Password</Label>
                      <button type="button" className="text-[12px] text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="auth-password"
                        className="pe-9"
                        placeholder="Enter your password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                        autoComplete="current-password"
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
                    <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" type="submit" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Signing in…</> : 'Sign In'}
                    </Button>
                    <Button variant="outline" className="w-full" type="button">
                      <Key className="mr-2 h-4 w-4" /> Single sign-on (SSO)
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* ═══ SIGN UP FORM ═══ */}
              {mode === 'signup' && (
                <motion.form
                  key="signup"
                  onSubmit={handleSignUp}
                  noValidate
                  className="space-y-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-first">First name</Label>
                      <Input id="signup-first" value={signupFirstName} onChange={e => { setSignupFirstName(e.target.value); if (error) setError(''); }} placeholder="First name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-last">Last name</Label>
                      <Input id="signup-last" value={signupLastName} onChange={e => setSignupLastName(e.target.value)} placeholder="Last name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <Input id="signup-email" type="email" value={signupEmail} onChange={e => { setSignupEmail(e.target.value); if (error) setError(''); }} placeholder="you@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-user">Username</Label>
                    <Input id="signup-user" value={signupUsername} onChange={e => { setSignupUsername(e.target.value); if (error) setError(''); }} placeholder="Choose a username" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-pw">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-pw"
                        className="pe-9"
                        type={showPw ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={e => { setSignupPassword(e.target.value); if (error) setError(''); }}
                        placeholder="Create a password"
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Conditions</a>
                    </label>
                  </div>

                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Creating account…</> : <><UserPlus className="w-4 h-4 mr-1.5" /> Create free account</>}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Demo accounts (sign-in mode only) */}
            {mode === 'signin' && (
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-[10px] text-zinc-400 text-center uppercase tracking-wider mb-3">Try a demo account</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <motion.button
                      key={acc.user}
                      type="button"
                      onClick={() => fillDemo(acc.user, acc.pw)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-900 transition-all"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {acc.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 pb-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-zinc-400">256-bit encrypted · Session secured</span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t !py-4">
            <p className="text-center text-sm text-muted-foreground">
              {mode === 'signin' ? (
                <>New to CideDec?{' '}
                  <button onClick={() => switchMode('signup')} className="text-primary hover:underline font-medium">Sign up</button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="text-primary hover:underline font-medium">Sign in</button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
