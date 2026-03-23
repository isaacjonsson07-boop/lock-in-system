import { useState, useCallback } from 'react';

// ============================================
// STRUCTURED ACHIEVEMENT — Unlock State
// Tracks which features have been unlocked via
// lesson action buttons. Stored in localStorage.
// ============================================

const STORAGE_KEY = 'sa_unlocks';

export interface UnlockState {
  [unlockId: string]: boolean;
}

// All unlock IDs — used to auto-unlock for existing users
const ALL_UNLOCK_IDS = [
  'system-direction', 'system-nns', 'today', 'reviews-weekly',
  'system-identity', 'system-priorities', 'system-habits',
  'system-decisions', 'system-failure', 'reviews-quarterly',
  'system-manual', 'journal',
];

function loadUnlocks(): UnlockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Migration: if no unlock state exists but user has existing app data,
    // they're an existing user — unlock everything so they're not locked out
    const hasExistingData =
      localStorage.getItem('sa_non_negotiables') ||
      localStorage.getItem('sa_journal_entries') ||
      localStorage.getItem('sa_system_documents') ||
      localStorage.getItem('dj_pro_v3');
    
    if (hasExistingData) {
      const allUnlocked: UnlockState = {};
      ALL_UNLOCK_IDS.forEach(id => { allUnlocked[id] = true; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlocked));
      return allUnlocked;
    }

    return {};
  } catch {
    return {};
  }
}

function saveUnlocks(state: UnlockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useUnlocks() {
  const [unlocks, setUnlocks] = useState<UnlockState>(loadUnlocks);

  const isUnlocked = useCallback((id: string): boolean => {
    return !!unlocks[id];
  }, [unlocks]);

  const triggerUnlock = useCallback((id: string): boolean => {
    // Returns true if this is a NEW unlock (first time), false if already unlocked
    if (unlocks[id]) return false;
    const updated = { ...unlocks, [id]: true };
    setUnlocks(updated);
    saveUnlocks(updated);
    return true;
  }, [unlocks]);

  const resetUnlocks = useCallback(() => {
    setUnlocks({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { unlocks, isUnlocked, triggerUnlock, resetUnlocks };
}
