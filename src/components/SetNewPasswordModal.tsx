import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';
import GradientButton from './GradientButton';

export default function SetNewPasswordModal() {
  const { isPasswordRecovery, updatePassword } = useAuth();
  console.log('[AUTH DEBUG] SetNewPasswordModal render', { isPasswordRecovery });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isPasswordRecovery || success) {
    console.log('[AUTH DEBUG] SetNewPasswordModal returning null', { isPasswordRecovery, success });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(tr('Password must be at least 6 characters', 'La contraseña debe tener al menos 6 caracteres'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(tr('Passwords do not match', 'Las contraseñas no coinciden'));
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      setError(tr('Could not update your password. Please try again.', 'No se pudo actualizar tu contraseña. Inténtalo de nuevo.'));
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl p-6 max-w-md w-full border border-slate-700/50 relative animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tr('Set New Password', 'Establecer Nueva Contraseña')}</h2>
              <p className="text-slate-400 text-sm">{tr('Choose a new password for your account', 'Elige una nueva contraseña para tu cuenta')}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">{tr('New Password', 'Nueva Contraseña')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">{tr('Confirm Password', 'Confirmar Contraseña')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <GradientButton
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{tr('Saving...', 'Guardando...')}</span>
              </>
            ) : (
              <span>{tr('Update Password', 'Actualizar Contraseña')}</span>
            )}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
