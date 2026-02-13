import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, BookOpen as Edit3, Save, X } from 'lucide-react';
import { ScheduleItem, Goal } from '../types';
import { fmtDateISO, uid, getWeekDates, getDayKeyFromISO } from '../utils/dateUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { QuickGuide } from './QuickGuide';

interface WeeklyScheduleViewProps {
  scheduleItems: ScheduleItem[];
  goals: Goal[];
  onAddScheduleItem: (item: ScheduleItem) => void;
  onUpdateScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function WeeklyScheduleView({
  scheduleItems,
  goals,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem
}: WeeklyScheduleViewProps) {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [newScheduleItem, setNewScheduleItem] = useState({
    time: '09:00',
    title: '',
    description: '',
    linkedGoalId: '',
    targetNumber: '',
    duration: '',
    distance: '',
    weight: ''
  });
  
  const today = fmtDateISO(new Date());
  const weekDates = useMemo(() => getWeekDates(), []);

  function getCurrentDay() {
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const dayMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return dayMap[adjustedIndex];
  }

  const currentWeekDateSet = useMemo(() => new Set(Object.values(weekDates)), [weekDates]);

  const itemsByDay = useMemo(() => {
    const grouped: { [key: string]: ScheduleItem[] } = {};
    DAYS.forEach(day => { grouped[day.key] = []; });

    scheduleItems.forEach(item => {
      if (item.task_date) {
        if (currentWeekDateSet.has(item.task_date)) {
          const dayKey = getDayKeyFromISO(item.task_date);
          grouped[dayKey]?.push(item);
        }
      } else {
        grouped[item.day]?.push(item);
      }
    });

    DAYS.forEach(day => {
      grouped[day.key].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  }, [scheduleItems, currentWeekDateSet]);

  // Calculate weekly schedule stats
  const weeklyStats = useMemo(() => {
    const totalItems = scheduleItems.length;
    const completedItems = scheduleItems.filter(item => item.completedDates.includes(today)).length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { total: totalItems, completed: completedItems, percentage: completionRate };
  }, [scheduleItems, today]);

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleItem.title.trim()) return;

    let validatedLinkedGoalId = newScheduleItem.linkedGoalId;
    if (newScheduleItem.linkedGoalId) {
      const linkedGoal = goals.find(g => g.id === newScheduleItem.linkedGoalId);
      if (!linkedGoal) {
        alert('The selected goal no longer exists. Please select a different goal or leave it unlinked.');
        return;
      }

      const taskType = newScheduleItem.duration ? 'time' : newScheduleItem.distance ? 'distance' : newScheduleItem.weight ? 'weight' : 'task';
      if (linkedGoal.goalType !== taskType) {
        alert('The selected goal type does not match this task type. Please select a matching goal or leave it unlinked.');
        return;
      }
    }

    const item: ScheduleItem = {
      id: uid(),
      day: selectedDay,
      task_date: weekDates[selectedDay],
      time: newScheduleItem.time,
      title: newScheduleItem.title.trim(),
      description: newScheduleItem.description.trim() || undefined,
      linkedGoalId: validatedLinkedGoalId || undefined,
      targetNumber: newScheduleItem.targetNumber ? parseInt(newScheduleItem.targetNumber) : undefined,
      duration: newScheduleItem.duration.trim() || undefined,
      distance: newScheduleItem.distance.trim() || undefined,
      weight: newScheduleItem.weight?.trim() || undefined,
      completed: false,
      completedDates: [],
      completedCounts: {},
      createdAt: new Date().toISOString()
    };

    onAddScheduleItem(item);
    setNewScheduleItem({ time: '09:00', title: '', description: '', linkedGoalId: '', targetNumber: '', duration: '', distance: '', weight: '' });
    setShowAddScheduleForm(false);
  };

  const handleEditScheduleItem = (item: ScheduleItem) => {
    setEditingScheduleItem(item);
    setNewScheduleItem({
      time: item.time,
      title: item.title,
      description: item.description || '',
      linkedGoalId: item.linkedGoalId || '',
      targetNumber: item.targetNumber?.toString() || '',
      duration: item.duration || '',
      distance: item.distance || '',
      weight: item.weight || ''
    });
    setSelectedDay(item.day);
    setShowAddScheduleForm(true);
  };

  const handleUpdateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleItem || !newScheduleItem.title.trim()) return;

    let validatedLinkedGoalId = newScheduleItem.linkedGoalId;
    if (newScheduleItem.linkedGoalId) {
      const linkedGoal = goals.find(g => g.id === newScheduleItem.linkedGoalId);
      if (!linkedGoal) {
        alert('The selected goal no longer exists. Please select a different goal or leave it unlinked.');
        return;
      }

      const taskType = newScheduleItem.duration ? 'time' : newScheduleItem.distance ? 'distance' : newScheduleItem.weight ? 'weight' : 'task';
      if (linkedGoal.goalType !== taskType) {
        alert('The selected goal type does not match this task type. Please select a matching goal or leave it unlinked.');
        return;
      }
    }

