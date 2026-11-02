import { CheckCircle } from 'lucide-react';

export default function EmailConfirmedScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Your account is confirmed!
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Open the NextFace app on your device and sign in to continue.
        </p>
      </div>
    </div>
  );
}
