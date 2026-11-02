import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft, MailOpen, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tr } from '../contexts/LanguageContext';
import BlueAtmosphereGlow from '../components/BlueAtmosphereGlow';

interface AuthPageProps {
  onBack: () => void;
}

export default function AuthPage({ onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, resendConfirmation } = useAuth();
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Google sign in failed:', error);
      setError(tr('We could not sign you in with Google. Please try again.', 'No pudimos iniciar sesión con Google. Inténtalo de nuevo.'));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password.length < 6) {
      setError(tr('Password must be at least 6 characters', 'La contraseña debe tener al menos 6 caracteres'));
      setLoading(false);
      return;
    }

    if (isSignUp && !ageConfirmed) {
      setError(tr('Please confirm you are 16 or older to create an account.', 'Por favor confirma que tienes 16 años o más para crear una cuenta.'));
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        const raw = (error?.message ?? '').toLowerCase();
        const alreadyExists =
          raw.includes('already registered') ||
          raw.includes('already been registered') ||
          raw.includes('already exists') ||
          raw.includes('user already');

        if (error && !alreadyExists) {
          console.error('Sign up failed:', error);
          setError(tr('We could not complete your sign up. Please try again.', 'No pudimos completar tu registro. Inténtalo de nuevo.'));
        } else {
          // Email confirmation is enabled — redirect to the "check your email" screen
          // so the user knows to verify before they can sign in.
          setConfirmEmail(email);
          setShowConfirmScreen(true);
          setError(null);
          setSuccess(null);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          const raw = (error.message ?? '').toLowerCase();
          if (raw.includes('not confirmed') || raw.includes('email not confirmed') || raw.includes('not_verified')) {
            setConfirmEmail(email);
            setShowConfirmScreen(true);
            setError(null);
            return;
          }
          console.error('Sign in failed:', error);
          setError(tr('Incorrect email or password.', 'Correo o contraseña incorrectos.'));
        }
      }
    } catch (err) {
      setError(tr('An unexpected error occurred', 'Ocurrió un error inesperado'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResetLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(tr('Could not send reset link. Please try again.', 'No se pudo enviar el enlace de recuperación. Inténtalo de nuevo.'));
      } else {
        setSuccess(tr('Check your email for a reset link.', 'Revisa tu correo para el enlace de recuperación.'));
        setResetMode(false);
      }
    } catch (err) {
      setError(tr('An unexpected error occurred', 'Ocurrió un error inesperado'));
    } finally {
      setResetLoading(false);
    }
  };

  if (showConfirmScreen) {
    const handleResend = async () => {
      setResendLoading(true);
      setResentSuccess(false);
      const { error } = await resendConfirmation(confirmEmail);
      setResendLoading(false);
      if (error) {
        setError(tr('Could not resend confirmation email. Please try again.', 'No se pudo reenviar el correo de confirmación. Inténtalo de nuevo.'));
      } else {
        setResentSuccess(true);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex items-center justify-center p-4">
        <BlueAtmosphereGlow />
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
            <MailOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {tr('Check Your Email', 'Revisa Tu Correo')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            {tr('We sent a confirmation link to', 'Enviamos un enlace de confirmación a')}
          </p>
          <p className="text-cyan-400 font-medium mb-4 break-all">{confirmEmail}</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {tr('Tap the link in that email to activate your account. Then come back and sign in.', 'Toca el enlace en ese correo para activar tu cuenta. Luego vuelve e inicia sesión.')}
          </p>

          {resentSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-6">
              <p className="text-emerald-400 text-sm text-center">{tr('Confirmation email resent.', 'Correo de confirmación reenviado.')}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full py-3.5 bg-slate-800/60 border border-slate-700/50 text-white font-medium rounded-2xl hover:bg-slate-700/60 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
          >
            {resendLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {resendLoading ? tr('Sending...', 'Enviando...') : tr('Resend Confirmation Email', 'Reenviar Correo de Confirmación')}
          </button>

          <button
            onClick={() => {
              setShowConfirmScreen(false);
              setConfirmEmail('');
              setIsSignUp(false);
              setEmail('');
              setPassword('');
              setAgeConfirmed(false);
              setError(null);
              setResentSuccess(false);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-6"
          >
            {tr('I\'ve Confirmed — Sign In', 'Ya Confirmé — Iniciar Sesión')}
          </button>

          <button
            onClick={() => { onBack(); }}
            className="inline-flex items-center text-slate-400 text-sm hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {tr('Back', 'Volver')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden flex items-center justify-center p-4">
      <BlueAtmosphereGlow />
      <div className="w-full max-w-sm">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {resetMode
              ? tr('Reset Your Password', 'Restablece Tu Contraseña')
              : isSignUp ? tr('Create Your Account.', 'Crea Tu Cuenta.') : tr('Sign In To Your Account.', 'Inicia Sesión En Tu Cuenta.')}
          </h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
            <p className="text-emerald-400 text-sm text-center">{success}</p>
          </div>
        )}

        {/* Form */}
        {resetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">{tr('Email', 'Correo')}</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  placeholder="alma.lawson@example.com"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {resetLoading ? tr('Processing...', 'Procesando...') : tr('Send Reset Link', 'Enviar Enlace')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(null); setSuccess(null); }}
                className="inline-flex items-center text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {tr('Back to sign in', 'Volver a iniciar sesión')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">{tr('Email', 'Correo')}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                placeholder="alma.lawson@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">{tr('Password', 'Contraseña')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 pr-12"
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

          {/* Age Confirmation (Sign Up Only) */}
          {isSignUp && (
            <button
              type="button"
              onClick={() => setAgeConfirmed(!ageConfirmed)}
              className="flex items-start gap-3 text-left group"
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
                  ageConfirmed
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 border-transparent'
                    : 'border-slate-600 group-hover:border-slate-500'
                }`}
              >
                {ageConfirmed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
              <span className="text-slate-400 text-sm leading-relaxed">
                {tr.rich ? '' : ''}{tr('I confirm that I am', 'Confirmo que tengo')} <span className="text-white font-medium">{tr('16 years or older', '16 años o más')}</span> {tr('and agree to NextFace\'s terms of service and privacy policy.', 'y acepto los términos de servicio y la política de privacidad de NextFace.')}
              </span>
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? tr('Processing...', 'Procesando...') : isSignUp ? tr('Create Account', 'Crear Cuenta') : tr('Sign In', 'Iniciar Sesión')}
          </button>

          {/* Forgot Password (Sign In Only) */}
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setResetMode(true); setError(null); setSuccess(null); }}
                className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                {tr('Forgot password?', '¿Olvidaste tu contraseña?')}
              </button>
            </div>
          )}
        </form>
        )}

        {/* Divider */}
        {!resetMode && (
          <>
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="px-4 text-slate-500 text-sm">{tr('Or', 'O')}</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-white hover:bg-slate-700/60 hover:border-slate-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{googleLoading ? tr('Redirecting...', 'Redirigiendo...') : tr('Sign in with Google', 'Iniciar sesión con Google')}</span>
              </button>
            </div>
          </>
        )}


        {/* Toggle Sign In/Sign Up */}
        {!resetMode && (
          <div className="text-center mt-8">
            <span className="text-slate-400 text-sm">
              {isSignUp ? tr("Already have an account? ", "¿Ya tienes una cuenta? ") : tr("Don't have an account? ", "¿No tienes una cuenta? ")}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
                setEmail('');
                setPassword('');
                setAgeConfirmed(false);
              }}
              className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
            >
              {isSignUp ? tr('Sign In', 'Iniciar Sesión') : tr('Sign Up', 'Registrarse')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}