    const updatedItem: ScheduleItem = {
      ...editingScheduleItem,
      day: selectedDay,
      task_date: weekDates[selectedDay],
      time: newScheduleItem.time,
      title: newScheduleItem.title.trim(),
      description: newScheduleItem.description.trim() || undefined,
      linkedGoalId: validatedLinkedGoalId || undefined,
      targetNumber: newScheduleItem.targetNumber ? parseInt(newScheduleItem.targetNumber) : undefined,
      duration: newScheduleItem.duration.trim() || undefined,
      distance: newScheduleItem.distance.trim() || undefined,
      weight: newScheduleItem.weight?.trim() || undefined
    };

    onUpdateScheduleItem(updatedItem);
    setEditingScheduleItem(null);
    setNewScheduleItem({ time: '09:00', title: '', description: '', linkedGoalId: '', targetNumber: '', duration: '', distance: '', weight: '' });
    setShowAddScheduleForm(false);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setDeletingItemId(id);
  };

  const handleCancelScheduleEdit = () => {
    setEditingScheduleItem(null);
    setNewScheduleItem({ time: '09:00', title: '', description: '', linkedGoalId: '', targetNumber: '', duration: '', distance: '', weight: '' });
    setShowAddScheduleForm(false);
  };

  const currentDay = getCurrentDay();

  return (
    <div className="space-y-6">
      {/* Weekly Schedule Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Schedule Management
          </h3>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyStats.total}
            </div>
          </div>
        </div>

        {/* Add Schedule Item Button */}
        <button
          onClick={() => {
            if (showAddScheduleForm) {
              handleCancelScheduleEdit();
            } else {
              setShowAddScheduleForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddScheduleForm ? (editingScheduleItem ? 'Cancel Edit' : 'Cancel') : 'Add Task to Schedule'}
        </button>

        {/* Add/Edit Schedule Form */}
        {showAddScheduleForm && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              {editingScheduleItem ? 'Edit Task' : `Add Task for ${DAYS.find(d => d.key === selectedDay)?.label}`}
            </h4>
            
            <form onSubmit={editingScheduleItem ? handleUpdateScheduleItem : handleAddScheduleItem} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newScheduleItem.time}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={newScheduleItem.title}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                    placeholder="e.g., Morning workout, Team meeting"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS.map(day => (
                      <option key={day.key} value={day.key}>{day.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  value={newScheduleItem.description}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Goal (optional)</label>
                  <select
                    value={newScheduleItem.linkedGoalId}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, linkedGoalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Goal</option>
                    {goals.filter(goal => {
                      if (newScheduleItem.duration) return goal.goalType === 'time';
                      if (newScheduleItem.distance) return goal.goalType === 'distance';
                      if (newScheduleItem.weight) return goal.goalType === 'weight';
                      if (newScheduleItem.targetNumber) return goal.goalType === 'task';
                      return true;
                    }).map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} ({goal.currentAmount}/{goal.targetAmount} {goal.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count/Reps (optional)</label>
                  <input
                    type="number"
                    value={newScheduleItem.targetNumber}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, targetNumber: e.target.value })}
                    placeholder="e.g., 5 for 5 games"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (optional)</label>
                  <input
                    type="text"
                    value={newScheduleItem.duration}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, duration: e.target.value })}
                    placeholder="e.g., 30min, 1h 30m"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance (optional)</label>
                  <input
                    type="text"
                    value={newScheduleItem.distance}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, distance: e.target.value })}
                    placeholder="e.g., 5km, 3 miles"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight in kg (optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newScheduleItem.weight}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, weight: e.target.value })}
                    placeholder="e.g., 72.5, 100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {editingScheduleItem ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingScheduleItem ? 'Update Task' : 'Add Task'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelScheduleEdit}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* All Days Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {DAYS.map(day => (
            <div key={day.key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 transition-all border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {day.label}
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 font-normal">
                    {new Date(weekDates[day.key] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {day.key === currentDay && <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Today)</span>}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {itemsByDay[day.key].length}
                </span>
              </div>
              
              {itemsByDay[day.key].length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">No tasks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {itemsByDay[day.key].map(item => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">
                              {item.time}
                            </span>
                            <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                              {item.title}
                            </p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={() => handleEditScheduleItem(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Edit task"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteScheduleItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {scheduleItems.length === 0 && (
        <QuickGuide
          title="Quick Guide"
          tips={[
            'Schedule tasks for specific days and times',
            'View and manage your entire week at a glance',
            'Switch to "Today\'s Tasks" for daily focus'
          ]}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deletingItemId !== null}
        itemType="task"
        onConfirm={() => {
          if (deletingItemId) {
            onDeleteScheduleItem(deletingItemId);
            setDeletingItemId(null);
          }
        }}
        onCancel={() => setDeletingItemId(null)}
      />
    </div>
  );
}