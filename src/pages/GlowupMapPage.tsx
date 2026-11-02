import React, { useState, useEffect } from 'react';
import { User, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';
import { getHistory, AnalysisRow } from '../lib/history';
import { supabase } from '../lib/supabaseClient';
import { extractInvokeErrorMessage } from '../lib/invokeError';
import { useActivityTracker } from '../hooks/useActivityTracker';
import PremiumModal from '../components/PremiumModal';

// Local storage key for persisting glowup map state
const GLOWUP_MAP_STORAGE_KEY = 'glowup_map_state';

// Haircut recommendations by face shape
const HAIRCUTS_BY_FACE_SHAPE: Record<string, string[]> = {
  "oval": ["Textured crop", "Low taper fade with volume", "Medium-length layered cut"],
  "square": ["Short quiff", "Classic side part", "Textured crop"],
  "rectangle": ["Side-swept fringe", "Low fade with medium top", "Messy crop"],
  "round": ["Mid fade with textured top", "Angular fringe crop", "Short pompadour"],
  "diamond": ["Textured fringe with low taper", "Messy crop", "Medium-length flow"],
  "triangle": ["Messy quiff", "Textured top with low fade", "Side-parted medium length"],
  "heart": ["Side-swept fringe", "Low taper with layered top", "Medium-length textured cut"]
};

// Types
type WeakPoint = {
  key: "jawline" | "cheekbones" | "skin" | "eyeArea" | "attractiveness" | "symmetry" | "faceShape";
  label: string;
  score: number;
  explanation: string;   // 2–4 sentences
  daily: string[];       // exactly 2
  weekly: string[];      // up to 3
};

type MaxPotential = { low: number; high: number; rangeText: string } | null;

type GlowupPlan = {
  weakPoints: WeakPoint[];
  maxPotential?: MaxPotential;
  symmetryPlan?: {
    key: string;
    title: string;
    baseline: number;
    explanation: string;
    daily: string[];
    weekly: string[];
  };
  faceShapePlan?: {
    key: string;
    title: string;
    baseline: number;
    explanation: string;
    daily: string[];
    weekly: string[];
  };
  haircuts?: string[];
};

interface GlowupMapPageProps {
  onBack: () => void;
}

export default function GlowupMapPage({ onBack }: GlowupMapPageProps) {
  const { user, isPremium } = useAuth();
  const { updateLastActive } = useActivityTracker();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => { updateLastActive(); }, []);

  // State
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRow | null>(null);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GlowupPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>("eyeArea");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadingSteps = [
    tr('Creating improvement plan…', 'Creando plan de mejora…'),
    tr('Personalizing tips…', 'Personalizando consejos…'),
    tr('Building weekly tasks…', 'Creando tareas semanales…'),
    tr('Finalizing timeline…', 'Finalizando cronograma…')
  ];

  // Load analysis and generate plan
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        setLoading(true);
        
        // Try to load persisted glowup map state
        const savedState = localStorage.getItem(`${GLOWUP_MAP_STORAGE_KEY}_${user.id}`);
        if (savedState && isInitialLoad) {
          try {
            const parsedState = JSON.parse(savedState);
            if (parsedState.selectedAnalysis && parsedState.plan) {
              // Validate the cached plan is complete enough — discard
              // truncated plans from the old max_tokens=2000 bug.
              const p = parsedState.plan as GlowupPlan;
              const valid =
                Array.isArray(p.weakPoints) && p.weakPoints.length === 3 &&
                p.weakPoints.every(wp => Array.isArray(wp.daily) && wp.daily.length >= 2) &&
                p.symmetryPlan && Array.isArray(p.symmetryPlan.daily) && p.symmetryPlan.daily.length > 0 &&
                p.faceShapePlan && Array.isArray(p.faceShapePlan.daily) && p.faceShapePlan.daily.length > 0;

              if (valid) {
                setSelectedAnalysis(parsedState.selectedAnalysis);
                setPlan(parsedState.plan);
                setActiveTab(parsedState.activeTab || 'eyeArea');
                setTaskChecks(parsedState.taskChecks || {});
                setIsInitialLoad(false);
                setLoading(false);
                return;
              } else {
                // Stale/truncated plan — clear it so we load analyses normally
                localStorage.removeItem(`${GLOWUP_MAP_STORAGE_KEY}_${user.id}`);
              }
            }
          } catch (e) {
            console.error('Error parsing saved glowup state:', e);
          }
        }
        
        // Get the last 10 analyses for selection
        const res = await getHistory({ userId: user.id, limit: 10 });
        if (!res.ok) {
          setErrorMsg(res.error || "Failed to load analyses.");
          return;
        }

        setAnalyses(res.data);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error loading analysis:', error);
        setErrorMsg('Failed to load analyses.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, isInitialLoad]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && selectedAnalysis && plan && !isInitialLoad) {
      const stateToSave = {
        selectedAnalysis,
        plan,
        activeTab,
        taskChecks,
        timestamp: Date.now()
      };
      localStorage.setItem(`${GLOWUP_MAP_STORAGE_KEY}_${user.id}`, JSON.stringify(stateToSave));
    }
  }, [user?.id, selectedAnalysis, plan, activeTab, taskChecks, isInitialLoad]);

  // Progress animation effect
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let stepTimer: NodeJS.Timeout;
    
    if (generating) {
      setProgress(0);
      setCurrentStep(0);
      
      // Progress waypoints: 8% → 28% → 58% → 82%
      const waypoints = [8, 28, 58, 82];
      let currentWaypoint = 0;
      
      const advanceProgress = () => {
        if (currentWaypoint < waypoints.length) {
          setProgress(waypoints[currentWaypoint]);
          currentWaypoint++;
          progressTimer = setTimeout(advanceProgress, 3200);
        }
      };
      
      // Start progress animation
      progressTimer = setTimeout(advanceProgress, 500);
      
      // Advance steps every 3.2 seconds
      const advanceStep = () => {
        setCurrentStep(prev => (prev + 1) % loadingSteps.length);
        stepTimer = setTimeout(advanceStep, 3200);
      };
      
      stepTimer = setTimeout(advanceStep, 3200);
    }
    
    return () => {
      if (progressTimer) clearTimeout(progressTimer);
      if (stepTimer) clearTimeout(stepTimer);
    };
  }, [generating]);

  // Complete progress animation when plan is ready
  useEffect(() => {
    if (plan && generating === false) {
      setProgress(100);
      // Hold at 100% briefly before showing plan
      setTimeout(() => {
        setProgress(0);
        setCurrentStep(0);
      }, 600);
    }
  }, [plan, generating]);

  // Generate glowup plan
  async function generatePlan(row: AnalysisRow) {
    try {
      setErrorMsg(null);
      setGenerating(true);
      setSelectedAnalysis(row);
      setPlan(null);

      // Ensure loading UI shows for at least 1.5 seconds
      const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data, error } = await supabase.functions.invoke("glowup-map", {
        body: { analysis: row.analysis, language: tr('en', 'es') },
        headers: { 'x-app-token': import.meta.env.VITE_APP_TOKEN ?? '' },
      });

      if (error) {
        console.error('Glowup map request failed:', error);
        const serverMessage = await extractInvokeErrorMessage(error);
        throw new Error(serverMessage ?? "We could not build your plan right now. Please try again.");
      }

      if (data?.rate_limited && data?.error) {
        throw new Error(data.error);
      }

      if (data?.error && !data?.ok) {
        throw new Error(data.error);
      }

      // Accept BOTH shapes: { ok, plan } OR { ok, weakPoints, maxPotential }
      let nextPlan: GlowupPlan | null = null;

      if (data?.ok && data?.plan) {
        // Old/alternate shape
        nextPlan = data.plan as GlowupPlan;
      } else if (data?.ok) {
        // New shape - check for various properties
        const haircuts = Array.isArray(data?.haircuts) ? data.haircuts :
                        Array.isArray(data?.plan?.haircuts) ? data.plan.haircuts :
                        undefined;

        nextPlan = {
          weakPoints: (Array.isArray(data?.weakPoints) ? data.weakPoints : []) as WeakPoint[],
          maxPotential: (data.maxPotential ?? null) as MaxPotential,
          symmetryPlan: data.symmetryPlan || undefined,
          faceShapePlan: data.faceShapePlan || undefined,
          haircuts: haircuts,
        };
      }

      if (!nextPlan) throw new Error("Invalid plan response");

      // If haircuts are missing or empty, use face shape to populate them
      if ((!nextPlan.haircuts || nextPlan.haircuts.length === 0) && nextPlan.faceShapePlan?.title) {
        const faceShapeTitle = nextPlan.faceShapePlan.title.toLowerCase();

        // Extract face shape from title (e.g., "Oval Face" -> "oval")
        let detectedShape: string | null = null;
        for (const shape of Object.keys(HAIRCUTS_BY_FACE_SHAPE)) {
          if (faceShapeTitle.includes(shape)) {
            detectedShape = shape;
            break;
          }
        }

        if (detectedShape && HAIRCUTS_BY_FACE_SHAPE[detectedShape]) {
          nextPlan.haircuts = HAIRCUTS_BY_FACE_SHAPE[detectedShape];
        }
      }

      // Wait for both the API call and minimum display time
      await minDisplayTime;

      setPlan(nextPlan);

      // Set active tab: prioritize weak points, but use faceShape if only faceShapePlan exists
      if (nextPlan.weakPoints && nextPlan.weakPoints.length > 0) {
        setActiveTab(nextPlan.weakPoints[0].key);
      } else if (nextPlan.faceShapePlan) {
        setActiveTab("faceShape");
      } else {
        setActiveTab("jawline");
      }

      // Reset task checks
      setTaskChecks({});
    } catch (e: any) {
      console.error('Error generating plan:', e);
      const errMessage = e?.message?.includes('monthly limit') ? e.message : "We could not build your plan right now. Please try again.";
      setErrorMsg(errMessage);
      
      // Still wait for minimum time even on error
      const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
      await minDisplayTime;
    } finally {
      setGenerating(false);
    }
  }

  // Handle analysis selection
  const handleAnalysisSelect = async (analysisRow: AnalysisRow) => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    await generatePlan(analysisRow);
  };

  // Go back to analysis selection
  const handleBackToSelection = () => {
    setSelectedAnalysis(null);
    setPlan(null);
    setTaskChecks({});
    setErrorMsg(null);
    
    // Clear saved state when going back to selection
    if (user?.id) {
      localStorage.removeItem(`${GLOWUP_MAP_STORAGE_KEY}_${user.id}`);
    }
  };

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setTaskChecks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Clear saved state when user signs out or switches accounts
  useEffect(() => {
    const handleStorageCleanup = () => {
      if (!user?.id) {
        // Clear all glowup map states if user is not logged in
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(GLOWUP_MAP_STORAGE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      }
    };

    handleStorageCleanup();
  }, [user?.id]);

  // Calculate progress for active module
  const calculateProgress = () => {
    let dailyTasks: string[] = [];
    let weeklyTasks: string[] = [];

    if (activeTab === "symmetry" && plan?.symmetryPlan) {
      dailyTasks = plan.symmetryPlan.daily || [];
      weeklyTasks = plan.symmetryPlan.weekly || [];
    } else if (activeTab === "faceShape" && plan?.faceShapePlan) {
      dailyTasks = plan.faceShapePlan.daily || [];
      weeklyTasks = plan.faceShapePlan.weekly || [];
    } else {
      const activeWeakPoint = plan?.weakPoints?.find(wp => wp.key === activeTab);
      if (activeWeakPoint) {
        dailyTasks = activeWeakPoint.daily || [];
        weeklyTasks = activeWeakPoint.weekly || [];
      }
    }

    const totalTasks = dailyTasks.length + weeklyTasks.length;
    if (totalTasks === 0) return 0;

    let completedCount = 0;
    dailyTasks.forEach((_, index) => {
      if (taskChecks[`${activeTab}-daily-${index}`]) completedCount++;
    });
    weeklyTasks.forEach((_, index) => {
      if (taskChecks[`${activeTab}-weekly-${index}`]) completedCount++;
    });

    return Math.round((completedCount / totalTasks) * 100);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'hard': return 'bg-red-500/15 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Get next due date for weekly tasks
  const getNextDue = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + (7 - today.getDay()));
    return nextWeek.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get area display name
  const getAreaName = (area: string) => {
    switch (area) {
      case 'jawline': return tr('Jawline', 'Mandíbula');
      case 'cheekbones': return tr('Cheekbones', 'Pómulos');
      case 'skin': return tr('Skin', 'Piel');
      case 'eyeArea': return tr('Eye Area', 'Ojos');
      case 'attractiveness': return tr('Attractiveness', 'Atractivo');
      case 'symmetry': return tr('Symmetry', 'Simetría');
      case 'faceShape': return tr('Face Shape', 'Rostro');
      default: return area;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">{tr('Loading your analyses...', 'Cargando tus análisis...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header - Only show when no plan is generated */}
        {!plan && (
          <div className="mb-8 pt-4 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
              {tr('Glowup Map', 'Plan de Mejora')}
            </h1>
            <p className="text-slate-300">{tr('Pick an analysis to generate your Glowup Map', 'Elige un análisis para generar tu plan de mejora')}</p>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-red-400 text-sm">{errorMsg}</p>
              <div className="flex space-x-2">
                {selectedAnalysis && (
                  <button
                    onClick={() => generatePlan(selectedAnalysis)}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    {tr('Try again', 'Reintentar')}
                  </button>
                )}
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading View - Full Screen Overlay */}
        {generating && (
          <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {tr('Glowup Map', 'Plan de Mejora')}
              </h1>
              <p className="text-slate-400 text-lg">
                {tr('Your personalized transformation plan', 'Tu plan de transformación personalizado')}
              </p>
            </div>

            {/* Hero Circle with Glowing Ring */}
            <div className="relative mb-12 animate-scale-in">
              {/* Outer glowing ring */}
              <div className="absolute inset-0 rounded-full animate-spin-slow">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 p-1 shadow-2xl shadow-cyan-500/50">
                  <div className="w-full h-full rounded-full bg-black"></div>
                </div>
              </div>
              
              {/* Avatar */}
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/30 to-cyan-400/20 p-2 shadow-lg shadow-cyan-500/30">
                {selectedAnalysis?.image_url ? (
                  <img 
                    src={selectedAnalysis.image_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <User className="w-16 h-16 md:w-20 md:h-20 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Line */}
            <div className="text-center mb-8 animate-fade-in">
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div 
                  className="h-3 w-full rounded-full bg-slate-800/60 overflow-hidden shadow-inner"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-cyan-500/30"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Step Text */}
              <div className="min-h-[1.5rem] mb-4">
                <p className="text-slate-300 text-lg font-medium animate-fade-in">
                  {loadingSteps[currentStep]}
                </p>
              </div>
              
              {/* Timing Note */}
              <p className="text-slate-500 text-sm">
                {tr('This usually takes ~30–60 seconds.', 'Esto suele tardar ~30–60 segundos.')}
              </p>
            </div>
          </div>
        )}

        {!selectedAnalysis ? (
          /* Step 1: Analysis Selection */
          <div className="animate-fade-in">
            {/* (Removed the title + subtitle block here) */}

            {analyses.length === 0 ? (
              /* Empty State */
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tr('No Analyses Found', 'No se encontraron análisis')}</h3>
                <p className="text-slate-400 mb-6">{tr('Complete a facial analysis first to generate your glowup map', 'Completa primero un análisis facial para generar tu plan de mejora')}</p>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                >
                  {tr('Start Analysis', 'Iniciar Análisis')}
                </button>
              </div>
            ) : (
              /* Analysis Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysisRow, index) => (
                  <div
                    key={analysisRow.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className="animate-fade-in bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleAnalysisSelect(analysisRow)}
                  >
                    {/* Thumbnail */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0">
                        {analysisRow.image_url ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 p-0.5">
                            <img 
                              src={analysisRow.image_url}
                              alt="Analysis"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{tr('Facial Analysis', 'Análisis Facial')}</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(analysisRow.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">
                          {Math.round(analysisRow.analysis?.overall || 0)}
                        </div>
                        <div className="text-slate-400 text-xs">{tr('Score', 'Puntuación')}</div>
                      </div>
                    </div>

                    {/* Use Button */}
                    <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                      {tr('Use this analysis', 'Usar este análisis')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Generated Plan */
          <div className={`pt-4 animate-fade-in ${generating ? 'hidden' : ''}`}>
            {/* Avatar */}
            <div className="text-center mb-8 animate-scale-in">
              <div className="relative inline-block">
                {/* Glowing ring effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 p-1 animate-pulse shadow-2xl shadow-cyan-500/50">
                  <div className="w-full h-full rounded-full bg-black"></div>
                </div>
                
                {/* Avatar image */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400/40 via-blue-500/30 to-cyan-400/40 p-1 shadow-lg shadow-cyan-500/30">
                  {selectedAnalysis.image_url ? (
                    <img 
                      src={selectedAnalysis.image_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Potential improvement text */}
            <div className="text-center mb-8">
              <p className="text-slate-300 text-sm">
                {plan?.maxPotential?.rangeText
                  ? tr(`Potential improvement: ${plan.maxPotential.rangeText}`, `Mejora potencial: ${plan.maxPotential.rangeText}`)
                  : plan?.maxPotential?.low && plan?.maxPotential?.high
                    ? tr(`Potential improvement: ${plan.maxPotential.low}-${plan.maxPotential.high}`, `Mejora potencial: ${plan.maxPotential.low}-${plan.maxPotential.high}`)
                    : tr('Potential improvement: Available with optimization', 'Mejora potencial: Disponible con optimización')
                }
              </p>
            </div>

            {/* Tabs */}
            {plan?.weakPoints && plan.weakPoints.length > 0 && (
              <div className="flex justify-center mb-8 animate-slide-up">
                <div className="flex flex-col space-y-2">
                  {/* First row - weak point tabs (always 3) */}
                  <div className="flex justify-center flex-wrap gap-2">
                    {plan.weakPoints.map((wp) => {
                      const tabLabel = wp.label ? wp.label.toUpperCase() : getAreaName(wp.key).toUpperCase();
                      return (
                        <button
                          key={wp.key}
                          onClick={() => setActiveTab(wp.key)}
                          className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                            activeTab === wp.key
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/30'
                          }`}
                        >
                          {tabLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* Second row - symmetry + face shape */}
                  <div className="flex justify-center space-x-2">
                    {[
                      { key: 'symmetry', label: tr('SYMMETRY', 'SIMETRÍA') },
                      { key: 'faceShape', label: tr('FACE SHAPE', 'ROSTRO') }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                          activeTab === tab.key
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/30'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* Main Card */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-300 animate-slide-up">
              {plan ? (
                (() => {
                  // Determine which data to use based on active tab
                  let cardData: {
                    title: string;
                    score?: number;
                    baseline?: number;
                    explanation: string;
                    daily: string[];
                    weekly: string[];
                  } | null = null;

                  if (activeTab === "symmetry" && plan.symmetryPlan) {
                    cardData = {
                      title: plan.symmetryPlan.title || "Facial Symmetry",
                      score: plan.symmetryPlan.baseline,
                      explanation: plan.symmetryPlan.explanation,
                      daily: plan.symmetryPlan.daily || [],
                      weekly: plan.symmetryPlan.weekly || []
                    };
                  } else if (activeTab === "faceShape" && plan.faceShapePlan) {
                    cardData = {
                      title: plan.faceShapePlan.title || "Face Shape",
                      score: plan.faceShapePlan.baseline,
                      explanation: plan.faceShapePlan.explanation,
                      daily: plan.faceShapePlan.daily || [],
                      weekly: plan.faceShapePlan.weekly || []
                    };
                  } else {
                    // For all other tabs, look in weakPoints
                    const activeWeakPoint = plan.weakPoints?.find(wp => wp.key === activeTab);
                    if (activeWeakPoint) {
                      const fallbackScore = (selectedAnalysis.analysis as Record<string, unknown>)?.[activeTab] as number | undefined;

                      cardData = {
                        title: activeWeakPoint.label || getAreaName(activeTab),
                       score: activeWeakPoint.score ?? fallbackScore,
                        explanation: activeWeakPoint.explanation,
                        daily: activeWeakPoint.daily || [],
                        weekly: activeWeakPoint.weekly || []
                      };
                    }
                  }

                  if (!cardData) {
                    return (
                      <div className="text-center py-16">
                        <h3 className="text-2xl font-bold text-white mb-4">{tr('No Data Available', 'Sin datos disponibles')}</h3>
                        <p className="text-slate-400 mb-6">
                          {activeTab === "symmetry" ? tr("No symmetry data available.", "No hay datos de simetría disponibles.") : 
                           activeTab === "faceShape" ? tr("No face shape data available.", "No hay datos de forma del rostro disponibles.") : 
                           tr("No data available for this area.", "No hay datos disponibles para esta área.")}
                        </p>
                      </div>
                    );
                  }

                  const progress = calculateProgress();

                  return (
                    <div>
                      {/* Module Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white">{cardData.title}</h2>
                        <div className="flex space-x-2">
                          {cardData.score != null && (
                            <span className="px-3 py-1 rounded-full text-xs bg-slate-500/15 text-slate-300 border border-slate-500/30">
                              {tr('Score', 'Puntuación')}: {cardData.score}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Explanation Section */}
                      <p className="text-slate-300 text-lg mb-8 leading-relaxed">{cardData.explanation}</p>

                      {/* Best Haircuts - Face Shape Only */}
                      {activeTab === "faceShape" && (
                        <div className="mb-8">
                          <h3 className="text-white font-bold text-xl mb-4">{tr('3 Best Haircut Fits', '3 Mejores Cortes de Pelo')}</h3>
                          {plan?.haircuts && plan.haircuts.length > 0 ? (
                            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
                              {plan.haircuts.map((haircut, index) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-cyan-500/60 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                                >
                                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                    {index + 1}
                                  </div>
                                  <p className="text-white font-semibold text-base sm:text-lg leading-tight">{haircut}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-slate-700/30 rounded-2xl p-6 text-center border border-slate-600/30">
                              <p className="text-slate-400">{tr('Haircut recommendations will appear here', 'Aquí aparecerán las recomendaciones de cortes')}</p>
                              <p className="text-slate-500 text-sm mt-2">Debug: haircuts = {JSON.stringify(plan?.haircuts)}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold text-lg">{tr('Progress', 'Progreso')}</span>
                          <span className="text-cyan-400 font-bold text-xl">{progress}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 shadow-lg shadow-cyan-500/30"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Daily Tasks */}
                      {cardData.daily && cardData.daily.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-white font-bold text-xl mb-4">{tr('Daily Checklist', 'Lista Diaria')}</h3>
                          <div className="space-y-4">
                            {cardData.daily.map((task, index) => (
                              <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/40 transition-colors">
                                <button
                                  onClick={() => toggleTask(`${activeTab}-daily-${index}`)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                    taskChecks[`${activeTab}-daily-${index}`]
                                      ? 'bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/30'
                                      : 'border-slate-500 hover:border-cyan-400'
                                  }`}
                                >
                                  {taskChecks[`${activeTab}-daily-${index}`] && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-lg">{task}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weekly Tasks */}
                      {cardData.weekly && cardData.weekly.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-xl">{tr('Weekly Checklist', 'Lista Semanal')}</h3>
                            <span className="text-slate-400 text-sm">{tr('Next due', 'Próxima')}: {getNextDue()}</span>
                          </div>
                          <div className="space-y-4">
                            {cardData.weekly.map((task, index) => (
                              <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/40 transition-colors">
                                <button
                                  onClick={() => toggleTask(`${activeTab}-weekly-${index}`)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                    taskChecks[`${activeTab}-weekly-${index}`]
                                      ? 'bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/30'
                                      : 'border-slate-500 hover:border-cyan-400'
                                  }`}
                                >
                                  {taskChecks[`${activeTab}-weekly-${index}`] && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-lg">{task}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-4">
                        <button
                          onClick={handleBackToSelection}
                          className="px-6 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-200 border border-slate-600/30 hover:border-slate-500/30"
                        >
                          {tr('Pick another analysis', 'Elegir otro análisis')}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Error State */
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-white mb-4">{tr('Unable to Generate Plan', 'No se pudo generar el plan')}</h3>
                  <p className="text-slate-400 mb-6">
                    {errorMsg || tr('Something went wrong while generating your glowup plan.', 'Algo salió mal al generar tu plan de mejora.')}
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={handleBackToSelection}
                      className="px-6 py-3 bg-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-200 border border-slate-600/30"
                    >
                      Pick another analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
