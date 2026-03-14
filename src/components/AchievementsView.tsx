import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Target, Flame, Calendar, CheckCircle, AlertTriangle, X, Gem } from 'lucide-react';
import { NonNegotiable, NonNegotiableCompletion, Habit, HabitCompletion, DailyTask, SystemReport, ReportTier } from '../types';
import { uid, fmtDateISO } from '../utils/dateUtils';
import { generateMonthlyReport, getTier, TIER_CONFIG } from '../utils/scoreUtils';

interface AchievementsViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  userId?: string;
  systemReports: SystemReport[];
  onSaveSystemReport: (report: SystemReport) => void;
}

// ═══════════════════════════════════════════════════════
// MILESTONE DEFINITIONS
// ═══════════════════════════════════════════════════════

type MilestoneChapter = 'foundation' | 'momentum' | 'mastery';

interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  chapter: MilestoneChapter;
  check: (ctx: MilestoneContext) => boolean;
  requirement: string;
}

interface MilestoneContext {
  activeNNs: NonNegotiable[];
  habits: Habit[];
  nnCompletions: NonNegotiableCompletion[];
  habitCompletions: HabitCompletion[];
  dailyTasks: DailyTask[];
  systemReports: SystemReport[];
  totalActiveDays: number;
  totalTasksCompleted: number;
  longestStreak80: number;
  longestNNStreak: number;
  hasAnyFullDay: boolean;
}

const CHAPTER_META: Record<MilestoneChapter, { label: string; color: string; colorDim: string; glow: string }> = {
  foundation: { label: 'FOUNDATION', color: '#C5A55A', colorDim: 'rgba(197,165,90,0.25)', glow: 'rgba(197,165,90,0.35)' },
  momentum:   { label: 'MOMENTUM',   color: '#6DB5F5', colorDim: 'rgba(109,181,245,0.25)', glow: 'rgba(109,181,245,0.35)' },
  mastery:    { label: 'MASTERY',     color: '#6ECB8B', colorDim: 'rgba(110,203,139,0.25)', glow: 'rgba(110,203,139,0.35)' },
};

const MILESTONES: MilestoneDef[] = [
  // Foundation
  { id: 'system-online',    title: 'System Online',       description: 'Configure at least 1 non-negotiable and 1 habit to bring your system online.', chapter: 'foundation', check: c => c.activeNNs.length >= 1 && c.habits.length >= 1, requirement: '1 non-negotiable + 1 habit' },
  { id: 'first-execution',  title: 'First Execution',     description: 'Complete 100% of all items in a single day. Prove the system can run.', chapter: 'foundation', check: c => c.hasAnyFullDay, requirement: '100% completion on any day' },
  { id: 'week-one',         title: 'Week One',            description: 'Be active for 7 days total. The system is taking root.', chapter: 'foundation', check: c => c.totalActiveDays >= 7, requirement: '7 active days' },
  { id: 'grounded',         title: 'Grounded',            description: '14 active days. Your system has roots now.', chapter: 'foundation', check: c => c.totalActiveDays >= 14, requirement: '14 active days' },
  { id: 'executor',         title: 'Executor',            description: '25 tasks completed. Consistent output confirmed.', chapter: 'foundation', check: c => c.totalTasksCompleted >= 25, requirement: '25 tasks completed' },
  // Momentum
  { id: '7-day-streak',     title: '7-Day Streak',        description: '7 consecutive days at 80%+ completion. Discipline streak active.', chapter: 'momentum', check: c => c.longestStreak80 >= 7, requirement: '7-day streak at 80%+' },
  { id: 'nn-lock',          title: 'NN Lock',             description: '7 days straight without missing a single non-negotiable.', chapter: 'momentum', check: c => c.longestNNStreak >= 7, requirement: '7-day perfect NN streak' },
  { id: 'first-report',     title: 'First Report',        description: 'Generate your first monthly System Report.', chapter: 'momentum', check: c => c.systemReports.length >= 1, requirement: 'Generate 1 report' },
  { id: 'half-century',     title: 'Half Century',        description: '50 tasks completed. Steady operational output.', chapter: 'momentum', check: c => c.totalTasksCompleted >= 50, requirement: '50 tasks completed' },
  { id: 'silver-caliber',   title: 'Silver Caliber',      description: 'Earn Silver tier or higher in a monthly System Report.', chapter: 'momentum', check: c => c.systemReports.some(r => ['silver','gold','diamond'].includes(r.tier)), requirement: 'Silver+ monthly report' },
  // Mastery
  { id: '14-day-streak',    title: '14-Day Streak',       description: 'Two unbroken weeks of execution at 80%+.', chapter: 'mastery', check: c => c.longestStreak80 >= 14, requirement: '14-day streak at 80%+' },
  { id: 'gold-standard',    title: 'Gold Standard',       description: 'Earn Gold tier in a monthly System Report.', chapter: 'mastery', check: c => c.systemReports.some(r => ['gold','diamond'].includes(r.tier)), requirement: 'Gold monthly report' },
  { id: 'century',          title: 'Century',             description: '100 tasks completed. Relentless execution.', chapter: 'mastery', check: c => c.totalTasksCompleted >= 100, requirement: '100 tasks completed' },
  { id: '30-day-operator',  title: '30-Day Operator',     description: '30 active days. The system runs on autopilot.', chapter: 'mastery', check: c => c.totalActiveDays >= 30, requirement: '30 active days' },
  { id: 'diamond-operator', title: 'Diamond Operator',    description: 'Earn a perfect Diamond report. Peak operational capacity.', chapter: 'mastery', check: c => c.systemReports.some(r => r.tier === 'diamond'), requirement: 'Diamond report (100%)' },
];

