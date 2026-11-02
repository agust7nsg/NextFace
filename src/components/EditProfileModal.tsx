import React, { useState } from 'react';
import { X, User, Mail, Globe, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tr } from '../contexts/LanguageContext';
import { getHistory } from '../lib/history';
import { supabase } from '../lib/supabaseClient';
import GradientButton from './GradientButton';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, isPremium } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.email?.split('@')[0] || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  // Function to calculate percentile based on best score
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
    return 1; // fallback
  };

  // Load user statistics when modal opens
  React.useEffect(() => {
    const loadUserStats = async () => {
      if (!user || !isOpen) return;
      
      setLoadingStats(true);
      try {
        const { ok, data } = await getHistory({ userId: user.id, limit: 100 });
        if (ok && data) {
          setAnalysisCount(data.length);
          
          // Find the best overall score and calculate percentile
          if (data.length > 0) {
            const scores = data.map(analysis => analysis.analysis?.overall || 0);
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
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Update user metadata with new display name
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: name }
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could add error state handling here
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl p-6 max-w-md w-full border border-slate-700/50 relative animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tr('Edit Profile', 'Editar Perfil')}</h2>
              <p className="text-slate-400 text-sm">{tr('Update your personal information', 'Actualiza tu información personal')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 animate-fade-in">
            <p className="text-emerald-400 text-sm text-center font-medium">{tr('Profile updated successfully!', '¡Perfil actualizado con éxito!')}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">{tr('Display Name', 'Nombre para mostrar')}</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                placeholder={tr('Enter your display name', 'Ingresa tu nombre para mostrar')}
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">{tr('Email Address', 'Correo Electrónico')}</label>
            <div className="relative">
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700/30 rounded-2xl text-slate-400 cursor-not-allowed"
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <p className="text-slate-500 text-xs mt-1">{tr('Email cannot be changed', 'El correo no se puede cambiar')}</p>
          </div>

          {/* Account Info */}
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-cyan-400" />
              {tr('Account Information', 'Información de Cuenta')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{tr('Member since:', 'Miembro desde:')}</span>
                <span className="text-white">{formatJoinDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{tr('Account type:', 'Tipo de cuenta:')}</span>
                <span className={`font-medium ${isPremium ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {isPremium ? tr('Premium', 'Premium') : tr('Free', 'Gratis')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{tr('Analyses completed:', 'Análisis completados:')}</span>
                <span className="text-white">
                  {loadingStats ? '...' : analysisCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800/60 text-slate-300 font-medium rounded-2xl hover:bg-slate-700/60 hover:text-white transition-all duration-200"
          >
            {tr('Cancel', 'Cancelar')}
          </button>
          <GradientButton
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{tr('Saving...', 'Guardando...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{tr('Save Changes', 'Guardar Cambios')}</span>
              </>
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}