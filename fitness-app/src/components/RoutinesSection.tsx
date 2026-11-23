'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { RoutineItem } from '@/types/fitness';

interface RoutinesSectionProps {
  selectedDate: string;
  routines: RoutineItem[];
  onToggleRoutine: (id: string, completed: boolean) => void;
  onAddRoutine: (routineName: string, targetValue?: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export const RoutinesSection: React.FC<RoutinesSectionProps> = ({
  selectedDate,
  routines,
  onToggleRoutine,
  onAddRoutine,
  onDeleteRoutine,
}) => {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const dateRoutines = routines.filter((r) => r.date === selectedDate);
  const completedCount = dateRoutines.filter((r) => r.completed).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    onAddRoutine(newRoutineName.trim(), newTarget.trim());
    setNewRoutineName('');
    setNewTarget('');
    setShowAdd(false);
  };

  const defaultTemplates = [
    { name: '10,000 Steps Walk', target: '10,000 steps' },
    { name: 'Morning Stretching / Yoga', target: '15 mins' },
    { name: 'Take Multivitamins / Creatine', target: '1 dose' },
    { name: 'No Sugar / Junk Food', target: 'Clean eating' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Daily Routines & Habits
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {completedCount} of {dateRoutines.length} completed today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
        >
          <Plus className="w-4 h-4" /> Add Routine
        </button>
      </div>

      {/* Progress Bar */}
      {dateRoutines.length > 0 && (
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / dateRoutines.length) * 100}%` }}
          />
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleCreate} className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Routine name (e.g. 10k Steps)"
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Target (e.g. 15 mins, 1x)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {defaultTemplates.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setNewRoutineName(item.name);
                  setNewTarget(item.target);
                }}
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-300 hover:bg-zinc-700 transition"
              >
                + {item.name}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs px-2.5 py-1 text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-lg transition"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Routine List */}
      <div className="space-y-2">
        {dateRoutines.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No routines logged for this day. Click 'Add Routine' to start tracking daily habits!
          </div>
        ) : (
          dateRoutines.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                r.completed
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-zinc-300'
                  : 'bg-zinc-800/40 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleRoutine(r.id, !r.completed)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                    r.completed
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                      : 'border-zinc-700 hover:border-zinc-500 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      r.completed ? 'line-through text-zinc-400' : 'text-zinc-200'
                    }`}
                  >
                    {r.routineName}
                  </p>
                  {r.targetValue && (
                    <span className="text-[11px] text-zinc-500">Target: {r.targetValue}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDeleteRoutine(r.id)}
                className="text-zinc-500 hover:text-rose-400 p-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