function getRank(n: number) {
  if (n >= 14) return { title: 'Full Stack', next: null };
  if (n >= 10) return { title: 'Architect', next: 'Full Stack' };
  if (n >= 6)  return { title: 'Operator', next: 'Architect' };
  if (n >= 3)  return { title: 'Initiate', next: 'Operator' };
  return { title: 'Newcomer', next: 'Initiate' };
}

// ═══════════════════════════════════════════════════════
// MILESTONE COMPUTATION
// ═══════════════════════════════════════════════════════

function computeCtx(
  nns: NonNegotiable[], nnC: NonNegotiableCompletion[],
  habits: Habit[], hC: HabitCompletion[],
  tasks: DailyTask[], reports: SystemReport[],
): MilestoneContext {
  const activeNNs = nns.filter(n => n.active);
  const allDates = new Set<string>();
  nnC.forEach(c => allDates.add(c.completion_date));
  hC.forEach(c => allDates.add(c.completion_date));
  tasks.filter(t => t.completed).forEach(t => allDates.add(t.task_date));

  const sorted = Array.from(allDates).sort();
  const evalDates: string[] = [];
  if (sorted.length > 0) {
    const cursor = new Date(sorted[0] + 'T00:00:00');
    const end = new Date();
    while (cursor <= end) { evalDates.push(fmtDateISO(cursor)); cursor.setDate(cursor.getDate() + 1); }
  }

  let hasAnyFullDay = false, longestStreak80 = 0, cur80 = 0, longestNNStreak = 0, curNN = 0;

  for (const date of evalDates) {
    const d = new Date(date + 'T00:00:00');
    const di = d.getDay(), ds = d.getTime();
    const nnsDay = activeNNs.filter(nn => new Date(nn.created_at).getTime() <= ds + 86400000);
    const nnDone = nnsDay.filter(nn => nnC.some(c => c.non_negotiable_id === nn.id && c.completion_date === date)).length;
    const habDay = habits.filter(h => h.days_of_week.includes(di) && new Date(h.created_at).getTime() <= ds + 86400000);
    const habDone = habDay.filter(h => hC.some(c => c.habit_id === h.id && c.completion_date === date)).length;
    const tDay = tasks.filter(t => t.task_date === date);
    const tDone = tDay.filter(t => t.completed).length;
    const total = nnsDay.length + habDay.length + tDay.length;
    const done = nnDone + habDone + tDone;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    if (pct === 100 && total > 0) hasAnyFullDay = true;
    if (pct >= 80 && total > 0) { cur80++; longestStreak80 = Math.max(longestStreak80, cur80); } else cur80 = 0;
    if (nnsDay.length > 0 && nnDone === nnsDay.length) { curNN++; longestNNStreak = Math.max(longestNNStreak, curNN); } else if (nnsDay.length > 0) curNN = 0;
  }

  return { activeNNs, habits, nnCompletions: nnC, habitCompletions: hC, dailyTasks: tasks, systemReports: reports,
    totalActiveDays: allDates.size, totalTasksCompleted: tasks.filter(t => t.completed).length,
    longestStreak80, longestNNStreak, hasAnyFullDay };
}

// ═══════════════════════════════════════════════════════
// PATH LAYOUT
// ═══════════════════════════════════════════════════════

