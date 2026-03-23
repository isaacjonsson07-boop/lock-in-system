import { useState, useCallback } from 'react';

// ============================================
// STRUCTURED ACHIEVEMENT — Unlock State
// Tracks which features have been unlocked via
// lesson action buttons. Stored in localStorage.
// ============================================

const STORAGE_KEY = 'sa_unlocks';
const MIGRATION_VERSION = 3; // Bump to re-run migration

export interface UnlockState {
  [unlockId: string]: boolean;
  _version?: any;
}

// All unlock IDs
const ALL_UNLOCK_IDS = [
  'system-direction', 'system-nns', 'today', 'reviews-weekly',
  'system-identity', 'system-priorities', 'system-habits',
  'system-decisions', 'system-failure', 'reviews-quarterly',
  'system-manual', 'journal',
];

// Map: which day's completion unlocks which feature
const DAY_UNLOCK_MAP: { day: number; unlockId: string }[] = [
  { day: 1, unlockId: 'system-direction' },
  { day: 4, unlockId: 'system-nns' },
  { day: 5, unlockId: 'today' },
  { day: 6, unlockId: 'journal' },
  { day: 7, unlockId: 'reviews-weekly' },
  { day: 8, unlockId: 'system-identity' },
  { day: 9, unlockId: 'system-priorities' },
  { day: 10, unlockId: 'system-habits' },
  { day: 13, unlockId: 'system-decisions' },
  { day: 15, unlockId: 'system-failure' },
  { day: 19, unlockId: 'reviews-quarterly' },
  { day: 20, unlockId: 'system-manual' },
];

function getHighestJournalDay(): number {
  try {
    const raw = localStorage.getItem('sa_journal_entries');
    if (!raw) return 0;
    const entries = JSON.parse(raw);
    let highest = 0;
    for (const entry of entries) {
      if (!entry.dayNumber || entry.dayNumber < 1 || entry.dayNumber > 21) continue;
      const hasContent =
        (entry.content && entry.content.trim() !== '') ||
        (entry.answers && Object.values(entry.answers).some((a: any) => a && a.trim() !== ''));
      if (hasContent && entry.dayNumber > highest) highest = entry.dayNumber;
    }
    return highest;
  } catch {
    return 0;
  }
}

function buildUnlocksForDay(highestDay: number): UnlockState {
  const state: UnlockState = { _version: MIGRATION_VERSION };
  for (const { day, unlockId } of DAY_UNLOCK_MAP) {
    if (highestDay >= day) state[unlockId] = true;
  }
  return state;
}

function loadUnlocks(): UnlockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : null;

    // If we have a fully migrated state at current version, use it
    if (existing && existing._version === MIGRATION_VERSION) {
      return existing;
    }

    // Migration: check journal progress and unlock accordingly
    const highestDay = getHighestJournalDay();
    if (highestDay > 0) {
      const state = buildUnlocksForDay(highestDay);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }

    // Check for any other existing data (NNs, system docs) without journal
    const hasExistingData =
      localStorage.getItem('sa_non_negotiables') ||
      localStorage.getItem('sa_system_documents') ||
      localStorage.getItem('dj_pro_v3');

    if (hasExistingData) {
      // Has data but no journal — conservatively unlock direction + NNs + today
      const state: UnlockState = {
        _version: MIGRATION_VERSION,
        'system-direction': true,
        'system-nns': true,
        'today': true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }

    // Brand new user
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

  const unlockUpToDay = useCallback((highestDay: number) => {
    const state = buildUnlocksForDay(highestDay);
    setUnlocks(state);
    saveUnlocks(state);
  }, []);

  const resetUnlocks = useCallback(() => {
    setUnlocks({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { unlocks, isUnlocked, triggerUnlock, unlockAll, unlockUpToDay, resetUnlocks };
}
