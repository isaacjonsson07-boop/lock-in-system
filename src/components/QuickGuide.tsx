import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface QuickGuideProps {
  title: string;
  tips: string[];
}

export function QuickGuide({ title, tips }: QuickGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-100/50 dark:hover:bg-blue-800/40 transition-colors rounded-lg"
      >
        <span className="font-medium text-blue-800 dark:text-blue-200">{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 text-sm text-blue-700 dark:text-blue-300 space-y-1.5">
          {tips.map((tip, index) => (
            <p key={index}>• {tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