const VB_W = 300;
const X_L = 80;
const X_R = 220;
const Y_START = 50;
const Y_GAP = 95;
const CHAPTER_GAP = 65;

function getNodePos(i: number) {
  let extra = 0;
  if (i >= 5) extra += CHAPTER_GAP;
  if (i >= 10) extra += CHAPTER_GAP;
  return { x: i % 2 === 0 ? X_L : X_R, y: Y_START + i * Y_GAP + extra };
}

function curveBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  const my = (a.y + b.y) / 2;
  return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
}

const TOTAL_H = Y_START + 14 * Y_GAP + 2 * CHAPTER_GAP + 50;

// Chapter break Y positions
const CHAP_BREAK_1_Y = (getNodePos(4).y + getNodePos(5).y) / 2;
const CHAP_BREAK_2_Y = (getNodePos(9).y + getNodePos(10).y) / 2;

// ═══════════════════════════════════════════════════════
// ADVENTURE PATH SVG
// ═══════════════════════════════════════════════════════

function AdventurePath({ unlockedCount, nextIndex, selectedIndex, onSelect }: {
  unlockedCount: number;
  nextIndex: number | null;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const positions = MILESTONES.map((_, i) => getNodePos(i));

  const getChapterColor = (i: number) => {
    if (i < 5) return CHAPTER_META.foundation;
    if (i < 10) return CHAPTER_META.momentum;
    return CHAPTER_META.mastery;
  };

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${TOTAL_H}`}
      className="w-full"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
    >
      <defs>
        <filter id="gf-gold" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" /></filter>
        <filter id="gf-blue" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" /></filter>
        <filter id="gf-green" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" /></filter>
      </defs>

      {/* ── Path segments ── */}
      {positions.slice(0, -1).map((p, i) => {
        const next = positions[i + 1];
        const d = curveBetween(p, next);
        const isCompleted = i < unlockedCount - 1;
        const isCurrent = i === unlockedCount - 1;
        const ch = getChapterColor(i + 1);

        if (isCompleted) {
          return (
            <g key={`seg-${i}`}>
              {/* Glow trail */}
              <path d={d} fill="none" stroke={ch.glow} strokeWidth="10" strokeLinecap="round" opacity="0.3" />
              {/* Main line */}
              <path d={d} fill="none" stroke={ch.color} strokeWidth="3" strokeLinecap="round" />
            </g>
          );
        }
        if (isCurrent) {
          return (
            <g key={`seg-${i}`}>
              <path d={d} fill="none" stroke={ch.colorDim} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 6">
                <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="3s" repeatCount="indefinite" />
              </path>
            </g>
          );
        }
        return (
          <path key={`seg-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 6" />
        );
      })}

      {/* ── Chapter break lines ── */}
      {[
        { y: CHAP_BREAK_1_Y, label: 'MOMENTUM', color: CHAPTER_META.momentum.color },
        { y: CHAP_BREAK_2_Y, label: 'MASTERY', color: CHAPTER_META.mastery.color },
      ].map(cb => (
        <g key={cb.label}>
          <line x1="40" y1={cb.y} x2="260" y2={cb.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="150" y={cb.y - 10} textAnchor="middle" fill={cb.color} fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="500" letterSpacing="3" opacity="0.7">{cb.label}</text>
        </g>
      ))}
      {/* Foundation label at very top */}
      <text x="150" y="20" textAnchor="middle" fill={CHAPTER_META.foundation.color} fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="500" letterSpacing="3" opacity="0.7">FOUNDATION</text>

      {/* ── Nodes ── */}
      {positions.map((pos, i) => {
        const isUnlocked = i < unlockedCount;
        const isNext = nextIndex === i;
        const isSelected = selectedIndex === i;
        const ch = getChapterColor(i);
        const r = 22;

        // Label position
        const labelX = pos.x === X_L ? pos.x + r + 12 : pos.x - r - 12;
        const labelAnchor = pos.x === X_L ? 'start' : 'end';

        return (
          <g key={`node-${i}`} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}>
            {/* Glow behind unlocked nodes */}
            {isUnlocked && (
              <circle cx={pos.x} cy={pos.y} r={r + 8} fill={ch.color}
                filter={i < 5 ? 'url(#gf-gold)' : i < 10 ? 'url(#gf-blue)' : 'url(#gf-green)'}
                opacity="0.5" />
            )}

            {/* Pulse ring for current/next node */}
            {isNext && (
              <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke={ch.color} strokeWidth="2">
                <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.5s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke={isUnlocked ? ch.color : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeDasharray="3 3" />
            )}

            {/* Main circle */}
            {isUnlocked ? (
              <circle cx={pos.x} cy={pos.y} r={r} fill={ch.color} stroke="none" />
            ) : isNext ? (
              <circle cx={pos.x} cy={pos.y} r={r} fill="rgba(255,255,255,0.03)" stroke={ch.color} strokeWidth="1.5" />
            ) : (
              <circle cx={pos.x} cy={pos.y} r={r - 2} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            )}

            {/* Node number or check */}
            {isUnlocked ? (
              <path d={`M${pos.x - 6},${pos.y} L${pos.x - 2},${pos.y + 4} L${pos.x + 7},${pos.y - 5}`}
                fill="none" stroke="#131316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
                fill={isNext ? ch.color : 'rgba(255,255,255,0.2)'}
                fontSize="13" fontFamily="'Cormorant Garamond',serif" fontWeight="500">
                {i + 1}
              </text>
            )}

            {/* Title label */}
            <text x={labelX} y={pos.y - 4} textAnchor={labelAnchor}
              fill={isUnlocked ? 'var(--cream,#F2EDE4)' : isNext ? 'var(--cream-soft,#D8D2C7)' : 'rgba(255,255,255,0.15)'}
              fontSize="11.5" fontFamily="'Cormorant Garamond',serif" fontWeight={isUnlocked ? '600' : '400'}>
              {MILESTONES[i].title}
            </text>

            {/* Requirement subtitle for next milestone only */}
            {isNext && (
              <text x={labelX} y={pos.y + 12} textAnchor={labelAnchor}
                fill={ch.color} fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="400" opacity="0.8">
                {MILESTONES[i].requirement}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// MILESTONE DETAIL CARD
// ═══════════════════════════════════════════════════════

function MilestoneDetail({ index, unlocked, isNext }: { index: number; unlocked: boolean; isNext: boolean }) {
  const m = MILESTONES[index];
  const ch = CHAPTER_META[m.chapter];

  return (
    <div className="mt-6 p-5 rounded-sa-lg border transition-all duration-300" style={{
      borderColor: unlocked ? ch.glow : isNext ? ch.colorDim : 'rgba(255,255,255,0.06)',
      backgroundColor: unlocked ? `${ch.color}08` : 'rgba(255,255,255,0.02)',
    }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="font-serif text-lg" style={{ color: unlocked ? ch.color : isNext ? ch.color : 'var(--cream-faint)' }}>
          {m.title}
        </span>
        {unlocked && <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
          style={{ color: ch.color, backgroundColor: `${ch.color}15`, border: `1px solid ${ch.colorDim}` }}>Unlocked</span>}
        {isNext && !unlocked && <span className="text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
          style={{ color: ch.color, backgroundColor: `${ch.color}15`, border: `1px solid ${ch.colorDim}` }}>Next</span>}
      </div>
      <p className="text-[0.85rem] text-sa-cream-muted leading-relaxed mb-2">{m.description}</p>
      {!unlocked && (
        <p className="text-[0.75rem]" style={{ color: ch.color }}>{m.requirement}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// RANK HEADER
// ═══════════════════════════════════════════════════════

function RankHeader({ unlocked, total, rank }: { unlocked: number; total: number; rank: { title: string; next: string | null } }) {
  const pct = total > 0 ? (unlocked / total) * 100 : 0;
  const color = pct >= 80 ? '#6ECB8B' : pct >= 40 ? '#6DB5F5' : '#C5A55A';
  const sz = 88, sw = 3, r = (sz - sw * 2) / 2, circ = 2 * Math.PI * r, off = circ - (pct / 100) * circ;

  return (
    <div className="sa-card-elevated mb-8 flex items-center justify-between flex-wrap gap-5">
      <div className="flex items-center gap-5">
        <div className="relative" style={{ width: sz, height: sz }}>
          <svg width={sz} height={sz} className="transform -rotate-90">
            <circle cx={sz / 2} cy={sz / 2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" />
            <circle cx={sz / 2} cy={sz / 2} r={r} stroke={color} strokeWidth={sw} fill="none"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-xl text-sa-cream">{unlocked}</span>
            <span className="text-[0.55rem] text-sa-cream-faint">/ {total}</span>
          </div>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-0.5">Current Rank</p>
          <p className="font-serif text-xl text-sa-cream">{rank.title}</p>
          {rank.next && <p className="text-[0.7rem] text-sa-cream-faint mt-0.5">Next: <span style={{ color }}>{rank.next}</span></p>}
        </div>
      </div>
      <div className="flex gap-2">
        {(['foundation', 'momentum', 'mastery'] as const).map(ch => {
          const meta = CHAPTER_META[ch];
          const tot = MILESTONES.filter(m => m.chapter === ch).length;
          const dn = MILESTONES.filter((m, i) => m.chapter === ch && i < unlocked).length;
          return (
            <div key={ch} className="text-center px-2.5 py-2 rounded-sa" style={{ backgroundColor: `${meta.color}10` }}>
              <span className="block font-serif text-base" style={{ color: meta.color }}>{dn}</span>
              <span className="text-[0.55rem] text-sa-cream-faint">/{tot}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// REPORT COMPONENTS (preserved from existing)
// ═══════════════════════════════════════════════════════

function getMonthLabel(m: string) { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
function getShortMonthLabel(m: string) { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short' }); }
function getYearLabel(m: string) { return m.split('-')[0]; }

function DiamondFrame() {
  const s = (t: string): React.CSSProperties => ({ position: 'absolute', width: 85, height: 85, opacity: 0.85, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(184,212,232,0.4))' });
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{[['scaleY(-1)', 0, 0, 'top', 'left'], ['scale(-1,-1)', 0, 0, 'top', 'right'], ['none', 0, 0, 'bottom', 'left'], ['scaleX(-1)', 0, 0, 'bottom', 'right']].map(([t, , , v, h], i) => <img key={i} src="/corner-diamond.svg" alt="" style={{ ...s(t as string), [v as string]: 0, [h as string]: 0 }} />)}</div>;
}
function GoldFrame() {
  const s = (t: string): React.CSSProperties => ({ position: 'absolute', width: 65, height: 65, opacity: 0.75, transform: t, pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(197,165,90,0.3))' });
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{[['none', 'top', 'left'], ['scaleX(-1)', 'top', 'right'], ['scaleY(-1)', 'bottom', 'left'], ['scale(-1,-1)', 'bottom', 'right']].map(([t, v, h], i) => <img key={i} src="/corner-gold.svg" alt="" style={{ ...s(t), [v]: 0, [h]: 0 }} />)}</div>;
}
function SilverFrame({ color: c }: { color: string }) {
  const p = [['top-0 left-0', 'M4 24 L4 8 C4 6,6 4,8 4 L24 4', 'M8 4 L4 4 L4 8'], ['top-0 right-0', 'M44 24 L44 8 C44 6,42 4,40 4 L24 4', 'M40 4 L44 4 L44 8'], ['bottom-0 left-0', 'M4 24 L4 40 C4 42,6 44,8 44 L24 44', 'M8 44 L4 44 L4 40'], ['bottom-0 right-0', 'M44 24 L44 40 C44 42,42 44,40 44 L24 44', 'M40 44 L44 44 L44 40']];
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{p.map(([pos, d1, d2], i) => <svg key={i} className={`absolute ${pos} w-12 h-12`} viewBox="0 0 48 48" fill="none"><path d={d1} stroke={c} strokeWidth="1" /><path d={d2} stroke={c} strokeWidth="1.5" /></svg>)}</div>;
}
function BronzeFrame({ color: c }: { color: string }) {
  const p = [['top-0 left-0', 'M4 16 L4 6 C4 5,5 4,6 4 L16 4'], ['top-0 right-0', 'M28 16 L28 6 C28 5,27 4,26 4 L16 4'], ['bottom-0 left-0', 'M4 16 L4 26 C4 27,5 28,6 28 L16 28'], ['bottom-0 right-0', 'M28 16 L28 26 C28 27,27 28,26 28 L16 28']];
  return <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-sa-lg">{p.map(([pos, d], i) => <svg key={i} className={`absolute ${pos} w-8 h-8`} viewBox="0 0 32 32" fill="none"><path d={d} stroke={c} strokeWidth="1" /></svg>)}</div>;
}
function TierFrame({ tier }: { tier: ReportTier }) { const c = TIER_CONFIG[tier]; switch (tier) { case 'diamond': return <DiamondFrame />; case 'gold': return <GoldFrame />; case 'silver': return <SilverFrame color={c.color} />; case 'bronze': return <BronzeFrame color={c.color} />; } }

function ScoreRing({ score, tier, size = 80 }: { score: number; tier: ReportTier; size?: number }) {
  const c = TIER_CONFIG[tier], sw = 3, r = (size - sw * 2) / 2, ci = 2 * Math.PI * r, off = ci - (score / 100) * ci;
  return <div className="relative" style={{ width: size, height: size }}><svg width={size} height={size} className="transform -rotate-90"><circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={sw} fill="none" /><circle cx={size / 2} cy={size / 2} r={r} stroke={c.color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={ci} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-serif text-xl" style={{ color: c.color }}>{score}</span></div></div>;
}
function DeltaBadge({ delta }: { delta?: number }) { if (delta == null) return null; if (delta > 0) return <span className="inline-flex items-center gap-1 text-xs text-sa-green"><TrendingUp className="w-3 h-3" />+{delta}</span>; if (delta < 0) return <span className="inline-flex items-center gap-1 text-xs text-sa-rose"><TrendingDown className="w-3 h-3" />{delta}</span>; return <span className="inline-flex items-center gap-1 text-xs text-sa-cream-faint"><Minus className="w-3 h-3" />0</span>; }
function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) { return <div className="space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs text-sa-cream-muted">{label}</span><span className="text-xs font-medium tabular-nums" style={{ color }}>{score}%</span></div><div className="w-full h-1.5 bg-sa-bg-lift rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${score}%`, backgroundColor: color }} /></div></div>; }

function SystemCard({ report: rp, onClick }: { report: SystemReport; onClick: () => void }) {
  const c = TIER_CONFIG[rp.tier];
  return <button onClick={onClick} className="w-full text-left group relative rounded-sa-lg transition-all duration-200 hover:scale-[1.01]" style={{ border: `1px solid ${c.border}`, backgroundColor: c.bg }}>
    <div className="relative p-5"><div className="flex items-center gap-4"><ScoreRing score={rp.score} tier={rp.tier} size={64} /><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-serif text-base text-sa-cream">{getShortMonthLabel(rp.month)}</span><span className="text-xs text-sa-cream-faint">{getYearLabel(rp.month)}</span>{rp.isInstallationReport && <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.border}` }}>Day 21</span>}</div><div className="flex items-center gap-3"><span className="text-xs font-medium uppercase tracking-wider" style={{ color: c.color }}>{c.label}</span><DeltaBadge delta={rp.scoreDelta} /></div>{rp.scoreCapped && <div className="flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-sa-cream-faint" /><span className="text-[0.65rem] text-sa-cream-faint">Below minimums</span></div>}</div></div></div></button>;
}

function ExpandedReport({ report: rp, onClose }: { report: SystemReport; onClose: () => void }) {
  const c = TIER_CONFIG[rp.tier];
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
    <div className="relative w-full max-w-lg rounded-sa-lg" onClick={e => e.stopPropagation()} style={{ border: `1px solid ${c.border}`, backgroundColor: '#151518', boxShadow: rp.tier === 'diamond' ? '0 0 40px rgba(184,212,232,0.10)' : rp.tier === 'gold' ? '0 0 30px rgba(197,165,90,0.08)' : 'none' }}>
      <TierFrame tier={rp.tier} />
      <div className="max-h-[90vh] overflow-y-auto rounded-sa-lg"><div className="relative z-20 p-8 sm:p-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-sa-cream-faint hover:text-sa-cream transition-colors rounded-sa-sm hover:bg-sa-bg-lift z-30"><X className="w-4 h-4" /></button>
        <div className="text-center mb-8"><p className="text-[0.65rem] uppercase tracking-[0.2em] text-sa-cream-faint mb-3">System Report</p><h2 className="font-serif text-2xl text-sa-cream mb-1">{getMonthLabel(rp.month)}</h2>{rp.isInstallationReport && <p className="text-xs mt-1" style={{ color: c.color }}>Installation Complete — Day 21</p>}<div className="flex justify-center mt-6 mb-3"><ScoreRing score={rp.score} tier={rp.tier} size={100} /></div><div className="flex items-center justify-center gap-3"><span className="text-sm font-medium uppercase tracking-wider" style={{ color: c.color }}>{c.label}</span><DeltaBadge delta={rp.scoreDelta} /></div>{rp.scoreCapped && <div className="flex items-center justify-center gap-1.5 mt-2"><AlertTriangle className="w-3.5 h-3.5 text-sa-cream-faint" /><span className="text-xs text-sa-cream-faint">Score capped — below minimums</span></div>}</div>
        <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }} />
        <div className="space-y-4 mb-8"><p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint">Performance</p><CategoryBar label={`Habits (${rp.habitsCount})`} score={rp.habitsScore} color={c.color} /><CategoryBar label={`Tasks (${rp.tasksAvgPerDay}/day)`} score={rp.tasksScore} color={c.color} /><CategoryBar label={`NNs (${rp.nnCount})`} score={rp.nnScore} color={c.color} /></div>
        <div className="grid grid-cols-2 gap-3 mb-8">{[{ icon: CheckCircle, l: 'Tasks', v: rp.totalTasksCompleted }, { icon: Flame, l: 'Streak', v: `${rp.longestStreak}d` }, { icon: Calendar, l: 'Active', v: `${rp.totalDaysActive}d` }, { icon: Target, l: 'Score', v: rp.score, useC: true }].map(s => { const I = s.icon; return <div key={s.l} className="p-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}><div className="flex items-center gap-1.5 mb-1"><I className="w-3.5 h-3.5" style={{ color: c.color }} /><span className="text-[0.65rem] uppercase tracking-wider text-sa-cream-faint">{s.l}</span></div><span className="font-serif text-xl" style={{ color: (s as any).useC ? c.color : 'var(--cream)' }}>{String(s.v)}</span></div>; })}</div>
        <div className="text-center"><div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }} /><p className="text-[0.65rem] uppercase tracking-[0.15em] text-sa-cream-faint mb-3">Highlight</p><p className="text-sm text-sa-cream-soft italic leading-relaxed">"{rp.personalHighlight}"</p></div>
      </div></div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

export function AchievementsView({
  nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, userId,
  systemReports, onSaveSystemReport,
}: AchievementsViewProps) {
  const [expandedReport, setExpandedReport] = useState<SystemReport | null>(null);
  const [activeSection, setActiveSection] = useState<'milestones' | 'reports'>('milestones');
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  // Milestone computation
  const ctx = useMemo(() => computeCtx(nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports), [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, systemReports]);

  // Strict sequential unlock
  const { unlockedCount, nextIndex } = useMemo(() => {
    let count = 0;
    for (const m of MILESTONES) {
      if (m.check(ctx)) count++;
      else break; // strict: chain breaks at first unmet condition
    }
    return { unlockedCount: count, nextIndex: count < MILESTONES.length ? count : null };
  }, [ctx]);

  const rank = useMemo(() => getRank(unlockedCount), [unlockedCount]);

  // Auto-select next milestone
  useEffect(() => {
    if (selectedMilestone === null) setSelectedMilestone(nextIndex ?? (unlockedCount > 0 ? unlockedCount - 1 : 0));
  }, [nextIndex, unlockedCount]);

  // Report logic
  const currentMonth = useMemo(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; }, []);
  const hasCurrentReport = systemReports.some(r => r.month === currentMonth);

  const autoGenRan = useRef(false);
  useEffect(() => {
    if (autoGenRan.current) return;
    if (systemReports.length === 0 && nonNegotiables.length === 0 && habits.length === 0) return;
    const allDates = [...nnCompletions.map(c => c.completion_date), ...habitCompletions.map(c => c.completion_date), ...dailyTasks.map(t => t.task_date)].filter(Boolean).sort();
    if (allDates.length === 0) return;
    const fm = allDates[0].substring(0, 7);
    const months: string[] = [];
    const [fy, fmo] = fm.split('-').map(Number);
    const [cy, cm] = currentMonth.split('-').map(Number);
    let y = fy, mo = fmo;
    while (y < cy || (y === cy && mo < cm)) { months.push(`${y}-${String(mo).padStart(2, '0')}`); mo++; if (mo > 12) { mo = 1; y++; } }
    const existing = new Set(systemReports.map(r => r.month));
    const missing = months.filter(m => !existing.has(m));
    if (missing.length === 0) { autoGenRan.current = true; return; }
    const sorted = [...systemReports].sort((a, b) => a.month.localeCompare(b.month));
    let prev: SystemReport | null = sorted.length > 0 ? sorted[sorted.length - 1] : null;
    for (const m of missing) {
      const rp = generateMonthlyReport(m, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, prev, userId);
      const had = [...nnCompletions.filter(c => c.completion_date.startsWith(m)), ...habitCompletions.filter(c => c.completion_date.startsWith(m)), ...dailyTasks.filter(t => t.task_date.startsWith(m))].length > 0;
      if (had) { onSaveSystemReport(rp); prev = rp; }
    }
    autoGenRan.current = true;
  }, [systemReports, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, currentMonth, userId, onSaveSystemReport]);

  const handleGenerate = () => {
    const sorted = [...systemReports].sort((a, b) => b.month.localeCompare(a.month));
    const rp = generateMonthlyReport(currentMonth, nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks, sorted[0] || null, userId);
    onSaveSystemReport(rp);
    setExpandedReport(rp);
  };

  const sortedReports = useMemo(() => [...systemReports].sort((a, b) => b.month.localeCompare(a.month)), [systemReports]);
  const stats = useMemo(() => {
    if (systemReports.length === 0) return null;
    return { avg: Math.round(systemReports.reduce((s, r) => s + r.score, 0) / systemReports.length), best: Math.max(...systemReports.map(r => r.score)), goldCount: systemReports.filter(r => r.tier === 'gold' || r.tier === 'diamond').length, total: systemReports.length };
  }, [systemReports]);

  return (
    <div className="pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-sa-gold opacity-80" />
          <h2 className="font-serif text-2xl text-sa-cream">Achievements</h2>
        </div>
        <p className="text-sm text-sa-cream-muted">Your operational history. Milestones earned. Performance recorded.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 animate-rise delay-1">
        {(['milestones', 'reports'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 text-xs font-medium rounded-sa-sm transition-colors ${activeSection === s ? 'text-sa-gold bg-sa-gold-soft' : 'text-sa-cream-muted hover:text-sa-cream-soft'}`}>
            {s === 'milestones' ? 'Milestones' : 'System Reports'}
          </button>
        ))}
      </div>

      {/* ════════ MILESTONES ════════ */}
      {activeSection === 'milestones' && (
        <div className="animate-rise delay-2">
          <RankHeader unlocked={unlockedCount} total={MILESTONES.length} rank={rank} />

          <AdventurePath
            unlockedCount={unlockedCount}
            nextIndex={nextIndex}
            selectedIndex={selectedMilestone}
            onSelect={setSelectedMilestone}
          />

          {selectedMilestone !== null && (
            <MilestoneDetail
              index={selectedMilestone}
              unlocked={selectedMilestone < unlockedCount}
              isNext={selectedMilestone === nextIndex}
            />
          )}

          {unlockedCount === MILESTONES.length && (
            <div className="mt-8 py-8 px-8 text-center rounded-sa-lg" style={{ border: '1px solid rgba(110,203,139,0.3)', backgroundColor: 'rgba(110,203,139,0.06)' }}>
              <Gem className="w-8 h-8 text-sa-green mx-auto mb-3" />
              <p className="font-serif text-xl text-sa-green mb-1">All milestones unlocked.</p>
              <p className="text-sm text-sa-cream-muted">Full Stack rank achieved. Peak operational capacity.</p>
            </div>
          )}
        </div>
      )}

      {/* ════════ REPORTS ════════ */}
      {activeSection === 'reports' && (
        <div className="animate-rise delay-2">
          {systemReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-sa-gold-soft border border-sa-gold-border flex items-center justify-center mb-6"><Trophy className="w-7 h-7 text-sa-gold opacity-70" /></div>
              <h3 className="font-serif text-xl text-sa-cream mb-2">No System Reports Yet</h3>
              <p className="text-sm text-sa-cream-muted max-w-sm mb-6 leading-relaxed">Reports are generated monthly to track operational performance.</p>
              <button onClick={handleGenerate} className="sa-btn-primary">Generate Current Report</button>
            </div>
          ) : (<>
            {stats && <div className="grid grid-cols-4 gap-2 mb-8">{[{ l: 'Reports', v: stats.total }, { l: 'Avg', v: stats.avg }, { l: 'Best', v: stats.best }, { l: 'Gold+', v: stats.goldCount }].map(s => <div key={s.l} className="text-center py-3 rounded-sa" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}><span className="block font-serif text-lg text-sa-cream">{s.v}</span><span className="text-[0.6rem] uppercase tracking-wider text-sa-cream-faint">{s.l}</span></div>)}</div>}
            <div className="mb-6"><button onClick={handleGenerate} className={hasCurrentReport ? 'sa-btn-secondary w-full' : 'sa-btn-primary w-full'}>{hasCurrentReport ? `Update ${getMonthLabel(currentMonth)}` : `Generate ${getMonthLabel(currentMonth)}`}</button></div>
            <div className="space-y-3">{sortedReports.map((r, i) => <div key={r.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}><SystemCard report={r} onClick={() => setExpandedReport(r)} /></div>)}</div>
          </>)}
        </div>
      )}

      {expandedReport && <ExpandedReport report={expandedReport} onClose={() => setExpandedReport(null)} />}
    </div>
  );
}
