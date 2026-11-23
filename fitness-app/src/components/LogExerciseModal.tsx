'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Activity, Clock, Flame, Dumbbell } from 'lucide-react';

interface LogExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onAddExercise: (exercise: {
    activityType: string;
    duration: number;
    caloriesBurnt: number;
    intensity: 'Low' | 'Medium' | 'High';
    notes?: string;
  }) => void;
}

export const LogExerciseModal: React.FC<LogExerciseModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onAddExercise,
}) => {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurnt, setCaloriesBurnt] = useState('');
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState('');

  // Quick workout presets
  const presets = [
    { name: 'Running / Jogging', dur: 30, cals: 300, intensity: 'High' as const },
    { name: 'Weightlifting / Gym', dur: 45, cals: 250, intensity: 'Medium' as const },
    { name: 'Brisk Walking', dur: 40, cals: 160, intensity: 'Low' as const },
    { name: 'Cycling', dur: 35, cals: 280, intensity: 'Medium' as const },
    { name: 'HIIT Workout', dur: 25, cals: 260, intensity: 'High' as const },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType.trim() || !duration) return;

    onAddExercise({
      activityType: activityType.trim(),
      duration: Number(duration) || 0,
      caloriesBurnt: Number(caloriesBurnt) || 0,
      intensity,
      notes: notes.trim(),
    });

    setActivityType('');
    setDuration('');
    setCaloriesBurnt('');
    setNotes('');
    onClose();
  };

  const applyPreset = (p: typeof presets[0]) => {
    setActivityType(p.name);
    setDuration(p.dur.toString());
    setCaloriesBurnt(p.cals.toString());
    setIntensity(p.intensity);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Workout & Exercise">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Quick Workout Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition border border-zinc-700/50"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Name */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Activity / Exercise Name *</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Morning Outdoor Run"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Activity className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Duration & Calories burnt */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Duration (mins) *</label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Clock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Est. Calories Burnt</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="e.g. 250"
                value={caloriesBurnt}
                onChange={(e) => setCaloriesBurnt(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Flame className="w-4 h-4 text-orange-500 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Intensity */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Low', 'Medium', 'High'] as const).map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => setIntensity(lvl)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                  intensity === lvl
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Notes / Sets / Distance</label>
          <textarea
            rows={2}
            placeholder="e.g. 5km pace 6:00, felt energetic"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 bg-blue-500 hover:bg-blue-600 active:scale-[0.99] text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/20 text-sm cursor-pointer"
        >
          Add Exercise Log
        </button>
      </form>
    </Modal>
  );
};
