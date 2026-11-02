import React, { useState } from 'react';
import { X, Code, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';

interface CreatorCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorCodeModal({ isOpen, onClose }: CreatorCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user, isPremium, redeemCode } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await redeemCode(code);

    if (result.success) {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Invalid creator code. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-700/50 relative shadow-2xl shadow-blue-500/20 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent mb-2">
            {tr('Creator Code', 'Código de Creador')}
          </h2>
          <p className="text-slate-300 text-sm">{tr('Enter your creator code to unlock premium features', 'Ingresa tu código de creador para desbloquear funciones premium')}</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="text-center mb-6 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">{tr('Premium Activated!', '¡Premium Activado!')}</h3>
            <p className="text-slate-300 text-sm">{tr('You now have access to all premium features', 'Ahora tienes acceso a todas las funciones premium')}</p>
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{tr('Welcome to Premium', 'Bienvenido a Premium')}</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 animate-fade-in">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Already Premium Message */}
            {isPremium && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 animate-fade-in">
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 text-sm font-medium">{tr('You already have premium access!', '¡Ya tienes acceso premium!')}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">{tr('Creator Code', 'Código de Creador')}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-center font-mono text-lg tracking-widest"
                  placeholder="XXXX-XXXXXXXXXX"
                  maxLength={32}
                  required
                  disabled={loading || isPremium}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isPremium || !code.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{tr('Validating...', 'Validando...')}</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative">{tr('Activate Premium', 'Activar Premium')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-xs">
                {tr('Creator codes are provided by NextFace AI influencers', 'Los códigos de creador son proporcionados por influencers de NextFace AI')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}