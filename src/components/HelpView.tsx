import React from 'react';
import { Info, Target, Calendar, BookOpen, TrendingUp, Mail, Lock, Crown, CheckCircle } from 'lucide-react';

export function HelpView() {
  return (
    <div className="space-y-6">
      {/* What is the Daily Achievement Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          What is the Daily Achievement Tracker?
        </h3>

        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p className="leading-relaxed">
            The Daily Achievement Tracker is a structured productivity system designed to help you build momentum through consistent daily action. It combines task execution, habit tracking, goal oversight, and guided reflection into one focused workflow.
          </p>
          <p className="leading-relaxed">
            The tracker is designed to work both as a standalone daily execution tool and as a core component of the Structured Achievement program. You can manage tasks, habits, and goals independently, but the full journaling experience is unlocked only when paired with the program's guided lessons.
          </p>
          <p className="leading-relaxed">
            The problem it solves is simple: scattered effort leads to scattered results. By giving you one clear place to execute your day, track consistency, and measure progress, the Daily Achievement Tracker helps you stay focused and build lasting momentum.
          </p>
        </div>
      </div>

      {/* How the App Works */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          How the App Works
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Today's Tasks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Your execution layer for the day. Log what you do using flexible tracking for time, distance, or count. This is where action happens and progress is recorded.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Daily Habits</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Create recurring habits that automatically appear in Today's Tasks on their scheduled days. Habits help you build consistency without needing to plan from scratch every day.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Dashboard</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Your high-level overview. The dashboard shows your active goals, completion rates, and long-term progress. Goals live inside the dashboard and connect your daily actions to bigger outcomes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Journaling (Program-Based)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Guided reflection tied directly to the Structured Achievement program. Journaling is not a standalone feature — it unlocks alongside the program's daily lessons to ensure reflection is structured, intentional, and aligned with your goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 21-Day Journaling Challenge */}
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
          21-Day Journaling Challenge
        </h3>

        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p className="leading-relaxed">
            The 21-Day Journaling Challenge is a guided reflection system that runs alongside the Structured Achievement program. Each journaling prompt is intentionally paired with daily lessons to reinforce clarity, awareness, and long-term behavioral change.
          </p>
          <p className="leading-relaxed">
            This is not free-form journaling. Prompts are unlocked day by day as part of the program to ensure reflection supports execution — not distraction.
          </p>
          <p className="leading-relaxed">
            <strong className="text-gray-800 dark:text-gray-200">What you gain:</strong> Clarity on what matters, awareness of your patterns,
            insights into obstacles, and a proven system for consistent self-improvement. Complete the challenge and you'll have built a
            sustainable practice that keeps you aligned with your goals.
          </p>
        </div>
      </div>

      {/* Access Levels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Access Levels
        </h3>

        <div className="space-y-4">
          <div className="border-l-4 border-gray-400 dark:border-gray-600 pl-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center">
              Free Access
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Access to Today's Tasks, Daily Habits, and the Dashboard with limited active goals at a time. This tier is designed for daily execution and habit tracking without guided journaling.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 dark:border-amber-600 pl-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center">
              <Crown className="w-4 h-4 mr-1 text-amber-600 dark:text-amber-400" />
              7-Day Trial
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Temporary access to the first 7 days of the Structured Achievement program, including the associated journaling prompts (Days 1–7). This allows you to experience how guided reflection integrates with daily execution.
            </p>
          </div>

          <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center">
              <Crown className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
              Full Access (Paid)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Complete access to the Structured Achievement program, including all 21 days of lessons and journaling prompts. Unlock unlimited goal tracking, full journaling access, and the complete structured system.
            </p>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Support
        </h3>

        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p className="leading-relaxed">
            Have questions or need help? We're here to support you on your journey.
          </p>
          <p className="leading-relaxed">
            <strong className="text-gray-800 dark:text-gray-200">Contact:</strong>{' '}
            <a
              href="mailto:admin@structuredachievement.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              admin@structuredachievement.com
            </a>
          </p>
          <p className="text-sm leading-relaxed">
            We typically respond within 24 hours. Whether you have a technical question, feature request, or just want to share your progress,
            we'd love to hear from you.
          </p>
        </div>
      </div>
    </div>
  );
}