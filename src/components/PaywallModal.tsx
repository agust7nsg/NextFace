import React, { useState, useEffect, useCallback } from 'react';
import { X, Crown, Check, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasPremiumEntitlement,
  isUserCancelledError,
  getPurchaseErrorMessage,
} from '../lib/revenuecat';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoadState = 'loading' | 'ready' | 'error' | 'no-offerings';

interface PackageDisplay {
  pkg: PurchasesPackage;
  label: string;
  priceString: string;
  periodLabel: string;
  subLabel: string;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { setPremium } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [packages, setPackages] = useState<PackageDisplay[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const fetchOfferings = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      const offerings = await getOfferings();
      if (!offerings || !offerings.current || !offerings.current.availablePackages.length) {
        setLoadState('no-offerings');
        return;
      }

      const current = offerings.current;
      const display: PackageDisplay[] = [];

      if (current.weekly) {
        display.push({
          pkg: current.weekly,
          label: tr('Weekly', 'Semanal'),
          priceString: current.weekly.product.priceString,
          periodLabel: tr('/week', '/sem'),
          subLabel: tr('Billed weekly', 'Facturado semanalmente'),
        });
      }
      if (current.monthly) {
        display.push({
          pkg: current.monthly,
          label: tr('Monthly', 'Mensual'),
          priceString: current.monthly.product.priceString,
          periodLabel: tr('/month', '/mes'),
          subLabel: tr('Billed monthly', 'Facturado mensualmente'),
        });
      }
      if (current.annual) {
        display.push({
          pkg: current.annual,
          label: tr('Yearly', 'Anual'),
          priceString: current.annual.product.priceString,
          periodLabel: tr('/week', '/sem'),
          subLabel: tr('Billed yearly', 'Facturado anualmente'),
        });
      }

      if (display.length === 0) {
        setLoadState('no-offerings');
        return;
      }

      setPackages(display);
      setSelectedPackage(display[0].pkg);
      setLoadState('ready');
    } catch (err) {
      console.error('Failed to fetch offerings:', err);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      fetchOfferings();
    } else if (isOpen) {
      setLoadState('no-offerings');
    }
  }, [isOpen, fetchOfferings]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    setError(null);
    try {
      const customerInfo = await purchasePackage(selectedPackage);
      if (hasPremiumEntitlement(customerInfo)) {
        setPremium(true);
        setShowSuccess(true);
        setShowSubscriptionModal(false);
      } else {
        setError(tr(
          'Purchase completed but premium was not activated. Please try restoring purchases.',
          'Compra completada pero premium no fue activado. Intenta restaurar compras.'
        ));
      }
    } catch (err) {
      if (isUserCancelledError(err)) {
        // Silent — user just cancelled, no error shown
      } else {
        console.error('Purchase failed:', err);
        setError(getPurchaseErrorMessage(err));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    setError(null);
    try {
      const customerInfo = await restorePurchases();
      if (hasPremiumEntitlement(customerInfo)) {
        setPremium(true);
        setShowSuccess(true);
        setShowSubscriptionModal(false);
      } else {
        setError(tr(
          'No active subscriptions were found to restore.',
          'No se encontraron suscripciones activas para restaurar.'
        ));
      }
    } catch (err) {
      console.error('Restore failed:', err);
      setError(getPurchaseErrorMessage(err));
    } finally {
      setRestoreLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black z-[99999] flex flex-col w-screen h-screen overflow-y-auto overflow-x-hidden items-center justify-center px-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-full mb-3">
            <Crown className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-cyan-200 text-xs font-semibold tracking-wide uppercase">
              {tr('Premium Unlocked', 'Premium Desbloqueado')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            {tr("You're all set.", 'Ya está todo listo.')}
          </h1>
          <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
            {tr('Welcome to NextFace AI Premium. Every feature is now yours.', 'Bienvenido a NextFace AI Premium. Todas las funciones son tuyas ahora.')}
          </p>
          <button
            onClick={() => {
              setShowSuccess(false);
              onClose();
            }}
            className="w-full max-w-xs bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {tr('Start Exploring Premium', 'Empezar a Explorar Premium')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black z-[99999] w-screen h-screen overflow-y-auto overflow-x-hidden">
      {/* Blue gradient overlay in top right */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-cyan-400/15 via-blue-500/8 to-transparent blur-2xl pointer-events-none"></div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white transition-colors z-20 bg-slate-800/60 rounded-full border border-slate-700/50"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="min-h-full flex flex-col justify-center px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            {tr('UPGRADE NOW', 'MEJORA AHORA')}
          </h1>
          <p className="text-slate-400 text-base">
            {tr('Take the next step, looksmaxxing based on science.', 'Da el siguiente paso, mejora personal basada en ciencia.')}
          </p>
        </div>

        {/* Feature Cards Container */}
        <div className="w-full max-w-sm mx-auto mb-6">
          <div className="space-y-4">
            <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white text-center mb-4">
                {tr('Get your ratings', 'Obtén tus calificaciones')}
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Row 1 */}
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(68 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">68</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Overall', 'General')}</h3>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(91 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">91</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Potential', 'Potencial')}</h3>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(56 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">56</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Jawline', 'Mandíbula')}</h3>
                </div>

                {/* Row 2 */}
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(81 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">81</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Masculinity', 'Masculinidad')}</h3>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(65 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">65</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Skin quality', 'Calidad de piel')}</h3>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonBlueGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(76 / 100) * 251} 251`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">76</span>
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-xs">{tr('Cheekbones', 'Pómulos')}</h3>
                </div>

                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="neonBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
                      <stop offset="25%" stopColor="#00E5FF" stopOpacity="1" />
                      <stop offset="50%" stopColor="#00B4FF" stopOpacity="1" />
                      <stop offset="75%" stopColor="#0080FF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0040FF" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="text-center text-slate-400 text-sm">
                {tr('Powered by OpenAI', 'Impulsado por OpenAI')}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="px-4 pb-6 relative z-10">
          {/* Loading state */}
          {loadState === 'loading' && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-slate-400 text-sm ml-2">
                {tr('Loading plans...', 'Cargando planes...')}
              </span>
            </div>
          )}

          {/* Error / no offerings states */}
          {(loadState === 'error' || loadState === 'no-offerings') && (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">
                {loadState === 'no-offerings'
                  ? tr('Subscriptions are only available in the Android app.', 'Las suscripciones solo están disponibles en la app de Android.')
                  : tr('Could not load subscription plans. Please check your connection.', 'No se pudieron cargar los planes. Verifica tu conexión.')}
              </p>
              {loadState === 'error' && (
                <button
                  onClick={fetchOfferings}
                  className="text-cyan-400 text-sm underline hover:text-cyan-300"
                >
                  {tr('Retry', 'Reintentar')}
                </button>
              )}
            </div>
          )}

          {/* Ready state — show upgrade button */}
          {loadState === 'ready' && (
            <>
              {/* Show starting price */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-white">
                    {packages[0]?.priceString ?? ''}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {packages[0]?.periodLabel} {tr('auto-renews', 'se renueva automáticamente')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center relative overflow-hidden group mb-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="text-base font-medium mr-2">{tr('Upgrade to premium', 'Mejorar a premium')}</span>
              </button>
            </>
          )}

          {/* Restore Purchases — always visible on native */}
          {Capacitor.isNativePlatform() && (
            <button
              onClick={handleRestore}
              disabled={restoreLoading}
              className="w-full text-slate-400 text-xs text-center py-2 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {restoreLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              {tr('Restore Purchases', 'Restaurar Compras')}
            </button>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex justify-center space-x-6 text-slate-400 text-xs mt-3">
            <span className="hover:text-white transition-colors cursor-default">{tr('Terms of Service', 'Términos de Servicio')}</span>
            <span className="hover:text-white transition-colors cursor-default">{tr('Privacy Policy', 'Política de Privacidad')}</span>
          </div>
        </div>
      </div>

      {/* Subscription Selection Modal */}
      {showSubscriptionModal && loadState === 'ready' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 max-w-md w-full relative border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/60 rounded-full border border-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{tr('Choose Your Plan', 'Elige Tu Plan')}</h2>
              <p className="text-slate-400 text-sm">{tr('Unlock premium features now', 'Desbloquea funciones premium ahora')}</p>
            </div>

            <div className="space-y-3 mb-6">
              {packages.map((item) => {
                const isSelected = selectedPackage?.identifier === item.pkg.identifier;
                return (
                  <button
                    key={item.pkg.identifier}
                    onClick={() => setSelectedPackage(item.pkg)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-bold text-lg">{item.label}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <p className="text-white font-bold text-xl">
                          {item.priceString}{item.periodLabel}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">{item.subLabel}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Purchase error inside modal */}
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing || !selectedPackage}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group disabled:opacity-60 disabled:transform-none flex items-center justify-center"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {tr('Processing...', 'Procesando...')}
                </>
              ) : (
                <span>{tr('Upgrade Now', 'Mejorar Ahora')}</span>
              )}
            </button>

            <p className="text-slate-500 text-xs text-center mt-4 leading-relaxed">
              {tr('Auto-renews unless cancelled. Cancel anytime.', 'Se renueva automáticamente a menos que lo canceles. Cancela cuando quieras.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
