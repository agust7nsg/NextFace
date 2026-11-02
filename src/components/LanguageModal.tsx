import React from 'react';
import { X, Check, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
}

export default function LanguageModal({ isOpen, onClose, currentLanguage, onLanguageChange }: LanguageModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const languages = [
    { code: 'en' as const, name: t.english, flag: '🇺🇸' },
    { code: 'es' as const, name: t.spanish, flag: '🇪🇸' }
  ];

  const handleLanguageSelect = (languageCode: 'en' | 'es') => {
    onLanguageChange(languageCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-700/50 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.selectLanguage}</h2>
          <p className="text-slate-400">{t.choosePreferredLanguage}</p>
        </div>

        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                currentLanguage === language.code
                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-emerald-500/30 hover:bg-slate-700/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}