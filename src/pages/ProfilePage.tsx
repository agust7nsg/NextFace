import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, User, Camera, Trophy, ChevronRight, Languages, AlertTriangle, Bell, Shield, FileText, MessageCircle, Trash2, RotateCcw, Loader2, CreditCard } from 'lucide-react';
import { getHistory } from '../lib/history';
import LanguageModal from '../components/LanguageModal';
import EditProfileModal from '../components/EditProfileModal';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import TermsOfServiceModal from '../components/TermsOfServiceModal';
import ContactModal from '../components/ContactModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';
import GradientButton from '../components/GradientButton';
import { supabase } from '../lib/supabaseClient';
import { getSignedUrl, uploadImage, deleteStorageFile } from '../lib/storage';
import { restorePurchases, hasPremiumEntitlement, getCustomerInfo } from '../lib/revenuecat';
import { Capacitor } from '@capacitor/core';

interface ProfilePageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export default function ProfilePage({ onBack, onNavigate }: ProfilePageProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showTermsOfServiceModal, setShowTermsOfServiceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [managingSub, setManagingSub] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, setPremium, isPremium } = useAuth();

  // Fetch user avatar path from database and generate public URL
  const loadAvatar = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('facial_profiles')
        .select('avatar_path')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading avatar:', error);
        return;
      }

      if (data?.avatar_path) {
        setAvatarPath(data.avatar_path);
        const signedUrl = await getSignedUrl(data.avatar_path);
        if (signedUrl) {
          setAvatarUrl(signedUrl);
        } else {
          setAvatarUrl(null);
        }
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);

      const prevAvatarPath = avatarPath;

      const uploaded = await uploadImage(file, user.id);

      if (!uploaded) {
        alert('Failed to upload image. Please try again.');
        return;
      }

      const { error: dbError } = await supabase
        .from('facial_profiles')
        .upsert({
          user_id: user.id,
          avatar_path: uploaded.path
        }, {
          onConflict: 'user_id'
        });

      if (dbError) {
        console.error('Database update error:', dbError);
        alert('Failed to save avatar. Please try again.');
        return;
      }

      if (prevAvatarPath && prevAvatarPath !== uploaded.path) {
        await deleteStorageFile(prevAvatarPath);
      }

      setAvatarPath(uploaded.path);
      setAvatarUrl(uploaded.signedUrl);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Load user statistics and avatar
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load avatar
        await loadAvatar();

        // Load analysis history to get count and best score
        const { ok, data } = await getHistory({ userId: user.id, limit: 100 });
        if (ok && data) {
          setAnalysisCount(data.length);

          // Find the best overall score
          if (data.length > 0) {
            const scores = data.map(analysis => analysis.analysis?.overall || 0);
            const maxScore = Math.max(...scores);
            if (maxScore > 0) {
              setBestScore(maxScore);
            } else {
              setBestScore(null);
            }
          } else {
            setBestScore(null);
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

  const getLanguageDisplay = () => {
    return language === 'en' ? t.english : t.spanish;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-4 pb-20">
      <div className="max-w-md mx-auto">
        {!user ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">{tr('Please sign in to view your profile', 'Por favor inicia sesión para ver tu perfil')}</p>
            <GradientButton onClick={onBack}>
              {tr('Go Back', 'Volver')}
            </GradientButton>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <button
            onClick={onBack}
            className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">{t.profile}</h1>
          <button
            onClick={() => setShowContactModal(true)}
            className="p-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors duration-200"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 mb-6 animate-fade-in">
          <div className="flex items-center mb-6">
            <div className="relative mr-4">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors duration-200 border-2 border-slate-800 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
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
          <div className="space-y-2">
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-700/60 px-3 py-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                <Camera className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex min-w-0 items-baseline gap-2">
                <div className="text-sm font-bold leading-tight text-white sm:text-base">{t.analysis}:</div>
                <div className="shrink-0 text-xl font-bold leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent sm:text-2xl">
                  {loading ? '...' : analysisCount}
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-700/60 px-3 py-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex min-w-0 items-baseline gap-2">
                <div className="text-sm font-bold leading-tight text-white sm:text-base">{t.bestScore}:</div>
                <div className="shrink-0 text-xl font-bold leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent sm:text-2xl">
                  {loading ? '...' : bestScore !== null ? Math.round(bestScore) : '-'}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-4">{t.account}</h3>
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden animate-slide-up">
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t.editProfile}</div>
                  <div className="text-slate-400 text-sm">{t.updatePersonalInfo}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-t border-slate-700/50"></div>

            {Capacitor.isNativePlatform() && (
              <button
                onClick={async () => {
                  setRestoring(true);
                  setRestoreMessage(null);
                  try {
                    const customerInfo = await restorePurchases();
                    if (hasPremiumEntitlement(customerInfo)) {
                      setPremium(true);
                      setRestoreMessage(tr('Premium restored successfully!', 'Premium restaurado con éxito!'));
                    } else {
                      setRestoreMessage(tr('No active subscriptions found.', 'No se encontraron suscripciones activas.'));
                    }
                  } catch (err) {
                    setRestoreMessage(tr('Could not restore purchases. Please try again.', 'No se pudieron restaurar las compras. Inténtalo de nuevo.'));
                  } finally {
                    setRestoring(false);
                  }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    {restoring ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> : <RotateCcw className="w-5 h-5 text-cyan-400" />}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{tr('Restore Purchases', 'Restaurar Compras')}</div>
                    <div className="text-slate-400 text-sm">{tr('Recover premium after reinstall', 'Recupera premium tras reinstalar')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}

            {restoreMessage && (
              <div className="px-4 py-2 text-sm text-center text-slate-400">
                {restoreMessage}
              </div>
            )}

            <div className="border-t border-slate-700/50"></div>

            {Capacitor.isNativePlatform() && isPremium && (
              <button
                onClick={async () => {
                  setManagingSub(true);
                  try {
                    const customerInfo = await getCustomerInfo();
                    const url = customerInfo.managementURL;
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } else {
                      const productId = customerInfo.activeSubscriptions[0] || '';
                      const playUrl = `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(productId)}&package=com.nextface.app`;
                      window.open(playUrl, '_blank', 'noopener,noreferrer');
                    }
                  } catch (err) {
                    console.error('Failed to open subscription management:', err);
                  } finally {
                    setManagingSub(false);
                  }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                    {managingSub ? <Loader2 className="w-5 h-5 text-violet-400 animate-spin" /> : <CreditCard className="w-5 h-5 text-violet-400" />}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{tr('Manage Subscription', 'Gestionar Suscripción')}</div>
                    <div className="text-slate-400 text-sm">{tr('Cancel or change your plan in Google Play', 'Cancela o cambia tu plan en Google Play')}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            )}

            <div className="border-t border-slate-700/50"></div>

            <button 
              onClick={() => setShowLanguageModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Languages className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t.language}</div>
                  <div className="text-slate-400 text-sm">{t.currentLanguage.replace('English', getLanguageDisplay()).replace('Español', getLanguageDisplay())}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-t border-slate-700/50"></div>

            <button 
              onClick={async () => {
                await signOut();
                onBack();
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{tr('Sign Out', 'Cerrar Sesión')}</div>
                  <div className="text-slate-400 text-sm">{tr('Sign out of your account', 'Cierra sesión de tu cuenta')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-t border-slate-700/50"></div>

            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-left">
                  <div className="text-red-400 font-medium">{tr('Delete Account', 'Eliminar Cuenta')}</div>
                  <div className="text-slate-400 text-sm">{tr('Permanently delete your account and data', 'Elimina permanentemente tu cuenta y datos')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Legal Section */}
        <div className="mb-8">
          <h3 className="text-white font-semibold text-lg mb-4">{t.legal}</h3>
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden animate-slide-up">
            <button 
              onClick={() => setShowTermsOfServiceModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t.termsOfService}</div>
                  <div className="text-slate-400 text-sm">{tr('View our terms and conditions', 'Ver nuestros términos y condiciones')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-t border-slate-700/50"></div>

            <button 
              onClick={() => setShowPrivacyPolicyModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t.privacyPolicy}</div>
                  <div className="text-slate-400 text-sm">{tr('How we protect your data', 'Cómo protegemos tus datos')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="border-t border-slate-700/50"></div>

            <button 
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{t.contactSupport}</div>
                  <div className="text-slate-400 text-sm">{tr('Get help and support', 'Obtén ayuda y soporte')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
      />

      <TermsOfServiceModal
        isOpen={showTermsOfServiceModal}
        onClose={() => setShowTermsOfServiceModal(false)}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onDeleted={() => {
          setShowDeleteAccountModal(false);
          onBack();
        }}
      />


    </div>
  );
}