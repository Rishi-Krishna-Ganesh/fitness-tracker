'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Settings as SettingsIcon, Link, Target, Info, CheckCircle2 } from 'lucide-react';
import { UserSettings } from '@/types/fitness';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onTestConnection: (url: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestConnection,
}) => {
  const [calorieTarget, setCalorieTarget] = useState(settings.dailyCalorieTarget.toString());
  const [targetWeight, setTargetWeight] = useState(settings.targetWeight.toString());
  const [waterTarget, setWaterTarget] = useState(settings.dailyWaterTarget.toString());
  const [sleepTarget, setSleepTarget] = useState(settings.dailySleepTarget.toString());
  const [sheetsUrl, setSheetsUrl] = useState(settings.sheetsApiUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      dailyCalorieTarget: Number(calorieTarget) || 2000,
      targetWeight: Number(targetWeight) || 70,
      dailyWaterTarget: Number(waterTarget) || 2500,
      dailySleepTarget: Number(sleepTarget) || 8,
      sheetsApiUrl: sheetsUrl.trim(),
    });
    onClose();
  };

  const handleTest = async () => {
    if (!sheetsUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    const ok = await onTestConnection(sheetsUrl.trim());
    setTestResult(ok ? 'success' : 'failed');
    setTesting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings & Google Sheet Sync">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Google Apps Script Web App URL */}
        <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2">
          <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
            <Link className="w-4 h-4 text-emerald-400" /> Google Apps Script Web App URL
          </label>
          <p className="text-xs text-zinc-400">
            Paste your deployed Web App URL to enable live 2-way sync with your Google Sheet. If left empty, local storage will be used.
          </p>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            value={sheetsUrl}
            onChange={(e) => {
              setSheetsUrl(e.target.value);
              setTestResult(null);
            }}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={!sheetsUrl || testing}
              onClick={handleTest}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium disabled:opacity-50 transition"
            >
              {testing ? 'Testing Connection...' : 'Test Connection'}
            </button>
            {testResult === 'success' && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected!
              </span>
            )}
            {testResult === 'failed' && (
              <span className="text-xs text-rose-400 font-medium">
                Failed to reach Web App. Check URL & permissions.
              </span>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-400" /> Target Goals
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Calorie Target (kcal)</span>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Target Weight (kg)</span>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Daily Water (ml)</span>
              <input
                type="number"
                step="100"
                value={waterTarget}
                onChange={(e) => setWaterTarget(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Daily Sleep (hours)</span>
              <input
                type="number"
                step="0.5"
                value={sleepTarget}
                onChange={(e) => setSleepTarget(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl transition text-sm cursor-pointer"
        >
          Save Settings
        </button>
      </form>
    </Modal>
  );
};
