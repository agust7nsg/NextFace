import React, { useRef, useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: string;
  onClear: () => void;
}

export default function ImageUpload({ onImageSelect, selectedImage, onClear }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  const MAX_BYTES = 10 * 1024 * 1024;

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError('This photo is too large (max 10 MB). Please choose a smaller photo.');
      return;
    }

    const hasValidType = ALLOWED_TYPES.includes(file.type);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const hasValidExtension = ALLOWED_EXTENSIONS.includes(ext);

    // Android file pickers often return an empty MIME type for valid images.
    // Accept the file if either the type or the extension is recognized.
    if (!hasValidType && !hasValidExtension) {
      setError('This photo format is not supported. Please use a JPEG or PNG photo.');
      return;
    }

    onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  if (selectedImage) {
    return (
      <div className="relative">
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-64 object-cover rounded-2xl shadow-lg"
        />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 bg-gradient-to-br from-blue-900/10 via-cyan-900/5 to-blue-900/10 ${
        isDragOver
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-cyan-500/20 scale-105 shadow-lg shadow-cyan-500/25'
          : 'border-blue-400/40 hover:border-cyan-400/60 hover:bg-gradient-to-br hover:from-blue-500/15 hover:via-cyan-500/10 hover:to-blue-500/15 hover:scale-102 hover:shadow-lg hover:shadow-blue-500/20'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-full hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-cyan-500/40 animate-pulse-glow">
          <Camera className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{t.uploadYourPhoto}</h3>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            {t.dragDropPhoto}
          </p>
        </div>

        <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30 text-cyan-300 hover:text-cyan-200 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25">
          <Upload className="w-5 h-5 animate-bounce" />
          <span className="font-semibold">{t.chooseFile}</span>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 max-w-md">
            {error}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}
