import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { openWhopPaid } from '../constants';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  inline?: boolean;
}

export function UpgradePrompt({ feature, description, inline = false }: UpgradePromptProps) {
  if (inline) {
    return (
      <div className="flex items-center justify-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
        <span className="text-sm text-amber-900 dark:text-amber-200 font-medium">
          {feature} - Paid Feature
        </span>
        <button
          onClick={openWhopPaid}
          className="ml-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center"
        >
          <Crown className="w-3 h-3 mr-1" />
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-amber-200 dark:border-amber-700 rounded-xl">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
        <Crown className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {feature}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
          {description}
        </p>
      )}
      <button
        onClick={openWhopPaid}
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade to Paid Plan
      </button>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Unlock all features and remove limits
      </p>
    </div>
  );
}
