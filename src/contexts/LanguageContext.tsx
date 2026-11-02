import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface Translations {
  // Navigation
  analysis: string;
  results: string;
  profile: string;
  haircuts: string;
  
  // Home Page
  startAIAnalysis: string;
  discoverBeautyScore: string;
  startNow: string;
  rating: string;
  precision: string;
  whyChooseAI: string;
  advancedAIAnalysis: string;
  getDetailedInsights: string;
  hairstyleAI: string;
  tryDifferentLooks: string;
  previousResults: string;
  viewAnalysisHistory: string;
  noPreviousResults: string;
  completeAnalysisToSee: string;
  startFirstAnalysis: string;
  yourProfile: string;
  manageAccountSettings: string;
  viewFullProfile: string;
  
  // Analysis Page
  facialAnalysis: string;
  aiPoweredAssessment: string;
  analyzingFacialFeatures: string;
  overallScore: string;
  topPercentAnalyzed: string;
  saveReport: string;
  share: string;
  analysisBreakdown: string;
  yourOverallScore: string;
  placesYouInTop: string;
  calculatedUsingAdvanced: string;
  facialHarmonyScore: string;
  excellent: string;
  goldenRatioCompliance: string;
  match: string;
  featureBalance: string;
  veryGood: string;
  facialFeatureAnalysis: string;
  detailedFeatureAnalysis: string;
  celebritySimilarity: string;
  estimatedAge: string;
  range: string;
  influencingFactors: string;
  skinQualityExcellent: string;
  facialStructureMature: string;
  eyeAreaNoWrinkles: string;
  personalizedRecommendations: string;
  
  // Feature Categories
  facialSymmetry: string;
  jawlineDefinition: string;
  eyeArea: string;
  skinQuality: string;
  cheekbones: string;
  
  // Profile Page
  editProfile: string;
  updatePersonalInfo: string;
  language: string;
  currentLanguage: string;
  cancelPremium: string;
  cancelPremiumSub: string;
  notifications: string;
  manageAlertsReminders: string;
  legal: string;
  termsOfService: string;
  privacyPolicy: string;
  contactSupport: string;
  account: string;
  bestScore: string;
  days: string;
  premiumUser: string;
  
  // Image Upload
  uploadYourPhoto: string;
  dragDropPhoto: string;
  chooseFile: string;
  
  // Premium Modal
  unlockPremium: string;
  getMostComplete: string;
  premium: string;
  autoRenewal: string;
  whatYouGet: string;
  detailedFeatureAnalysisTitle: string;
  detailedFeatureAnalysisDesc: string;
  visualFacialMap: string;
  visualFacialMapDesc: string;
  personalizedRecommendationsTitle: string;
  personalizedRecommendationsDesc: string;
  expertAdvice: string;
  expertAdviceDesc: string;
  instantAnalysisNoAds: string;
  priorityAccessNewFeatures: string;
  exclusiveExpertRecommendations: string;
  upgradeToPremium: string;
  maybeLater: string;
  
  // Language Modal
  selectLanguage: string;
  choosePreferredLanguage: string;
  english: string;
  spanish: string;
  cancel: string;
  
  // Loading
  aiProcessing: string;
  processing: string;
  
  // Common
  ready: string;
  generated: string;
  preview: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    analysis: 'Analysis',
    results: 'Results',
    profile: 'Profile',
    haircuts: 'Chat',
    
    // Home Page
    startAIAnalysis: 'Start AI Analysis',
    discoverBeautyScore: 'Discover your beauty score in seconds',
    startNow: 'Start Now',
    rating: 'Rating',
    precision: 'Precision',
    whyChooseAI: 'Why choose our AI?',
    advancedAIAnalysis: 'Advanced AI Analysis',
    getDetailedInsights: 'Get detailed insights about your facial features and personalized recommendations',
    hairstyleAI: 'Hairstyle AI',
    tryDifferentLooks: 'Try different looks instantly',
    previousResults: 'Previous Results',
    viewAnalysisHistory: 'View your analysis history',
    noPreviousResults: 'No Previous Results',
    completeAnalysisToSee: 'Complete a facial analysis to see your results here',
    startFirstAnalysis: 'Start First Analysis',
    yourProfile: 'Your Profile',
    manageAccountSettings: 'Manage your account and settings',
    viewFullProfile: 'View Full Profile',
    
    // Analysis Page
    facialAnalysis: 'Facial Analysis',
    aiPoweredAssessment: 'AI-powered attractiveness assessment',
    analyzingFacialFeatures: 'Analyzing facial features and calculating scores...',
    overallScore: 'Overall Score',
    topPercentAnalyzed: 'Top 15% of analyzed faces',
    saveReport: 'Save Report',
    share: 'Share',
    analysisBreakdown: 'Analysis Breakdown',
    yourOverallScore: 'Your overall score of',
    placesYouInTop: 'places you in the',
    calculatedUsingAdvanced: 'of analyzed faces. This rating is calculated using advanced AI algorithms that analyze facial harmony, proportion ratios, and aesthetic principles based on thousands of reference points.',
    facialHarmonyScore: 'Facial Harmony Score:',
    excellent: 'Excellent',
    goldenRatioCompliance: 'Golden Ratio Compliance:',
    match: 'Match',
    featureBalance: 'Feature Balance:',
    veryGood: 'Very Good',
    facialFeatureAnalysis: 'Facial Feature Analysis',
    detailedFeatureAnalysis: 'Detailed Feature Analysis',
    celebritySimilarity: 'Celebrity Similarity',
    estimatedAge: 'Estimated Age AI Premium',
    range: 'Range:',
    influencingFactors: 'Influencing Factors',
    skinQualityExcellent: 'Skin quality: Excellent',
    facialStructureMature: 'Facial structure: Mature',
    eyeAreaNoWrinkles: 'Eye area: No wrinkles',
    personalizedRecommendations: 'Personalized Recommendations AI',
    
    // Feature Categories
    facialSymmetry: 'Facial Symmetry',
    jawlineDefinition: 'Jawline Definition',
    eyeArea: 'Eye Area',
    skinQuality: 'Skin Quality',
    cheekbones: 'Cheekbones',
    
    // Profile Page
    editProfile: 'Edit Profile',
    updatePersonalInfo: 'Update your personal information',
    language: 'Language',
    currentLanguage: 'Current: English',
    cancelPremium: 'Cancel Premium',
    cancelPremiumSub: 'Cancel premium subscription',
    notifications: 'Notifications',
    manageAlertsReminders: 'Manage your alerts and reminders',
    legal: 'Legal',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    contactSupport: 'Contact Support',
    account: 'Account',
    bestScore: 'Best Score',
    days: 'Days',
    premiumUser: 'Premium User',
    
    // Image Upload
    uploadYourPhoto: 'Upload Your Photo',
    dragDropPhoto: 'Drag and drop your photo here, or click to select. For best results, use a clear front-facing photo.',
    chooseFile: 'Choose File',
    
    // Premium Modal
    unlockPremium: 'Unlock Premium',
    getMostComplete: 'Get the most complete and detailed facial analysis',
    premium: 'Premium',
    autoRenewal: 'Auto-renewal',
    whatYouGet: 'What you get:',
    detailedFeatureAnalysisTitle: 'Detailed Feature Analysis',
    detailedFeatureAnalysisDesc: 'Individual scores for eyes, eyebrows, jaw, cheekbones and more',
    visualFacialMap: 'Visual Facial Map',
    visualFacialMapDesc: 'Visualize your strong, weak and improvement areas',
    personalizedRecommendationsTitle: 'Personalized Recommendations',
    personalizedRecommendationsDesc: 'Haircuts, beard, glasses and specific styles for you',
    expertAdvice: 'Hairstyle Visualizer',
    expertAdviceDesc: 'See your face with different hairstyles',
    instantAnalysisNoAds: 'Instant analysis without ads',
    priorityAccessNewFeatures: 'Priority access to new features',
    exclusiveExpertRecommendations: 'Exclusive expert recommendations',
    upgradeToPremium: 'Upgrade to Premium',
    maybeLater: 'Maybe Later',
    
    // Language Modal
    selectLanguage: 'Select Language',
    choosePreferredLanguage: 'Choose your preferred language',
    english: 'English',
    spanish: 'Español',
    cancel: 'Cancel',
    
    // Loading
    aiProcessing: 'AI Processing',
    processing: 'Processing...',
    
    // Common
    ready: 'Ready',
    generated: 'Generated',
    preview: 'Preview',
  },
  es: {
    // Navigation
    analysis: 'Análisis',
    results: 'Resultados',
    profile: 'Perfil',
    haircuts: 'Chat',
    
    // Home Page
    startAIAnalysis: 'Iniciar Análisis IA',
    discoverBeautyScore: 'Descubre tu puntuación de belleza en segundos',
    startNow: 'Empezar Ahora',
    rating: 'Calificación',
    precision: 'Precisión',
    whyChooseAI: '¿Por qué elegir nuestra IA?',
    advancedAIAnalysis: 'Análisis IA Avanzado',
    getDetailedInsights: 'Obtén información detallada sobre tus características faciales y recomendaciones personalizadas',
    hairstyleAI: 'IA de Peinados',
    tryDifferentLooks: 'Prueba diferentes looks al instante',
    previousResults: 'Resultados Anteriores',
    viewAnalysisHistory: 'Ver tu historial de análisis',
    noPreviousResults: 'Sin Resultados Anteriores',
    completeAnalysisToSee: 'Completa un análisis facial para ver tus resultados aquí',
    startFirstAnalysis: 'Iniciar Primer Análisis',
    yourProfile: 'Tu Perfil',
    manageAccountSettings: 'Gestiona tu cuenta y configuración',
    viewFullProfile: 'Ver Perfil Completo',
    
    // Analysis Page
    facialAnalysis: 'Análisis Facial',
    aiPoweredAssessment: 'Evaluación de atractivo impulsada por IA',
    analyzingFacialFeatures: 'Analizando características faciales y calculando puntuaciones...',
    overallScore: 'Puntuación General',
    topPercentAnalyzed: 'Top 15% de rostros analizados',
    saveReport: 'Guardar Reporte',
    share: 'Compartir',
    analysisBreakdown: 'Desglose del Análisis',
    yourOverallScore: 'Tu puntuación general de',
    placesYouInTop: 'te coloca en el',
    calculatedUsingAdvanced: 'de rostros analizados. Esta calificación se calcula usando algoritmos IA avanzados que analizan la armonía facial, proporciones y principios estéticos basados en miles de puntos de referencia.',
    facialHarmonyScore: 'Puntuación de Armonía Facial:',
    excellent: 'Excelente',
    goldenRatioCompliance: 'Cumplimiento Proporción Áurea:',
    match: 'Coincidencia',
    featureBalance: 'Balance de Características:',
    veryGood: 'Muy Bueno',
    facialFeatureAnalysis: 'Análisis de Características Faciales',
    detailedFeatureAnalysis: 'Análisis Detallado de Características',
    celebritySimilarity: 'Similitud con Celebridades',
    estimatedAge: 'Edad Estimada IA Premium',
    range: 'Rango:',
    influencingFactors: 'Factores Influyentes',
    skinQualityExcellent: 'Calidad de piel: Excelente',
    facialStructureMature: 'Estructura facial: Madura',
    eyeAreaNoWrinkles: 'Área de ojos: Sin arrugas',
    personalizedRecommendations: 'Recomendaciones Personalizadas IA',
    
    // Feature Categories
    facialSymmetry: 'Simetría Facial',
    jawlineDefinition: 'Definición de Mandíbula',
    eyeArea: 'Área de Ojos',
    skinQuality: 'Calidad de Piel',
    cheekbones: 'Pómulos',
    
    // Profile Page
    editProfile: 'Editar Perfil',
    updatePersonalInfo: 'Actualiza tu información personal',
    language: 'Idioma',
    currentLanguage: 'Actual: Español',
    cancelPremium: 'Cancelar Premium',
    cancelPremiumSub: 'Cancelar suscripción premium',
    notifications: 'Notificaciones',
    manageAlertsReminders: 'Gestiona tus alertas y recordatorios',
    privacy: 'Privacidad',
    privateMode: 'Modo Privado',
    keepAnalysisPrivate: 'Mantén los análisis completamente privados',
    legal: 'Legal',
    termsOfService: 'Términos de Servicio',
    privacyPolicy: 'Política de Privacidad',
    contactSupport: 'Contactar Soporte',
    account: 'Cuenta',
    bestScore: 'Mejor Puntuación',
    days: 'Días',
    premiumUser: 'Usuario Premium',
    
    // Image Upload
    uploadYourPhoto: 'Sube Tu Foto',
    dragDropPhoto: 'Arrastra y suelta tu foto aquí, o haz clic para seleccionar. Para mejores resultados, usa una foto clara de frente.',
    chooseFile: 'Elegir Archivo',
    
    // Premium Modal
    unlockPremium: 'Desbloquear Premium',
    getMostComplete: 'Obtén el análisis facial más completo y detallado',
    premium: 'Premium',
    autoRenewal: 'Renovación automática',
    whatYouGet: 'Lo que obtienes:',
    detailedFeatureAnalysisTitle: 'Análisis Detallado de Características',
    detailedFeatureAnalysisDesc: 'Puntuaciones individuales para ojos, cejas, mandíbula, pómulos y más',
    visualFacialMap: 'Mapa Facial Visual',
    visualFacialMapDesc: 'Visualiza tus áreas fuertes, débiles y de mejora',
    personalizedRecommendationsTitle: 'Recomendaciones Personalizadas',
    personalizedRecommendationsDesc: 'Cortes de cabello, barba, gafas y estilos específicos para ti',
    expertAdvice: 'Visualizador de Peinados',
    expertAdviceDesc: 'Ve tu rostro con diferentes peinados',
    instantAnalysisNoAds: 'Análisis instantáneo sin anuncios',
    priorityAccessNewFeatures: 'Acceso prioritario a nuevas características',
    exclusiveExpertRecommendations: 'Recomendaciones expertas exclusivas',
    upgradeToPremium: 'Actualizar a Premium',
    maybeLater: 'Tal Vez Después',
    
    // Language Modal
    selectLanguage: 'Seleccionar Idioma',
    choosePreferredLanguage: 'Elige tu idioma preferido',
    english: 'English',
    spanish: 'Español',
    cancel: 'Cancelar',
    
    // Loading
    aiProcessing: 'Procesando IA',
    processing: 'Procesando...',
    
    // Common
    ready: 'Listo',
    generated: 'Generado',
    preview: 'Vista Previa',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LANG_STORAGE_KEY = 'user_language';

const LATAM_SPAIN_TIMEZONES = new Set([
  // Spain
  'Europe/Madrid', 'Atlantic/Canary', 'Africa/Ceuta', 'Europe/Madrid',
  // Mexico
  'America/Mexico_City', 'America/Cancun', 'America/Monterrey', 'America/Merida',
  'America/Mazatlan', 'America/Chihuahua', 'America/Ojinaga', 'America/Hermosillo',
  'America/Tijuana', 'America/Bahia_Banderas',
  // Central America
  'America/Guatemala', 'America/Tegucigalpa', 'America/Managua', 'America/Costa_Rica',
  'America/Panama', 'America/Belize',
  // Caribbean Spanish-speaking
  'America/Santo_Domingo', 'America/Havana', 'America/Puerto_Rico',
  // South America Spanish
  'America/Bogota', 'America/Lima', 'America/Caracas', 'America/La_Paz',
  'America/Asuncion', 'America/Montevideo', 'America/Guayaquil', 'Pacific/Galapagos',
  // South America Portuguese
  'America/Sao_Paulo', 'America/Recife', 'America/Belem', 'America/Fortaleza',
  'America/Maceio', 'America/Manaus', 'America/Cuiaba', 'America/Porto_Velho',
  'America/Rio_Branco', 'America/Santarem', 'America/Noronha', 'America/Eirunepe',
  // South America Spanish (Argentina)
  'America/Argentina/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Salta',
  'America/Argentina/Jujuy', 'America/Argentina/Tucuman', 'America/Argentina/Catamarca',
  'America/Argentina/La_Rioja', 'America/Argentina/San_Juan', 'America/Argentina/Mendoza',
  'America/Argentina/San_Luis', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Ushuaia',
  'America/Buenos_Aires', 'America/Cordoba', 'America/Rosario', 'America/Catamarca',
  'America/Jujuy', 'America/Mendoza',
  // Chile
  'America/Santiago', 'America/Punta_Arenas',
]);

function detectLanguageFromTimezone(): Language {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && LATAM_SPAIN_TIMEZONES.has(tz)) return 'es';
  } catch { /* ignore */ }
  return 'en';
}

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
  } catch { /* ignore */ }
  // First launch: detect from timezone
  const detected = detectLanguageFromTimezone();
  try {
    localStorage.setItem(LANG_STORAGE_KEY, detected);
  } catch { /* ignore */ }
  return detected;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* ignore */ }
    setLanguageState(lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const enToEs: Record<string, string> = {};

let currentLang: Language = 'en';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  currentLang = context.language;
  return context;
};

export function tr(en: string, es: string): string {
  return currentLang === 'es' ? es : en;
}