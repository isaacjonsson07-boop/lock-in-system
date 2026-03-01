import React from 'react';
import { CheckCircle, BookOpen, BarChart3, Layers, Settings, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user?: { email?: string } | null;
  plan?: 'free' | 'paid';
  trialEndsAt?: string | null;
  onSignOut: () => void;
  onShowAuth?: () => void;
  installationDay?: number;
}

const tabs: { id: TabType; label: string; mobileLabel: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', mobileLabel: 'Today', icon: CheckCircle },
  { id: 'installation', label: 'Installation', mobileLabel: 'Install', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', mobileLabel: 'Reviews', icon: BarChart3 },
  { id: 'system', label: 'System', mobileLabel: 'System', icon: Layers },
  { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: Settings },
];

export function Navigation({
  currentTab,
  onTabChange,
  user,
  plan = 'free',
  trialEndsAt,
  onSignOut,
  onShowAuth,
  installationDay,
}: NavigationProps) {
  const isTrialActive = trialEndsAt ? new Date(trialEndsAt) > new Date() : false;

  return (
    <>
      {/* ===== DESKTOP HEADER ===== */}
      <header className="hidden md:block border-b border-sa-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="flex items-center justify-between h-14">

            {/* Brand */}
            <button
              onClick={() => onTabChange('today')}
              className="text-[0.65rem] font-medium tracking-[0.14em] uppercase text-sa-cream-muted hover:text-sa-cream transition-colors"
            >
              Structured Achievement
            </button>

            {/* Desktop tabs */}
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sa-sm text-[0.78rem] font-normal transition-all duration-150 ${
                      isActive
                        ? 'text-sa-gold bg-sa-gold-soft'
                        : 'text-sa-cream-muted hover:text-sa-cream-soft hover:bg-sa-bg-lift'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                      <span className="ml-0.5 text-[0.6rem] text-sa-gold/60 font-medium">
                        {installationDay}/21
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side — user info */}
            <div className="flex items-center gap-3">
              {/* Plan badge */}
              {user && (
                <span className={`text-[0.6rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  plan === 'paid'
                    ? 'bg-sa-green-soft text-sa-green border border-sa-green-border'
                    : isTrialActive
                      ? 'bg-sa-gold-soft text-sa-gold border border-sa-gold-border'
                      : 'bg-sa-bg-lift text-sa-cream-faint border border-sa-border-light'
                }`}>
                  {plan === 'paid' ? 'Active' : isTrialActive ? 'Trial' : 'Free'}
                </span>
              )}

              {user ? (
                <span className="text-[0.72rem] text-sa-cream-faint truncate max-w-[120px]">
                  {user.email}
                </span>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-1.5 text-[0.72rem] text-sa-cream-muted hover:text-sa-gold transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden border-b border-sa-border">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            onClick={() => onTabChange('today')}
            className="text-[0.6rem] font-medium tracking-[0.14em] uppercase text-sa-cream-muted"
          >
            Structured Achievement
          </button>

          <div className="flex items-center gap-2">
            {user && plan === 'paid' && (
              <span className="text-[0.55rem] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sa-green-soft text-sa-green border border-sa-green-border">
                Active
              </span>
            )}

            {user ? (
              <span className="text-[0.65rem] text-sa-cream-faint truncate max-w-[100px]">
                {user.email}
              </span>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1 text-[0.65rem] text-sa-cream-muted hover:text-sa-gold transition-colors"
              >
                <User className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sa-bg-warm border-t border-sa-border">
        <div className="flex items-center justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-[3.5rem] rounded-sa-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-sa-gold'
                    : 'text-sa-cream-faint active:text-sa-cream-muted'
                }`}
              >
                <Icon className={`w-[1.15rem] h-[1.15rem] ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                <span className={`text-[0.55rem] leading-none ${
                  isActive ? 'font-medium' : 'font-normal'
                }`}>
                  {tab.mobileLabel}
                </span>
                {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                  <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-sa-gold" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
