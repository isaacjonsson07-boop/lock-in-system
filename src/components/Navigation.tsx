import React from 'react';
import { CheckCircle, BookOpen, BarChart3, Layers, Settings, User, LogOut } from 'lucide-react';
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
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-sa-bg-warm border-r border-sa-border z-40">

        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <h1 className="font-serif text-lg text-sa-cream tracking-tight">
            Structured Achievement
          </h1>
          <p className="text-xs text-sa-cream-faint mt-1">Personal operating system</p>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-sa-border" />

        {/* Nav tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sa text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-sa-gold bg-sa-gold-soft font-medium'
                    : 'text-sa-cream-muted hover:text-sa-cream hover:bg-sa-bg-lift'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                  <span className="text-xs text-sa-gold/60 font-medium tabular-nums">
                    {installationDay}/21
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section — user */}
        <div className="px-4 pb-5 space-y-3">
          <div className="border-t border-sa-border pt-4" />

          {user && (
            <div className="px-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                plan === 'paid'
                  ? 'bg-sa-green-soft text-sa-green border border-sa-green-border'
                  : isTrialActive
                    ? 'bg-sa-gold-soft text-sa-gold border border-sa-gold-border'
                    : 'bg-sa-bg-lift text-sa-cream-faint border border-sa-border-light'
              }`}>
                {plan === 'paid' ? 'Active' : isTrialActive ? 'Trial' : 'Free'}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-sa-bg-lift border border-sa-border-light flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-sa-cream-faint" />
              </div>
              <span className="text-xs text-sa-cream-muted truncate flex-1">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="p-1 text-sa-cream-faint hover:text-sa-rose transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="flex items-center gap-2 px-2 text-sm text-sa-cream-muted hover:text-sa-gold transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden border-b border-sa-border bg-sa-bg/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-5">
          <span className="font-serif text-base text-sa-cream">
            Structured Achievement
          </span>

          <div className="flex items-center gap-2.5">
            {user && plan === 'paid' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sa-green-soft text-sa-green border border-sa-green-border">
                Active
              </span>
            )}

            {user ? (
              <span className="text-xs text-sa-cream-muted truncate max-w-[120px]">
                {user.email}
              </span>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-1.5 text-xs text-sa-cream-muted hover:text-sa-gold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sa-bg-warm/95 backdrop-blur-md border-t border-sa-border">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-[4rem] rounded-sa-sm transition-colors duration-150 ${
                  isActive
                    ? 'text-sa-gold'
                    : 'text-sa-cream-faint active:text-sa-cream-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                <span className={`text-[0.65rem] leading-none ${
                  isActive ? 'font-medium' : 'font-normal'
                }`}>
                  {tab.mobileLabel}
                </span>
                {tab.id === 'installation' && installationDay != null && installationDay <= 21 && (
                  <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-sa-gold" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
