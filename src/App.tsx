import React, { useState, useEffect, useCallback } from 'react';
import { Scan, History, User, Crown, Sparkles, BarChart3, MessageCircle } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { getSignedUrl } from './lib/storage';
import AnimatedSplash from './components/AnimatedSplash';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import IntroductionPage from './pages/IntroductionPage';
import ResultsPage from './pages/ResultsPage';
import AnalysisViewPage from './pages/AnalysisViewPage';
import PreviousAnalysesPage from './pages/PreviousAnalysesPage';
import GlowupMapPage from './pages/GlowupMapPage';
import OnboardingPage from './pages/OnboardingPage';
import HaircutsPage from './pages/HaircutsPage';
import ChatPage from './pages/ChatPage';
import PotentialTestPage from './pages/PotentialTestPage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import IcingRoutinePage from './pages/IcingRoutinePage';
import StepExecutionPage from './pages/StepExecutionPage';
import { MASSAGES_FLOW, ICING_FLOW } from './lib/routineData';
import type { RoutineFlow } from './types/routine';
import PremiumModal from './components/PremiumModal';
import LoadingSpinner from './components/LoadingSpinner';
import CreatorCodeModal from './components/CreatorCodeModal';
import SetNewPasswordModal from './components/SetNewPasswordModal';
import EmailConfirmedScreen from './components/EmailConfirmedScreen';
import PasswordResetScreen from './components/PasswordResetScreen';
import { FacialAnalysis } from './types';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useActivityTracker } from './hooks/useActivityTracker';

