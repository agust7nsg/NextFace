import React from 'react';
import { X, Mail, MessageCircle } from 'lucide-react';
import { tr } from '../contexts/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  const handleEmailClick = () => {
    window.open('mailto:help.nextfaceapp@gmail.com', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl max-w-md w-full border border-slate-700/50 relative animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tr('Contact Support', 'Contactar Soporte')}</h2>
              <p className="text-slate-400 text-sm">{tr('Get help with NextFace AI', 'Obtén ayuda con NextFace AI')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{tr('Need Help?', '¿Necesitas Ayuda?')}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tr('You can feel free to send us an email for any inquiry or issue you have with the app.', 'No dudes en enviarnos un correo para cualquier consulta o problema que tengas con la app.')}
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 mb-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{tr('Email us at:', 'Escríbenos a:')}</p>
                <p className="text-cyan-400 font-medium">help.nextfaceapp@gmail.com</p>
              </div>
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <button
            onClick={handleEmailClick}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>{tr('Send Email', 'Enviar Correo')}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-400 hover:text-white transition-colors"
          >
            {tr('Close', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  );
}