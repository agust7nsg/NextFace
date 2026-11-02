import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { tr } from '../contexts/LanguageContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onDeleted }: DeleteAccountModalProps) {
  const [step, setStep] = useState<'confirm' | 'deleting' | 'done' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    setStep('deleting');
    setErrorMessage('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: { 'x-app-token': import.meta.env.VITE_APP_TOKEN ?? '' },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to delete account. Please try again.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      await supabase.auth.signOut();
      setStep('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again or contact support.';
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'deleting') return;
    if (step === 'done') {
      onDeleted();
    }
    setStep('confirm');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl max-w-md w-full border border-red-500/30 relative animate-scale-in shadow-2xl">
        {step !== 'deleting' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all duration-200 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === 'confirm' && (
          <>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{tr('Delete Account?', '¿Eliminar Cuenta?')}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {tr('This will permanently delete your account, all your photos, analysis results, and chat conversations. This action cannot be undone.', 'Esto eliminará permanentemente tu cuenta, todas tus fotos, resultados de análisis y conversaciones de chat. Esta acción no se puede deshacer.')}
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-left">
                <p className="text-red-300 text-xs leading-relaxed">
                  {tr('You will lose:', 'Perderás:')}
                </p>
                <ul className="text-slate-400 text-xs mt-2 space-y-1 pl-4">
                  <li>• {tr('All uploaded photos and analysis results', 'Todas las fotos subidas y resultados de análisis')}</li>
                  <li>• {tr('All chat conversations', 'Todas las conversaciones de chat')}</li>
                  <li>• {tr('Your profile and premium status', 'Tu perfil y estado premium')}</li>
                  <li>• {tr('Your account history', 'Tu historial de cuenta')}</li>
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{tr('Yes, Delete My Account', 'Sí, Eliminar Mi Cuenta')}</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 text-slate-400 hover:text-white transition-colors"
              >
                {tr('Cancel', 'Cancelar')}
              </button>
            </div>
          </>
        )}

        {step === 'deleting' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">{tr('Deleting your account...', 'Eliminando tu cuenta...')}</h2>
            <p className="text-slate-400 text-sm">{tr('Please wait while we remove your data.', 'Por favor espera mientras eliminamos tus datos.')}</p>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{tr('Account Deleted', 'Cuenta Eliminada')}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {tr('Your account and all associated data have been permanently deleted.', 'Tu cuenta y todos los datos asociados han sido eliminados permanentemente.')}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
            >
              {tr('Done', 'Hecho')}
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{tr('Something went wrong', 'Algo salió mal')}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {errorMessage || tr('We could not delete your account. Please try again or contact support.', 'No pudimos eliminar tu cuenta. Inténtalo de nuevo o contacta con soporte.')}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setStep('confirm')}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 transition-all duration-200"
              >
                {tr('Try Again', 'Reintentar')}
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 text-slate-400 hover:text-white transition-colors"
              >
                {tr('Close', 'Cerrar')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