type PageType = 'intro' | 'onboarding' | 'home' | 'analysis' | 'upload' | 'results' | 'profile' | 'auth' | 'analysis-view' | 'previous-analyses' | 'glowup-map' | 'haircuts' | 'chat' | 'potential-test' | 'routine-detail' | 'icing-routine' | 'step-execution';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('intro');
  const [pageTransition, setPageTransition] = useState(false);
  const [preLoginTransition, setPreLoginTransition] = useState(false);
  const [analysisData, setAnalysisData] = useState<FacialAnalysis | null>(null);
  const [chatAnalysisId, setChatAnalysisId] = useState<string>('');
  const [chatAnalysisScore, setChatAnalysisScore] = useState<number | undefined>(undefined);
  const [chatReturnPage, setChatReturnPage] = useState<PageType>('haircuts');
  const [activeFlow, setActiveFlow] = useState<RoutineFlow>(MASSAGES_FLOW);
  const [stepExecutionReturn, setStepExecutionReturn] = useState<PageType>('routine-detail');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCreatorCodeModal, setShowCreatorCodeModal] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [logoTapTimer, setLogoTapTimer] = useState<NodeJS.Timeout | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading, isPremium, isPasswordRecovery, isEmailJustConfirmed, isPasswordJustReset } = useAuth();
  const { updateLastActive } = useActivityTracker();

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  useEffect(() => {

    if (user?.id) {
      supabase
        .from('facial_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to update last_active_at:', error);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    updateLastActive();
  }, [currentPage]);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); return; }
    supabase
      .from('facial_profiles')
      .select('avatar_path')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data?.avatar_path) {
          const signed = await getSignedUrl(data.avatar_path);
          setAvatarUrl(signed);
        } else {
          setAvatarUrl(null);
        }
      });
  }, [user]);
  const { t } = useLanguage();

  // Redirect authenticated users from intro/onboarding/auth pages to analysis
  React.useEffect(() => {
    if (user && ['intro', 'onboarding', 'auth'].includes(currentPage)) {
      setCurrentPage('analysis');
    }
  }, [user, currentPage]);

  // Show animated splash on first load
  if (showSplash) {
    return <AnimatedSplash onComplete={handleSplashComplete} />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <LoadingSpinner message="Loading your account..." />
      </div>
    );
  }

  const handlePreLoginNav = (page: PageType) => {
    setPreLoginTransition(true);
    setTimeout(() => {
      setCurrentPage(page);
      requestAnimationFrame(() => setPreLoginTransition(false));
    }, 250);
  };

  // Email confirmation screen: render before any auth gates so it shows
  // even though the user was signed out after verifyOtp succeeded.
  if (isEmailJustConfirmed) {
    console.log('[AUTH DEBUG] App: rendering EmailConfirmedScreen');
    return <EmailConfirmedScreen />;
  }

  if (isPasswordJustReset) {
    console.log('[AUTH DEBUG] App: rendering PasswordResetScreen');
    return <PasswordResetScreen />;
  }

  console.log('[AUTH DEBUG] App render', { hasUser: !!user, loading, isPasswordRecovery, isEmailJustConfirmed });

  // Show auth page if user is not authenticated
  if (!user) {
    const preLoginContent = (() => {
      if (currentPage === 'intro') {
        return <IntroductionPage
          onGetStarted={() => handlePreLoginNav('onboarding')}
          onSignIn={() => handlePreLoginNav('auth')}
        />;
      }
      if (currentPage === 'onboarding') {
        return <OnboardingPage onComplete={() => handlePreLoginNav('auth')} />;
      }
      return <AuthPage onBack={() => handlePreLoginNav('intro')} />;
    })();

    return (
      <div
        className={`transition-opacity duration-300 ease-in-out ${preLoginTransition ? 'opacity-0' : 'opacity-100'}`}
      >
        {preLoginContent}
        <SetNewPasswordModal />
      </div>
    );
  }

  const handleNavigateWithData = (page: PageType, data?: FacialAnalysis) => {
    if (data) {
      setAnalysisData(data);
    }
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(page);
      requestAnimationFrame(() => setPageTransition(false));
    }, 250);
  };

  const handlePageChange = (page: PageType) => {
    updateLastActive();
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(page);
      requestAnimationFrame(() => setPageTransition(false));
    }, 250);
  };

  const handleNavigateToChat = (analysisId: string, score?: number, returnPage?: PageType) => {
    setChatAnalysisId(analysisId);
    setChatAnalysisScore(score);
    setChatReturnPage(returnPage ?? currentPage as PageType);
    handlePageChange('chat');
  };

  const handleLogoTap = () => {
    setLogoTapCount(prev => prev + 1);
    
    // Clear existing timer
    if (logoTapTimer) {
      clearTimeout(logoTapTimer);
    }
    
    // Set new timer to reset count after 20 seconds
    const newTimer = setTimeout(() => {
      setLogoTapCount(0);
    }, 20000);
    setLogoTapTimer(newTimer);
    
    // Check if we've reached 10 taps
    if (logoTapCount + 1 >= 10) {
      setShowCreatorCodeModal(true);
      setLogoTapCount(0);
      if (logoTapTimer) {
        clearTimeout(logoTapTimer);
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'analysis':
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'upload':
        return <AnalysisPage onBack={() => setCurrentPage('analysis')} onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} onNavigate={setCurrentPage} />;
      case 'results':
        return <ResultsPage onNavigate={handleNavigateWithData} />;
      case 'analysis-view':
        return <AnalysisViewPage onBack={() => setCurrentPage('results')} analysisData={analysisData} />;
      case 'previous-analyses':
        return <PreviousAnalysesPage onBack={() => setCurrentPage('analysis')} onNavigateToChat={handleNavigateToChat} />;
      case 'glowup-map':
        return <GlowupMapPage onBack={() => setCurrentPage('home')} />;
      case 'haircuts':
        return <HaircutsPage onBack={() => setCurrentPage('home')} onNavigateToChat={handleNavigateToChat} />;
      case 'chat':
        return <ChatPage onBack={() => handlePageChange(chatReturnPage)} analysisId={chatAnalysisId} analysisScore={chatAnalysisScore} />;
      case 'potential-test':
        return <PotentialTestPage onComplete={() => handlePageChange('home')} onBack={() => handlePageChange('home')} />;
      case 'routine-detail':
        return <RoutineDetailPage onBack={() => handlePageChange('home')} onStart={() => { setActiveFlow(MASSAGES_FLOW); setStepExecutionReturn('routine-detail'); handlePageChange('step-execution'); }} />;
      case 'icing-routine':
        if (!isPremium) {
          setShowPremiumModal(true);
          handlePageChange('home');
          return null;
        }
        return <IcingRoutinePage onBack={() => handlePageChange('home')} onStart={() => { setActiveFlow(ICING_FLOW); setStepExecutionReturn('icing-routine'); handlePageChange('step-execution'); }} />;
      case 'step-execution':
        return <StepExecutionPage flow={activeFlow} onBack={() => handlePageChange(stepExecutionReturn)} onComplete={() => handlePageChange(stepExecutionReturn)} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
      {/* Page Content with Transition */}
      <div className={`transition-opacity duration-300 ease-in-out ${pageTransition ? 'opacity-0' : 'opacity-100'}`}>
      {/* Top Navigation Bar */}
      {!['upload', 'chat', 'potential-test', 'routine-detail', 'icing-routine', 'step-execution'].includes(currentPage) && (
        <div className="flex justify-between items-center mb-4 pt-4 px-4">
          {/* App Name - Top Left */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span
                className="bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent cursor-pointer select-none"
                onClick={handleLogoTap}
              >
                Next
              </span>
              <span className="text-white">Face</span>
            </h1>
          </div>
          
          {/* Top Right Buttons */}
          <div className="flex items-center gap-2">
            {/* Premium Button - hidden for premium users */}
            {!isPremium && (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm rounded-full shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </button>
            )}
            {/* Profile Avatar Button */}
            <button
              onClick={() => handlePageChange('profile')}
              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${
                currentPage === 'profile'
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}

        {renderPage()}
      </div>

      {/* Static Bottom Navigation - Only show on main pages, not on special pages */}
      {!['upload', 'previous-analyses', 'chat', 'potential-test', 'routine-detail', 'icing-routine', 'step-execution'].includes(currentPage) && (
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-black/20 backdrop-blur-sm">
          <div className="max-w-md mx-auto px-2">
            <div className="flex justify-center">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-0.5 border border-slate-700/50 flex items-center gap-0.5">
                <button
                  onClick={() => handlePageChange('analysis')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    currentPage === 'analysis' || currentPage === 'home'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scan className="w-4 h-4" />
                  <span className="whitespace-nowrap">Analysis</span>
                </button>
                <button
                  onClick={() => handlePageChange('glowup-map')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    currentPage === 'glowup-map'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="whitespace-nowrap">Glowup</span>
                </button>
                <button
                  onClick={() => handlePageChange('haircuts')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    currentPage === 'haircuts'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t.haircuts}</span>
                </button>
                <button
                  onClick={() => handlePageChange('results')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    currentPage === 'results'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t.results}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* Creator Code Modal */}
      <CreatorCodeModal 
        isOpen={showCreatorCodeModal} 
        onClose={() => setShowCreatorCodeModal(false)} 
      />

      {/* Password Recovery Modal — also rendered here for the recovery flow,
          which authenticates the user (passing the !user gate) but still needs the modal. */}
      <SetNewPasswordModal />
    </div>
  );
}

export default App;