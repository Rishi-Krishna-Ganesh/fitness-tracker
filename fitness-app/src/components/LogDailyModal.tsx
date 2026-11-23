'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Scale, Droplets, Moon, FileText } from 'lucide-react';

interface LogDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  initialWeight?: number;
  initialWater?: number;
  initialSleep?: number;
  initialNotes?: string;
  onSaveDaily: (data: {
    weight?: number;
    water: number;
    sleep: number;
    notes?: string;
  }) => void;
}

export const LogDailyModal: React.FC<LogDailyModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  initialWeight,
  initialWater = 0,
  initialSleep = 0,
  initialNotes = '',
  onSaveDaily,
}) => {
  const [weight, setWeight] = useState(initialWeight ? initialWeight.toString() : '');
  const [water, setWater] = useState(initialWater ? initialWater.toString() : '0');
  const [sleep, setSleep] = useState(initialSleep ? initialSleep.toString() : '0');
  const [notes, setNotes] = useState(initialNotes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDaily({
      weight: weight ? Number(weight) : undefined,
      water: Number(water) || 0,
      sleep: Number(sleep) || 0,
      notes: notes.trim(),
    });
    onClose();
  };

  const addWater = (amount: number) => {
    setWater((prev) => (Math.max(0, (Number(prev) || 0) + amount)).toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Daily Metrics (${selectedDate})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Weight */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Morning Weight (kg)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="e.g. 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <Scale className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Water Intake */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-300">Water Intake (ml)</label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => addWater(250)}
                className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => addWater(500)}
                className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition"
              >
                +500ml
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              step="50"
              min="0"
              placeholder="e.g. 2500"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
            <Droplets className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Sleep Hours */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Sleep (Hours)</label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="e.g. 7.5"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <Moon className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Daily Reflection / Mood</label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="How did you feel today? Any soreness or milestones?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
            />
            <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-semibold rounded-xl transition shadow-lg shadow-purple-600/20 text-sm cursor-pointer"
        >
          Save Daily Metrics
        </button>
      </form>
    </Modal>
  );
};
