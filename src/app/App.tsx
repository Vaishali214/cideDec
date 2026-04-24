import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { AppProvider, useApp } from './AppContext';
import { SmartSuggestions }   from './components/SmartSuggestions';
import { Dashboard }          from './pages/Dashboard';
import { MarketAnalysis }     from './pages/MarketAnalysis';
import { FinancialAnalysis }  from './pages/FinancialAnalysis';
import { Comparison }         from './pages/Comparison';
import { AIInsights }         from './pages/AIInsights';
import { MyProfile }          from './pages/MyProfile';
import { PrivacySecurity }    from './pages/PrivacySecurity';
import { SettingsPanel }      from './pages/SettingsPanel';
import { Navigation }         from './components/Navigation';

export type Page =
  | 'home' | 'dashboard' | 'market' | 'financial'
  | 'comparison' | 'insights' | 'profile' | 'privacy';

function AppShell() {
  const { isAuthenticated, logout, isSignedOut, cancelSignOut, lastQuery, setPendingQuery } = useApp();
  const [currentPage,   setCurrentPage]   = useState<Page>('home');
  const [showSettings,  setShowSettings]  = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleConfirmSignOut = () => { cancelSignOut(); logout(); };

  const guardedNavigate = (page: Page) => {
    const publicPages: Page[] = ['home'];
    if (!publicPages.includes(page) && !isAuthenticated) return;
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':       return <SmartSuggestions  onNavigate={guardedNavigate} />;
      case 'dashboard':  return isAuthenticated ? <Dashboard         onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'market':     return isAuthenticated ? <MarketAnalysis    onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'financial':  return isAuthenticated ? <FinancialAnalysis onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'comparison': return isAuthenticated ? <Comparison        onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'insights':   return isAuthenticated ? <AIInsights        onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'profile':    return isAuthenticated ? <MyProfile         onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      case 'privacy':    return isAuthenticated ? <PrivacySecurity   onNavigate={guardedNavigate} /> : <SmartSuggestions onNavigate={guardedNavigate} />;
      default:           return <SmartSuggestions onNavigate={guardedNavigate} />;
    }
  };

  return (
    <div className="size-full flex flex-col">
      <Navigation
        currentPage={currentPage}
        onNavigate={guardedNavigate}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAuthModal={() => { setPendingQuery(''); setShowAuthModal(true); }}
        showAuthModal={showAuthModal}
        onCloseAuthModal={() => setShowAuthModal(false)}
      />
      <div className="flex-1 overflow-auto">{renderPage()}</div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && isAuthenticated && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onNavigate={(p) => { setCurrentPage(p); setShowSettings(false); }}
          />
        )}
      </AnimatePresence>

      {/* Sign-out confirmation overlay */}
      <AnimatePresence>
        {isSignedOut && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <div className="w-11 h-11 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-4.5 h-4.5 text-zinc-600" />
              </div>
              <h2 className="text-[16px] font-bold text-zinc-900 mb-2">Sign out of CideDec?</h2>

              {lastQuery && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 mb-4">
                  <p className="text-[11px] text-zinc-400 mb-0.5">Your last query was saved:</p>
                  <p className="text-[12px] font-semibold text-zinc-800 truncate">"{lastQuery}"</p>
                </div>
              )}

              <p className="text-[12px] text-zinc-400 mb-6 leading-relaxed">
                Your session will end securely. Analytics history and settings are preserved.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={cancelSignOut}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-100 text-[13px] font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Stay
                </motion.button>
                <motion.button
                  onClick={handleConfirmSignOut}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium transition-colors"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
