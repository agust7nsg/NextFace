import React, { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Crown, Calendar, X, Eye, Star, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import AnalysisResults from '../components/AnalysisResults';
import PremiumModal from '../components/PremiumModal';
import StorageLimitModal from '../components/StorageLimitModal';
import GradientButton from '../components/GradientButton';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useLanguage } from '../contexts/LanguageContext';
import { tr } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { saveAnalysis, getAnalysisCount } from '../lib/history';
import { uploadImage } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';

interface AnalysisPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export default function AnalysisPage({ onBack, onNavigate }: AnalysisPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showStorageLimitModal, setShowStorageLimitModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { isPremium, user } = useAuth();
  const { isAnalyzing, error: analysisError, analysis, analyzeImage } = useImageProcessing();
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { t } = useLanguage();

  useEffect(() => { console.log("MOUNT:", "src/pages/AnalysisPage.tsx"); }, []);

  const handleImageSelect = async (file: File) => {
    if (user) {
      const count = await getAnalysisCount(user.id);
      if (!isPremium) {
        if (count >= 1) {
          setShowPremiumModal(true);
          return;
        }
      } else {
        if (count >= 10) {
          setPendingFile(file);
          setShowStorageLimitModal(true);
          return;
        }
      }
    }

    await performAnalysis(file);
  };

  const performAnalysis = async (file: File) => {
    setLastFile(file);
    const blobUrl = URL.createObjectURL(file);
    setShowUpload(false);
    setTimeout(() => setSelectedImage(blobUrl), 350);

    try {
      let storagePath: string | null = null;

      if (user) {
        try {
          const uploaded = await uploadImage(file, user.id);
          if (uploaded) {
            storagePath = uploaded.path;
          }
        } catch (error) {
          console.error('Error uploading image to storage:', error);
        }
      }

      const result = await analyzeImage(file);

      if (result && user) {
        supabase
          .from('facial_profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Failed to update last_active_at:', error);
          });

        try {
          const saveResult = await saveAnalysis({
            userId: user.id,
            imagePath: storagePath,
            analysis: result
          });
          if (saveResult.ok) {
            console.log('Analysis saved to history successfully');
            try {
              await supabase.from('user_events').insert({
                user_id: user.id,
                event_type: 'analysis_completed',
                metadata: {
                  analysis_id: saveResult.analysisId,
                  score: result.overall ?? result.overallScore
                }
              });
            } catch (e) {
              console.error('Failed to log analysis_completed event:', e);
            }
          } else {
            console.error('Failed to save analysis:', saveResult.error);
          }
        } catch (error) {
          console.error('Failed to save analysis to history:', error);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleContinueWithoutSaving = () => {
    if (pendingFile) {
      performAnalysis(pendingFile);
      setPendingFile(null);
    }
  };

  const handlePremiumFeatureClick = () => setShowPremiumModal(true);

  const handleClearImage = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setShowUpload(true);
  };

  const getOverallGrade = (score: number) => {
    if (score >= 9) return { grade: 'A+', color: 'text-emerald-400' };
    if (score >= 8) return { grade: 'A', color: 'text-emerald-400' };
    if (score >= 7) return { grade: 'B+', color: 'text-yellow-400' };
    if (score >= 6) return { grade: 'B', color: 'text-yellow-400' };
    if (score >= 5) return { grade: 'C+', color: 'text-orange-400' };
    return { grade: 'C', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 pt-4 animate-fade-in">
          <button
            onClick={onBack}
            className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-700/60 transition-all duration-300 mr-4 group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors duration-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{t.facialAnalysis}</h1>
            <p className="text-slate-400">{t.aiPoweredAssessment}</p>
          </div>
        </div>

        {/* Upload Section */}
        {!selectedImage && (
          <div className={`bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 mb-8 shadow-lg shadow-blue-500/10 transition-opacity duration-300 ease-in-out ${showUpload ? 'opacity-100 animate-slide-up' : 'opacity-0'}`}>
            <ImageUpload onImageSelect={handleImageSelect} selectedImage={selectedImage} onClear={handleClearImage} />
          </div>
        )}

        {/* Analysis Results */}
        {selectedImage && (
          <div className="space-y-8 animate-fade-in">
            {isAnalyzing ? (
              <LoadingSpinner 
                message={tr('Analyzing facial features and calculating scores…', 'Analizando rasgos faciales y calculando puntuaciones…')}
                imageSrc={selectedImage}
              />
            ) : analysisError ? (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-red-500/30 text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tr('Analysis Failed', 'Análisis Fallido')}</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">{analysisError}</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleClearImage}
                    className="px-6 py-3 bg-slate-700/60 text-white font-medium rounded-2xl border border-slate-600/50 hover:bg-slate-600/60 transition-all duration-300"
                  >
                    {tr('Try Different Photo', 'Probar otra foto')}
                  </button>
                  {lastFile && (
                    <button
                      onClick={() => lastFile && performAnalysis(lastFile)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {tr('Retry', 'Reintentar')}
                    </button>
                  )}
                </div>
              </div>
            ) : analysis && (
              <AnalysisResults
                analysis={analysis}
                imageUrl={selectedImage}
                isPremium={isPremium}
                onClearImage={handleClearImage}
                onPremiumClick={handlePremiumFeatureClick}
              />
            )}


          </div>
        )}
      </div>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <StorageLimitModal
        isOpen={showStorageLimitModal}
        onClose={() => {
          setShowStorageLimitModal(false);
          setPendingFile(null);
        }}
        onContinue={handleContinueWithoutSaving}
      />
    </div>
  );
}