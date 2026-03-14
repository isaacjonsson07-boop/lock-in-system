import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Power, Flame, Activity } from 'lucide-react';
import { Habit, HabitCompletion, DailyTask, NonNegotiable, NonNegotiableCompletion } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

function DirectionFrame({ direction, identity }: { direction: string; identity: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Slower on mobile (< 768px)
    const isMobile = window.innerWidth < 768;
    const speed = isMobile ? 35 : 55;

    function measure() {
      if (!container) return;
      const r = container.getBoundingClientRect();
      dimsRef.current = { w: r.width, h: r.height };
    }
    measure();
    window.addEventListener('resize', measure);

    function animate() {
      const { w, h } = dimsRef.current;
      if (!w || !h) { animRef.current = requestAnimationFrame(animate); return; }

      const perimeter = 2 * w + 2 * h;
      const now = performance.now() / 1000;

      [line1Ref, line2Ref].forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;

        const dist = ((now * speed) + (i * perimeter / 2)) % perimeter;
        let tx = 0, ty = 0, sw = 92, sh = 2;

        if (dist < w) {
          tx = dist - 46; ty = -1; sw = 92; sh = 2;
        } else if (dist < w + h) {
          const d = dist - w;
          tx = w - 1; ty = d - 46; sw = 2; sh = 92;
        } else if (dist < 2 * w + h) {
          const d = dist - w - h;
          tx = w - d - 46; ty = h - 1; sw = 92; sh = 2;
        } else {
          const d = dist - 2 * w - h;
          tx = -1; ty = h - d - 46; sw = 2; sh = 92;
        }

        el.style.transform = `translate(${tx}px, ${ty}px)`;
        el.style.width = `${sw}px`;
        el.style.height = `${sh}px`;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative mb-14 text-center py-10 px-8 overflow-hidden">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-sa-gold/25 z-10" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-sa-gold/25 z-10" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-sa-gold/25 z-10" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-sa-gold/25 z-10" />

      {/* Travelling glows — clip-path masks out corner zones to prevent jump artifacts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{
        clipPath: `polygon(
          33.3px -2px, calc(100% - 33.3px) -2px,
          calc(100% - 33.3px) -2px, calc(100% + 2px) 33.3px,
          calc(100% + 2px) 33.3px, calc(100% + 2px) calc(100% - 33.3px),
          calc(100% + 2px) calc(100% - 33.3px), calc(100% - 33.3px) calc(100% + 2px),
          calc(100% - 33.3px) calc(100% + 2px), 33.3px calc(100% + 2px),
          33.3px calc(100% + 2px), -2px calc(100% - 33.3px),
          -2px calc(100% - 33.3px), -2px 33.3px,
          -2px 33.3px, 33.3px -2px
        )`
      }}>
        <div ref={line1Ref} className="absolute top-0 left-0 will-change-transform" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(197,165,90,0.4) 0%, transparent 70%)' }} />
        <div ref={line2Ref} className="absolute top-0 left-0 will-change-transform" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(197,165,90,0.4) 0%, transparent 70%)' }} />
      </div>

      {direction && (
        <p className="relative z-10 font-serif text-[1.85rem] font-light leading-[1.45] text-sa-cream tracking-[-0.01em]">
          {direction}
        </p>
      )}
      {identity && (
        <p className="relative z-10 font-serif text-[1.05rem] italic font-light text-sa-gold mt-5 leading-relaxed">
          "{identity}"
        </p>
      )}
    </div>
  );
}

interface TodayViewProps {
  nonNegotiables: NonNegotiable[];
  nnCompletions: NonNegotiableCompletion[];
  onToggleNN: (nn: NonNegotiable, date: string) => void;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  onToggleHabit: (habit: Habit, date: string) => void;
  dailyTasks: DailyTask[];
  onAddTask: (task: DailyTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TodayView({
  nonNegotiables, nnCompletions, onToggleNN,
  habits, habitCompletions, onToggleHabit,
  dailyTasks, onAddTask, onToggleTask, onDeleteTask,
}: TodayViewProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const dateStr = fmtDateISO(selectedDate);
  const isToday = dayOffset === 0;
  const isTomorrow = dayOffset === 1;
  const jsDayIndex = selectedDate.getDay();
  const isEvening = new Date().getHours() >= 18;

  const dateLabel = useMemo(() => {
    if (dayOffset === 0) return 'Today';
    if (dayOffset === 1) return 'Tomorrow';
    if (dayOffset === -1) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  }, [dayOffset, selectedDate]);

  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // ── Data ──
  const activeNNs = nonNegotiables.filter((nn) => nn.active);
  const nnForDate = activeNNs.map((nn) => ({
    ...nn,
    completed: nnCompletions.some(
      (c) => c.non_negotiable_id === nn.id && c.completion_date === dateStr
    ),
  }));

  const habitsForDay = habits.filter((h) => h.days_of_week.includes(jsDayIndex));
  const habitsWithStatus = habitsForDay.map((h) => ({
    ...h,
    completed: habitCompletions.some(
      (c) => c.habit_id === h.id && c.completion_date === dateStr
    ),
  }));

  const tasksForDate = dailyTasks.filter((t) => t.task_date === dateStr);

  const totalItems = nnForDate.length + habitsWithStatus.length + tasksForDate.length;
  const completedItems =
    nnForDate.filter((n) => n.completed).length +
    habitsWithStatus.filter((h) => h.completed).length +
    tasksForDate.filter((t) => t.completed).length;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // ── System docs ──
  const systemDocs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sa_system_documents') || '{}'); }
    catch { return {}; }
  }, []);
  const direction = systemDocs.direction?.trim() || '';
  const identity = systemDocs.identity?.trim() || '';

  // ── System age ──
  const systemAge = useMemo(() => {
    try {
      const completions = JSON.parse(localStorage.getItem('sa_nn_completions') || '[]');
      const journal = JSON.parse(localStorage.getItem('sa_journal_entries') || '[]');
      const dates: string[] = [
        ...completions.map((c: any) => c.completion_date || c.created_at),
        ...journal.map((j: any) => j.created_at || j.date),
      ].filter(Boolean);
      if (dates.length === 0) return 0;
      const earliest = dates.sort()[0];
      return Math.max(1, Math.floor((Date.now() - new Date(earliest).getTime()) / 86400000));
    } catch { return 0; }
  }, []);

  // ── Weekly consistency ──
  const weekConsistency = useMemo(() => {
    let totalPossible = 0, totalDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = fmtDateISO(d);
      const di = d.getDay();
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const nns = activeNNs.filter(nn => new Date(nn.created_at) <= dayStart);
      const nnD = nns.filter(nn => nnCompletions.some(c => c.non_negotiable_id === nn.id && c.completion_date === ds)).length;
      const hDay = habits.filter(h => h.days_of_week.includes(di) && new Date(h.created_at) <= dayStart);
      const hD = hDay.filter(h => habitCompletions.some(c => c.habit_id === h.id && c.completion_date === ds)).length;
      totalPossible += nns.length + hDay.length;
      totalDone += nnD + hD;
    }
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  }, [nonNegotiables, nnCompletions, habits, habitCompletions]);

  // ── Current streak (consecutive days at 80%+) ──
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(today.getDate() - i);
      const ds = fmtDateISO(d);
      const di = d.getDay();
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const nns = activeNNs.filter(nn => new Date(nn.created_at) <= dayStart);
      const nnD = nns.filter(nn => nnCompletions.some(c => c.non_negotiable_id === nn.id && c.completion_date === ds)).length;
      const hDay = habits.filter(h => h.days_of_week.includes(di) && new Date(h.created_at) <= dayStart);
      const hD = hDay.filter(h => habitCompletions.some(c => c.habit_id === h.id && c.completion_date === ds)).length;
      const tDay = dailyTasks.filter(t => t.task_date === ds);
      const tD = tDay.filter(t => t.completed).length;
      const total = nns.length + hDay.length + tDay.length;
      const done = nnD + hD + tD;
      if (total === 0) { if (i === 0) continue; else break; }
      const pct = Math.round((done / total) * 100);
      if (pct >= 80) streak++;
      else { if (i > 0) break; }
    }
    return streak;
  }, [nonNegotiables, nnCompletions, habits, habitCompletions, dailyTasks]);

  const nextReviewDay = useMemo(() => {
    const dow = new Date().getDay();
    const d = dow === 0 ? 0 : 7 - dow;
    return d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : new Date(Date.now() + d * 86400000).toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({ id: uid(), title: newTaskTitle.trim(), task_date: dateStr, time: newTaskTime || undefined, completed: false, created_at: new Date().toISOString() });
    setNewTaskTitle(''); setNewTaskTime(''); setShowAddTask(false);
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* ════ DIRECTION & IDENTITY ════ */}
      {(direction || identity) && (
        <DirectionFrame direction={direction} identity={identity} />
      )}

      {/* ════ DATE NAV ════ */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => setDayOffset(p => p - 1)}
          className="w-10 h-10 rounded-full border border-sa-border flex items-center justify-center text-sa-cream-muted hover:border-sa-gold-border hover:text-sa-gold hover:bg-sa-gold-glow transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-[2.8rem] font-normal text-sa-cream tracking-[-0.02em]">{dateLabel}</h2>
          <p className="text-[0.8rem] text-sa-cream-faint mt-1 tracking-wide">{dateDisplay}</p>
        </div>
        <button onClick={() => setDayOffset(p => p + 1)}
          className="w-10 h-10 rounded-full border border-sa-border flex items-center justify-center text-sa-cream-muted hover:border-sa-gold-border hover:text-sa-gold hover:bg-sa-gold-glow transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ════ COMMAND CENTER ════ */}
      {isToday && totalItems > 0 && (() => {
        const nnRemaining = nnForDate.filter(n => !n.completed).length;
        const allNNsDone = nnForDate.length > 0 && nnForDate.every(n => n.completed);
        const habitsRemaining = habitsWithStatus.filter(h => !h.completed).length;
        const tasksRemaining = tasksForDate.filter(t => !t.completed).length;

        // Status message
        let statusColor = '#C5A55A';
        let statusMsg = '';
        if (percentage === 100) {
          statusColor = '#6ECB8B'; statusMsg = 'System complete for today.';
        } else if (percentage >= 80) {
          statusColor = '#6ECB8B'; statusMsg = `${totalItems - completedItems} item${totalItems - completedItems !== 1 ? 's' : ''} remaining. Close it out.`;
        } else if (allNNsDone && (habitsRemaining > 0 || tasksRemaining > 0)) {
          statusMsg = `NNs done. ${habitsRemaining + tasksRemaining} more to go.`;
        } else if (nnRemaining > 0 && percentage > 0) {
          statusColor = '#E07070'; statusMsg = `${nnRemaining} non-negotiable${nnRemaining !== 1 ? 's' : ''} incomplete.`;
        } else if (percentage > 0) {
          statusMsg = `${completedItems}/${totalItems} complete. Keep pushing.`;
        } else {
          statusMsg = `${totalItems} items waiting.`;
        }

        // Score ring color
        const ringColor = percentage >= 80 ? '#6ECB8B' : percentage >= 50 ? '#C5A55A' : percentage > 0 ? '#E07070' : 'rgba(255,255,255,0.1)';
        const ringSize = 52;
        const sw = 3;
        const r = (ringSize - sw * 2) / 2;
        const circ = 2 * Math.PI * r;
        const off = circ - (percentage / 100) * circ;

        return (
          <div className="mb-10">
            {/* Metrics row */}
            <div className="flex items-center justify-between gap-3 mb-4 px-2">
              {/* Daily score ring */}
              <div className="flex items-center gap-3">
                <div className="relative" style={{ width: ringSize, height: ringSize }}>
                  <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                    <circle cx={ringSize/2} cy={ringSize/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={sw} fill="none" />
                    <circle cx={ringSize/2} cy={ringSize/2} r={r} stroke={ringColor} strokeWidth={sw} fill="none"
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
                      style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-lg" style={{ color: ringColor }}>{percentage}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint">Today</p>
                  <p className="text-sm text-sa-cream">{completedItems}/{totalItems}</p>
                </div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Flame className="w-3.5 h-3.5" style={{ color: currentStreak >= 7 ? '#6ECB8B' : currentStreak >= 3 ? '#C5A55A' : 'var(--cream-faint)' }} />
                  <span className="font-serif text-lg text-sa-cream">{currentStreak}</span>
                </div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint">Streak</p>
              </div>

              {/* Week */}
              <div className="text-center">
                <span className="font-serif text-lg block" style={{ color: weekConsistency >= 80 ? '#6ECB8B' : weekConsistency >= 50 ? '#C5A55A' : 'var(--cream-faint)' }}>
                  {weekConsistency}%
                </span>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint">Week</p>
              </div>

              {/* System age */}
              {systemAge > 0 && (
                <div className="text-center">
                  <span className="font-serif text-lg text-sa-cream block">{systemAge}</span>
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] text-sa-cream-faint">Day</p>
                </div>
              )}
            </div>

            {/* Status message */}
            <p className="text-[0.78rem] text-center" style={{ color: statusColor }}>{statusMsg}</p>
          </div>
        );
      })()}

      {/* ════ EMPTY/NO-SYSTEM STATUS ════ */}
      {isToday && totalItems === 0 && (activeNNs.length > 0 || habitsForDay.length > 0) && (() => {
        const hasNNs = activeNNs.length > 0;
        const hasHabits = habitsForDay.length > 0;
        let msg = '';
        if (!hasNNs) msg = 'No non-negotiables set. Add your daily commitments in the System tab.';
        else if (!hasHabits) msg = 'No habits installed for today. Add keystone habits in the System tab.';
        if (!msg) return null;
        return (
          <div className="mb-10 px-5 py-3.5 rounded-sa border flex items-start gap-3" style={{
            borderColor: 'rgba(197,165,90,0.25)', backgroundColor: 'rgba(197,165,90,0.06)',
          }}>
            <span className="text-sm flex-shrink-0 mt-px" style={{ color: '#C5A55A' }}>◆</span>
            <p className="text-[0.82rem] leading-relaxed" style={{ color: '#C5A55A' }}>{msg}</p>
          </div>
        );
      })()}

      {/* ════ NON-NEGOTIABLES — sacred tier ════ */}
      {nnForDate.length > 0 && (
        <section className="mb-11">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-sa-gold" />
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sa-gold">Non-Negotiables</span>
            <span className="text-[0.72rem] text-sa-cream-faint">{nnForDate.filter(n => n.completed).length}/{nnForDate.length}</span>
          </div>
          <div className="space-y-2">
            {nnForDate.map((nn) => (
              <div key={nn.id}
                className={`group relative flex items-center gap-5 px-6 py-5 rounded-xl border-l-[3px] overflow-hidden transition-all duration-200 cursor-pointer ${
                  nn.completed
                    ? 'bg-sa-green-soft border-l-sa-green border border-sa-green-border/50'
                    : 'bg-sa-bg-warm border-l-sa-gold border border-sa-gold-border hover:border-sa-gold-light hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(197,165,90,0.06)]'
                }`}
                onClick={() => onToggleNN(nn, dateStr)}
              >
                {/* Gold glow behind uncompleted items */}
                {!nn.completed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-sa-gold-glow to-transparent pointer-events-none" />
                )}
                <div className={`relative flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                  nn.completed
                    ? 'bg-sa-green border-sa-green'
                    : 'border-sa-gold bg-transparent'
                }`}>
                  {nn.completed && <Check className="w-3.5 h-3.5 text-sa-bg-deep" strokeWidth={3} />}
                </div>
                <div className="relative flex-1 min-w-0">
                  <span className={`text-base font-medium ${nn.completed ? 'text-sa-cream-muted' : 'text-sa-cream'}`}>
                    {nn.title}
                  </span>
                  {nn.description && (
                    <span className="block text-[0.8rem] text-sa-cream-faint mt-0.5">{nn.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════ KEYSTONE HABITS — medium tier ════ */}
      {habitsWithStatus.length > 0 && (
        <section className="mb-11">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-sa-cream-faint/60" />
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sa-cream-muted">Keystone Habits</span>
            <span className="text-[0.72rem] text-sa-cream-faint">{habitsWithStatus.filter(h => h.completed).length}/{habitsWithStatus.length}</span>
          </div>
          <div className="space-y-1.5">
            {habitsWithStatus.map((habit) => (
              <div key={habit.id}
                className={`group flex items-center gap-[18px] px-5 py-4 rounded-[10px] border transition-all duration-200 cursor-pointer ${
                  habit.completed
                    ? 'opacity-50 bg-sa-bg-card border-transparent'
                    : 'bg-sa-bg-card border-[rgba(242,237,228,0.04)] hover:bg-sa-bg-lift hover:border-[rgba(242,237,228,0.08)]'
                }`}
                onClick={() => onToggleHabit(habit, dateStr)}
              >
                <div className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                  habit.completed
                    ? 'bg-sa-green border-sa-green'
                    : 'border-sa-cream-faint bg-transparent'
                }`}>
                  {habit.completed && <Check className="w-3 h-3 text-sa-bg-deep" strokeWidth={3} />}
                </div>
                <span className={`text-[0.92rem] flex-1 ${habit.completed ? 'text-sa-cream-faint line-through' : 'text-sa-cream-soft'}`}>
                  {habit.name}
                </span>
                {habit.time && <span className="text-[0.75rem] text-sa-cream-faint">{habit.time}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════ TASKS — lightest tier ════ */}
      <section className="mb-11">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-px bg-sa-cream-faint/40" />
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sa-cream-faint">Tasks</span>
            <span className="text-[0.72rem] text-sa-cream-faint/60">{tasksForDate.filter(t => t.completed).length}/{tasksForDate.length}</span>
          </div>
          <button onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 text-[0.78rem] text-sa-cream-faint hover:text-sa-gold transition-colors">
            <Plus className="w-3.5 h-3.5" /><span>Add</span>
          </button>
        </div>

        {showAddTask && (
          <div className="mb-4 bg-sa-bg-warm border border-sa-border rounded-xl p-5">
            <div className="flex gap-3 items-center">
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()} placeholder="What needs to be done?"
                autoFocus className="flex-1 bg-transparent text-[0.92rem] text-sa-cream placeholder:text-sa-cream-faint border-none outline-none" />
              <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)}
                className="w-28 bg-transparent text-sm text-sa-cream-muted border border-sa-border-light rounded-lg px-2.5 py-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-sa-border">
              <button onClick={() => { setShowAddTask(false); setNewTaskTitle(''); setNewTaskTime(''); }}
                className="px-4 py-2 text-sm text-sa-cream-muted hover:text-sa-cream transition-colors">Cancel</button>
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim()}
                className="px-4 py-2 text-sm bg-sa-gold text-sa-bg-deep font-medium rounded-lg hover:bg-sa-gold-light transition-colors disabled:opacity-30">
                Add Task
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {tasksForDate.map((task) => (
            <div key={task.id}
              className={`group flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 cursor-pointer ${
                task.completed ? 'opacity-35' : 'hover:bg-[rgba(242,237,228,0.02)]'
              }`}
            >
              <button onClick={() => onToggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                  task.completed ? 'bg-sa-cream-faint border-sa-cream-faint' : 'border-sa-cream-faint/50 bg-transparent'
                }`}>
                {task.completed && <Check className="w-2.5 h-2.5 text-sa-bg-deep" strokeWidth={3} />}
              </button>
              <span className={`text-[0.88rem] flex-1 ${task.completed ? 'text-sa-cream-faint line-through' : 'text-sa-cream-muted'}`}>
                {task.title}
              </span>
              {task.time && <span className="text-[0.75rem] text-sa-cream-faint">{task.time}</span>}
              <button onClick={() => onDeleteTask(task.id)}
                className="p-1 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {tasksForDate.length === 0 && !showAddTask && (
            <button onClick={() => setShowAddTask(true)}
              className="w-full py-[14px] border border-dashed border-sa-cream-faint/30 rounded-lg text-sa-cream-faint text-[0.82rem] hover:border-sa-gold-border hover:text-sa-cream-muted transition-all">
              {isTomorrow ? "Plan tomorrow's tasks" : 'Add a task'}
            </button>
          )}
        </div>
      </section>

      {/* ════ PLAN TOMORROW ════ */}
      {isToday && isEvening && (
        <div className="mb-11">
          <button onClick={() => setDayOffset(1)}
            className="relative w-full py-6 border border-sa-gold-border rounded-xl text-center overflow-hidden transition-all duration-300 hover:border-sa-gold hover:-translate-y-[1px] group">
            <div className="absolute inset-0 bg-gradient-to-br from-sa-gold-glow to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="relative font-serif text-[1.05rem] text-sa-gold">Plan Tomorrow →</p>
            <p className="relative text-[0.78rem] text-sa-cream-faint mt-1.5">Set up before you close out the day.</p>
          </button>
        </div>
      )}

      {/* ════ COMPLETION ════ */}
      {totalItems > 0 && percentage === 100 && (
        <div className="mb-11 py-7 border border-sa-green-border rounded-xl bg-sa-green-soft text-center">
          <p className="font-serif text-xl text-sa-green">System executed.</p>
          <p className="text-[0.8rem] text-sa-cream-muted mt-1.5">All items completed for {dateLabel.toLowerCase()}.</p>
        </div>
      )}

      {/* ════ EMPTY STATE ════ */}
      {totalItems === 0 && !showAddTask && !direction && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full border border-dashed border-sa-gold-border flex items-center justify-center mx-auto mb-5">
            <Power className="w-6 h-6 text-sa-gold opacity-60" />
          </div>
          <p className="font-serif text-2xl text-sa-cream mb-3">System offline.</p>
          <p className="text-sm text-sa-cream-muted max-w-md mx-auto leading-relaxed mb-6">
            No direction, no non-negotiables, no habits installed. Your operating system has nothing to run.
          </p>
          <p className="text-[0.8rem] text-sa-gold">
            Go to Installation → Day 1 to begin.
          </p>
        </div>
      )}
    </div>
  );
}
