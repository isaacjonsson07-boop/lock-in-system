import { useState, useCallback } from 'react';

// ============================================
// STRUCTURED ACHIEVEMENT — Unlock State
// Tracks which features have been unlocked via
// lesson action buttons. Stored in localStorage.
// ============================================

const STORAGE_KEY = 'sa_unlocks';
const MIGRATION_VERSION = 2; // Bump this to re-run migration for existing users

export interface UnlockState {
  [unlockId: string]: boolean;
  _version?: any;
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
    const existing = raw ? JSON.parse(raw) : null;

    // If we have a fully migrated state at current version, use it
    if (existing && existing._version === MIGRATION_VERSION) {
      return existing;
    }

    // Migration: if user has existing app data, unlock everything
    const hasExistingData =
      localStorage.getItem('sa_non_negotiables') ||
      localStorage.getItem('sa_journal_entries') ||
      localStorage.getItem('sa_system_documents') ||
      localStorage.getItem('dj_pro_v3');
    
    if (hasExistingData) {
      const allUnlocked: UnlockState = { _version: MIGRATION_VERSION };
      ALL_UNLOCK_IDS.forEach(id => { allUnlocked[id] = true; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlocked));
      return allUnlocked;
    }

    // New user with no data — start fresh with version tag
    if (existing) {
      // Has partial unlocks from normal usage, just tag the version
      existing._version = MIGRATION_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return existing;
    }

    return { _version: MIGRATION_VERSION };
  } catch {
    return { _version: MIGRATION_VERSION };
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
    setUnlocks(prev => {
      const updated = { ...prev, [id]: true };
      saveUnlocks(updated);
      return updated;
    });
    return true;
  }, [unlocks]);

  const unlockAll = useCallback(() => {
    const allUnlocked: UnlockState = { _version: MIGRATION_VERSION };
    ALL_UNLOCK_IDS.forEach(id => { allUnlocked[id] = true; });
    setUnlocks(allUnlocked);
    saveUnlocks(allUnlocked);
  }, []);

  const resetUnlocks = useCallback(() => {
    setUnlocks({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { unlocks, isUnlocked, triggerUnlock, unlockAll, resetUnlocks };
}
