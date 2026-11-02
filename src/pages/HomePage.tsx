import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { Sparkles, Scissors, BarChart3, Scan, History, Camera, Users, TrendingUp, ArrowUp, User, X, Crown, Languages, Globe, Trophy, ChevronRight, ListChecks, Droplet, Dumbbell } from 'lucide-react';
import { getHistory } from '../lib/history';
import GradientButton from '../components/GradientButton';
import PremiumModal from '../components/PremiumModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { tr } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedBoost, setSavedBoost] = useState<number | null>(null);
  const { t } = useLanguage();
  const { user, isPremium } = useAuth();
  const { updateLastActive } = useActivityTracker();

  useEffect(() => { updateLastActive(); }, []);

  const calculatePercentile = (score: number): number => {
    if (score >= 1 && score <= 10) return 1;
    if (score >= 11 && score <= 20) return 2;
    if (score >= 21 && score <= 30) return 5;
    if (score >= 31 && score <= 40) return 9;
    if (score >= 41 && score <= 50) return 16;
    if (score >= 51 && score <= 60) return 20;
    if (score >= 61 && score <= 70) return 18;
    if (score >= 71 && score <= 80) return 15;
    if (score >= 81 && score <= 90) return 9;
    if (score >= 91 && score <= 100) return 5;
    return 1;
  };

  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        supabase
          .from('facial_profiles')
          .select('potential_boost')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.potential_boost) setSavedBoost(profile.potential_boost);
          });
        const { ok, data } = await getHistory({ userId: user.id, limit: 100 });
        if (ok && data) {
          setAnalysisCount(data.length);
          if (data.length > 0) {
            const scores = data.map(a => a.analysis?.overall || 0);
            const maxScore = Math.max(...scores);
            if (maxScore > 0) {
              setBestScore(maxScore);
              setPercentile(calculatePercentile(maxScore));
            } else {
              setBestScore(null);
              setPercentile(null);
            }
          } else {
            setBestScore(null);
            setPercentile(null);
          }
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserStats();
  }, [user]);

  const renderJoinPremiumButton = () => null;

  const renderAnalysisTab = () => (
    <main className="nf-home-content" aria-labelledby="nf-home-title">
      <header className="nf-home-heading">
        <p className="nf-eyebrow">{tr('YOUR PERSONAL FACE GUIDE', 'TU GUÍA FACIAL PERSONAL')}</p>
        <h2 id="nf-home-title">{tr('A little care. A better you.', 'Cuídate. Descubre tu mejor versión.')}</h2>
      </header>

      <section className="nf-analysis" aria-labelledby="nf-analysis-title">
        <div className="nf-analysis-copy">
          <span className="nf-section-label"><Scan size={16} aria-hidden="true" />{tr('DISCOVER', 'DESCUBRE')}</span>
          <h3 id="nf-analysis-title">{tr('Facial Analysis', 'Análisis facial')}</h3>
          <p>{tr('Get specific scores and data about your face.', 'Recibe puntuaciones y datos específicos sobre tu rostro.')}</p>
          <button type="button" className="nf-primary" onClick={() => onNavigate('upload')}>
            <span>{t.startAIAnalysis}</span><ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="nf-analysis-portrait">
          <img src="https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/ChatGPT%20Image%2012%20sept%202026,%2021_46_21.png" alt="" aria-hidden="true" />
        </div>
      </section>

      <button type="button" className="nf-potential" onClick={() => onNavigate('potential-test')}>
        <span className="nf-potential-icon"><ArrowUp size={22} aria-hidden="true" /></span>
        <span className="nf-potential-copy">
          <span className="nf-potential-title">{tr('True Potential Test', 'Test de Potencial Real')}
            {savedBoost != null && <span className="nf-boost">+{savedBoost}%</span>}
          </span>
          <span className="nf-secondary-text">{savedBoost ? tr('Retake the test to update your score', 'Repite el test para actualizar tu puntuación') : tr('Find out your attractiveness potential', 'Descubre tu potencial de atractivo')}</span>
        </span>
        <ChevronRight className="nf-row-arrow" size={20} aria-hidden="true" />
      </button>

      <section className="nf-routines" aria-labelledby="nf-routines-title">
        <div className="nf-section-heading">
          <div><p className="nf-eyebrow">{tr('DAILY CARE', 'CUIDADO DIARIO')}</p><h3 id="nf-routines-title">{tr('Routines', 'Rutinas')}</h3></div>
          <ListChecks size={22} aria-hidden="true" />
        </div>
        <div className="nf-routine-grid">
          <article className="nf-routine-card">
            <div className="nf-routine-image"><img src="https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Facial%20massage%20image.png" alt="" loading="lazy" /><span className="nf-photo-label">01</span></div>
            <div className="nf-routine-body">
              <h4>{tr('Facial Massages', 'Masajes faciales')}</h4>
              <p>{tr('Get rid of liquids and define your face.', 'Elimina líquidos y define tu rostro.')}</p>
              <button type="button" className="nf-routine-action" onClick={() => onNavigate('routine-detail')}>
                <span>{tr('View routine', 'Ver rutina')}</span><ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
          <article className="nf-routine-card">
            <div className="nf-routine-image"><img src="https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/ice%20image.png" alt="" loading="lazy" /><span className="nf-photo-label">02</span>{!isPremium && <span className="nf-premium-label"><Crown size={12} aria-hidden="true" />Premium</span>}</div>
            <div className="nf-routine-body">
              <h4>{tr('Facial Icing', 'Hielo facial')}</h4>
              <p>{tr('Use ice to get rid of morning puffiness.', 'Usa hielo para reducir la hinchazón matutina.')}</p>
              <button type="button" className="nf-routine-action" onClick={() => isPremium ? onNavigate('icing-routine') : setShowPremiumModal(true)}>
                <span>{isPremium ? tr('View routine', 'Ver rutina') : tr('Unlock with Premium', 'Desbloquear con Premium')}</span>
                {isPremium ? <ChevronRight size={16} aria-hidden="true" /> : <Crown size={16} aria-hidden="true" />}
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );

  const renderHairstylesTab = () => (
    <div className="max-w-2xl mx-auto pb-20 bg-transparent">
      {/* Hairstyles tab content will be added here */}
    </div>
  );

  const renderResultsTab = () => (
    <div className="max-w-2xl mx-auto pb-20 bg-transparent">
      <div className="text-center py-12">
        <p className="text-slate-400">Results page - Coming soon with better design</p>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-2xl mx-auto pb-20 bg-transparent">
      {user ? (
        <>
          {/* User Profile Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 mb-6 animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 text-sm">{tr('Online', 'En línea')}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : analysisCount}
                </div>
                <div className="text-slate-400 text-sm">{t.analysis}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : bestScore !== null ? Math.round(bestScore) : '-'}
                </div>
                <div className="text-slate-400 text-sm">{t.bestScore}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : percentile !== null ? `${percentile}%` : '-'}
                </div>
                <div className="text-slate-400 text-sm">{tr('% of analyzed faces', '% de rostros analizados')}</div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Account Section */}
      {user && <div className="mb-6">
        <h3 className="text-white font-semibold text-lg mb-4">{t.account}</h3>
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden animate-slide-up">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{t.editProfile}</div>
                <div className="text-slate-400 text-sm">{t.updatePersonalInfo}</div>
              </div>
            </div>
          </button>

          <div className="border-t border-slate-700/50"></div>

          <button 
            onClick={() => setShowPremiumModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{tr('Premium Settings', 'Configuración Premium')}</div>
                <div className="text-slate-400 text-sm">{tr('Manage your premium subscription', 'Gestiona tu suscripción premium')}</div>
              </div>
            </div>
          </button>
          <div className="border-t border-slate-700/50"></div>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Languages className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{t.language}</div>
                <div className="text-slate-400 text-sm">{t.currentLanguage}</div>
              </div>
            </div>
          </button>
        </div>
      </div>}
    </div>
  );

  return (
    <div className="nf-home">
      <div className="max-w-4xl mx-auto">
        {renderAnalysisTab()}
        {showPremiumModal && (
          <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        )}
      </div>
    </div>
  );
}
