import React, { useState, useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Pencil } from 'lucide-react';
import { Habit, HabitCompletion, DailyTask, NonNegotiable, NonNegotiableCompletion } from '../types';
import { fmtDateISO, uid } from '../utils/dateUtils';

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
  nonNegotiables,
  nnCompletions,
  onToggleNN,
  habits,
  habitCompletions,
  onToggleHabit,
  dailyTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TodayViewProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // ── Date logic ──
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // ── Data for selected date ──
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

  // ── Stats ──
  const totalItems = nnForDate.length + habitsWithStatus.length + tasksForDate.length;
  const completedItems =
    nnForDate.filter((n) => n.completed).length +
    habitsWithStatus.filter((h) => h.completed).length +
    tasksForDate.filter((t) => t.completed).length;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // ── Add task handler ──
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      id: uid(),
      title: newTaskTitle.trim(),
      task_date: dateStr,
      time: newTaskTime || undefined,
      completed: false,
      created_at: new Date().toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskTime('');
    setShowAddTask(false);
  };

  // ── Shared item row component ──
  const ItemRow = ({
    completed,
    onToggle,
    title,
    subtitle,
    onDelete,
  }: {
    completed: boolean;
    onToggle: () => void;
    title: string;
    subtitle?: string;
    onDelete?: () => void;
  }) => (
    <div
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-sa border transition-all duration-150 ${
        completed
          ? 'bg-sa-green-soft border-sa-green-border'
          : 'bg-sa-bg-warm border-sa-border hover:border-sa-border-light'
      }`}
    >
      <button
        onClick={onToggle}
        className={`sa-check ${completed ? 'sa-check-done' : 'sa-check-undone'}`}
      >
        {completed && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${completed ? 'text-sa-cream-muted' : 'text-sa-cream'}`}>
          {title}
        </span>
        {subtitle && (
          <span className="ml-2 text-xs text-sa-cream-faint">{subtitle}</span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 text-sa-cream-faint opacity-0 group-hover:opacity-100 hover:text-sa-rose transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  // ── Section header component ──
  const SectionHeader = ({
    label,
    color,
    count,
    completedCount,
    action,
  }: {
    label: string;
    color: string;
    count: number;
    completedCount: number;
    action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <h2 className="sa-section-subtitle">{label}</h2>
        <span className="text-xs text-sa-cream-faint">
          {completedCount}/{count}
        </span>
      </div>
      {action}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Date Navigation ── */}
      <div className="flex items-center justify-between mb-8 animate-rise">
        <button
          onClick={() => setDayOffset((p) => p - 1)}
          className="sa-btn-ghost p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-serif text-2xl sm:text-3xl text-sa-cream">
            {dateLabel}
          </h1>
          <p className="text-xs text-sa-cream-muted mt-1">{dateDisplay}</p>
        </div>

        <button
          onClick={() => setDayOffset((p) => p + 1)}
          className="sa-btn-ghost p-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Progress Ring ── */}
      {totalItems > 0 && (
        <div className="flex justify-center mb-10 animate-rise delay-1">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="var(--border)"
                strokeWidth="4"
              />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={percentage === 100 ? 'var(--green)' : 'var(--gold)'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - percentage / 100)}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-medium ${percentage === 100 ? 'text-sa-green' : 'text-sa-cream'}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Non-Negotiables ── */}
      {nnForDate.length > 0 && (
        <section className="mb-8 animate-rise delay-2">
          <SectionHeader
            label="Non-Negotiables"
            color="bg-sa-gold"
            count={nnForDate.length}
            completedCount={nnForDate.filter(n => n.completed).length}
          />
          <div className="space-y-2">
            {nnForDate.map((nn) => (
              <ItemRow
                key={nn.id}
                completed={nn.completed}
                onToggle={() => onToggleNN(nn, dateStr)}
                title={nn.title}
                subtitle={nn.description}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Keystone Habits ── */}
      {habitsWithStatus.length > 0 && (
        <section className="mb-8 animate-rise delay-3">
          <SectionHeader
            label="Keystone Habits"
            color="bg-sa-blue"
            count={habitsWithStatus.length}
            completedCount={habitsWithStatus.filter(h => h.completed).length}
          />
          <div className="space-y-2">
            {habitsWithStatus.map((habit) => (
              <ItemRow
                key={habit.id}
                completed={habit.completed}
                onToggle={() => onToggleHabit(habit, dateStr)}
                title={habit.name}
                subtitle={habit.time || undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Daily Tasks ── */}
      <section className="mb-8 animate-rise delay-4">
        <SectionHeader
          label="Tasks"
          color="bg-sa-cream-faint"
          count={tasksForDate.length}
          completedCount={tasksForDate.filter(t => t.completed).length}
          action={
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1 text-xs text-sa-cream-faint hover:text-sa-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          }
        />

        {/* Add task inline form */}
        {showAddTask && (
          <div className="mb-3 sa-card animate-rise">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="What needs to be done?"
                autoFocus
                className="flex-1 bg-transparent text-sm text-sa-cream placeholder:text-sa-cream-faint border-none outline-none"
              />
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-24 bg-transparent text-xs text-sa-cream-muted border border-sa-border-light rounded-sa-sm px-2 py-1.5"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-sa-border">
              <button
                onClick={() => { setShowAddTask(false); setNewTaskTitle(''); setNewTaskTime(''); }}
                className="sa-btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="sa-btn-primary text-xs disabled:opacity-30"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {tasksForDate.map((task) => (
            <ItemRow
              key={task.id}
              completed={task.completed}
              onToggle={() => onToggleTask(task.id)}
              title={task.title}
              subtitle={task.time || undefined}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}

          {tasksForDate.length === 0 && !showAddTask && (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full py-5 border border-dashed border-sa-border-light rounded-sa text-sa-cream-faint text-sm hover:border-sa-gold-border hover:text-sa-cream-muted transition-all"
            >
              {isTomorrow ? "Plan tomorrow's tasks" : 'Add a task'}
            </button>
          )}
        </div>
      </section>

      {/* ── Plan Tomorrow Prompt ── */}
      {isToday && isEvening && dayOffset === 0 && (
        <div className="mb-8 animate-rise delay-5">
          <button
            onClick={() => setDayOffset(1)}
            className="w-full py-4 px-5 sa-card border-sa-gold-border hover:bg-sa-gold-soft transition-all text-center"
          >
            <p className="text-sa-gold text-sm font-medium">Plan Tomorrow</p>
            <p className="text-sa-cream-faint text-xs mt-1">
              Set up tomorrow's tasks before you close out the day.
            </p>
          </button>
        </div>
      )}

      {/* ── Completion message ── */}
      {totalItems > 0 && percentage === 100 && (
        <div className="mt-2 py-5 px-6 bg-sa-green-soft border border-sa-green-border rounded-sa text-center animate-rise">
          <p className="text-sa-green text-sm font-medium">System executed.</p>
          <p className="text-sa-cream-muted text-xs mt-1">
            All items completed for {dateLabel.toLowerCase()}.
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalItems === 0 && !showAddTask && (
        <div className="text-center py-16 animate-rise delay-2">
          <p className="text-sa-cream-muted text-sm">No items configured yet.</p>
          <p className="text-sa-cream-faint text-xs mt-2">
            Complete the Installation to set up your non-negotiables and habits.
          </p>
        </div>
      )}
    </div>
  );
}
