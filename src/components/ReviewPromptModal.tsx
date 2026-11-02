import React, { useEffect } from 'react';
import { X, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { tr } from '../contexts/LanguageContext';

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REVIEW_ENDPOINT =
  (import.meta as any)?.env?.VITE_REVIEW_ENDPOINT ||
  'https://hebwatwkpszebonmrige.supabase.co/functions/v1/Review_url';

export default function ReviewPromptModal({ isOpen, onClose }: ReviewPromptModalProps) {
  if (!isOpen) return null;

  // Close on Escape (UI-only)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stop: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleReviewClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Open the Edge Function; it will 302 to the correct store when envs are set
    window.open(REVIEW_ENDPOINT, '_blank', 'noopener,noreferrer');
    // Optionally close the modal after click
    onClose();
  };

  const handleFeedbackClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: wire to your feedback form/page if desired
    onClose();
  };

  const handleCloseClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
      onClick={onClose} // clicking the backdrop closes
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden animate-scale-in"
        onClick={stop} // block bubbling inside the modal
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseClick}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 transition-colors duration-200 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Star className="w-10 h-10 text-white fill-white" />
          </div>

          {/* Title */}
          <h2 id="review-title" className="text-2xl font-bold text-white mb-3">
            {tr('Enjoying NextFace?', '¿Disfrutando NextFace?')}
          </h2>

          {/* Description */}
          <p className="text-slate-300 mb-8 leading-relaxed">
            {tr("Your honest feedback helps us improve and helps others discover our app. If you're finding value in your glowup journey, we'd love to hear about it!", 'Tus comentarios honestos nos ayudan a mejorar y ayudan a otros a descubrir nuestra app. Si estás encontrando valor en tu viaje de mejora, ¡nos encantaría saberlo!')}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleReviewClick}
              className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl font-semibold text-white shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{tr('Leave a Review', 'Dejar una Reseña')}</span>
            </button>

            <button
              type="button"
              onClick={handleFeedbackClick}
              className="w-full p-4 bg-slate-800/60 backdrop-blur-sm rounded-2xl font-medium text-slate-300 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/60 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{tr('Send Feedback Instead', 'Enviar Comentarios')}</span>
            </button>

            <button
              type="button"
              onClick={handleCloseClick}
              className="w-full p-3 text-slate-400 hover:text-slate-300 transition-colors duration-200 text-sm"
            >
              {tr('Maybe later', 'Quizás después')}
            </button>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-xs text-slate-500">
            {tr('We never incentivize reviews. Your honest opinion matters most.', 'Nunca incentivamos reseñas. Tu opinión honesta es lo más importante.')}
          </p>
        </div>
      </div>
    </div>
  );
}
