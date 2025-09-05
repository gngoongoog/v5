import React from 'react';
import { usePWA } from '../hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">تثبيت التطبيق</h3>
          <p className="text-xs opacity-90">
            ثبت التطبيق على جهازك للوصول السريع
          </p>
        </div>
        <div className="flex gap-2 mr-3">
          <button
            onClick={installApp}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            تثبيت
          </button>
          <button
            onClick={() => window.localStorage.setItem('installPromptDismissed', 'true')}
            className="text-white/80 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;

