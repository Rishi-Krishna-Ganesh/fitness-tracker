'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Scale,
  Dumbbell,
  Droplets,
  Moon,
  Plus,
  Settings as SettingsIcon,
  RefreshCw,
  Calendar,
  Utensils,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  FoodLog,
  ExerciseLog,
  RoutineItem,
  DailySummary,
  UserSettings,
} from '@/types/fitness';
import {
  STORAGE_KEYS,
  defaultSettings,
  getTodayDateString,
  normalizeDateString,
  loadFromLocal,
  saveToLocal,
  SheetsService,
} from '@/services/storageService';

import { LogFoodModal } from '@/components/LogFoodModal';
import { LogExerciseModal } from '@/components/LogExerciseModal';
import { LogDailyModal } from '@/components/LogDailyModal';
import { SettingsModal } from '@/components/SettingsModal';
import { RoutinesSection } from '@/components/RoutinesSection';
import { ChartsOverview } from '@/components/ChartsOverview';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-24');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  
  // Modals state
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [todayString, setTodayString] = useState<string>('');

  // Initialize data on mount
  useEffect(() => {
    const today = getTodayDateString();
    setTodayString(today);
    setSelectedDate(today);

    const loadedSettings = loadFromLocal<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    const loadedFood = loadFromLocal<FoodLog[]>(STORAGE_KEYS.FOOD, []);
    const loadedExercise = loadFromLocal<ExerciseLog[]>(STORAGE_KEYS.EXERCISE, []);
    const loadedRoutines = loadFromLocal<RoutineItem[]>(STORAGE_KEYS.ROUTINES, []);
    const loadedDaily = loadFromLocal<DailySummary[]>(STORAGE_KEYS.DAILY, []);

    setSettings(loadedSettings);
    setFoodLogs(loadedFood);
    setExerciseLogs(loadedExercise);
    setRoutines(loadedRoutines);
    setDailySummaries(loadedDaily);

    // Initial sync if sheets API URL configured
    if (loadedSettings.sheetsApiUrl) {
      handleRemoteSync(loadedSettings.sheetsApiUrl);
    }
  }, []);

  // Save changes locally
  useEffect(() => {
    saveToLocal(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToLocal(STORAGE_KEYS.FOOD, foodLogs);
  }, [foodLogs]);

  useEffect(() => {
    saveToLocal(STORAGE_KEYS.EXERCISE, exerciseLogs);
  }, [exerciseLogs]);

  useEffect(() => {
    saveToLocal(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);

  useEffect(() => {
    saveToLocal(STORAGE_KEYS.DAILY, dailySummaries);
  }, [dailySummaries]);

  // Derived current day metrics
  const todayFood = foodLogs.filter((f) => f.date === selectedDate);
  const todayExercise = exerciseLogs.filter((e) => e.date === selectedDate);
  const currentDaily = dailySummaries.find((d) => d.date === selectedDate) || {
    date: selectedDate,
    caloriesIn: 0,
    caloriesOut: 0,
    netCalories: 0,
    water: 0,
    sleep: 0,
  };

  const caloriesIn = todayFood.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const caloriesOut = todayExercise.reduce((acc, curr) => acc + (curr.caloriesBurnt || 0), 0);
  const netCalories = caloriesIn - caloriesOut;

  const totalProtein = todayFood.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const totalCarbs = todayFood.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  const totalFat = todayFood.reduce((acc, curr) => acc + (curr.fat || 0), 0);

  // Sync with Sheets
  const handleRemoteSync = async (apiUrl?: string) => {
    setSyncing(true);
    setSyncMessage('Syncing with Google Sheets...');
    try {
      const data = await SheetsService.fetchAllData(apiUrl || settings.sheetsApiUrl);
      if (data) {
        if (data.food && Array.isArray(data.food)) {
          const mappedFood: FoodLog[] = data.food.map((f: any) => ({
            id: f.id || Math.random().toString(),
            date: normalizeDateString(f.date),
            mealType: f.meal_type || 'Snack',
            foodItem: f.food_item || '',
            calories: Number(f.calories) || 0,
            protein: Number(f.protein__g_) || Number(f.protein) || 0,
            carbs: Number(f.carbs__g_) || Number(f.carbs) || 0,
            fat: Number(f.fat__g_) || Number(f.fat) || 0,
            loggedAt: f.logged_at,
          }));
          setFoodLogs(mappedFood);
        }

        if (data.exercise && Array.isArray(data.exercise)) {
          const mappedExercise: ExerciseLog[] = data.exercise.map((e: any) => ({
            id: e.id || Math.random().toString(),
            date: normalizeDateString(e.date),
            activityType: e.activity_type || 'Workout',
            duration: Number(e.duration__mins_) || Number(e.duration) || 0,
            caloriesBurnt: Number(e.calories_burnt) || 0,
            intensity: e.intensity || 'Medium',
            notes: e.notes || '',
            loggedAt: e.logged_at,
          }));
          setExerciseLogs(mappedExercise);
        }

        if (data.daily && Array.isArray(data.daily)) {
          const mappedDaily: DailySummary[] = data.daily.map((d: any) => ({
            date: normalizeDateString(d.date),
            weight: d.weight__kg_ ? Number(d.weight__kg_) : undefined,
            targetWeight: d.target_weight__kg_ ? Number(d.target_weight__kg_) : undefined,
            caloriesIn: Number(d.calories_in) || 0,
            caloriesOut: Number(d.calories_out) || 0,
            netCalories: Number(d.net_calories) || 0,
            water: Number(d.water__ml_) || 0,
            sleep: Number(d.sleep__hrs_) || 0,
            notes: d.notes || '',
          }));
          setDailySummaries(mappedDaily);
        }

        if (data.routines && Array.isArray(data.routines)) {
          const mappedRoutines: RoutineItem[] = data.routines.map((r: any) => ({
            id: r.id || Math.random().toString(),
            date: normalizeDateString(r.date),
            routineName: r.routine_name || '',
            completed: String(r.completed).toUpperCase() === 'YES' || r.completed === true,
            targetValue: r.target_value || '',
            actualValue: r.actual_value || '',
            notes: r.notes || '',
          }));
          setRoutines(mappedRoutines);
        }

        setSyncMessage('Synced successfully with Google Sheet!');
      } else {
        setSyncMessage('Running in local mode (Google Sheet URL optional)');
      }
    } catch (err) {
      console.error(err);
      setSyncMessage('Could not reach Google Sheets. Local data active.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3500);
    }
  };

  // Add Food
  const handleAddFood = (food: Omit<FoodLog, 'id' | 'date'>) => {
    const newLog: FoodLog = {
      ...food,
      id: 'f_' + Date.now(),
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };
    const updated = [newLog, ...foodLogs];
    setFoodLogs(updated);

    // Sync remote
    SheetsService.postAction('logFood', newLog);
    updateDailySummaryRecord({
      caloriesIn: caloriesIn + newLog.calories,
      caloriesOut,
    });
  };

  // Add Exercise
  const handleAddExercise = (exercise: Omit<ExerciseLog, 'id' | 'date'>) => {
    const newLog: ExerciseLog = {
      ...exercise,
      id: 'e_' + Date.now(),
      date: selectedDate,
      loggedAt: new Date().toISOString(),
    };
    const updated = [newLog, ...exerciseLogs];
    setExerciseLogs(updated);

    SheetsService.postAction('logExercise', newLog);
    updateDailySummaryRecord({
      caloriesIn,
      caloriesOut: caloriesOut + newLog.caloriesBurnt,
    });
  };

  // Save Daily metrics
  const handleSaveDaily = (data: { weight?: number; water: number; sleep: number; notes?: string }) => {
    updateDailySummaryRecord({
      weight: data.weight,
      water: data.water,
      sleep: data.sleep,
      notes: data.notes,
    });

    SheetsService.postAction('logDaily', {
      date: selectedDate,
      weight: data.weight,
      targetWeight: settings.targetWeight,
      caloriesIn,
      caloriesOut,
      water: data.water,
      sleep: data.sleep,
      notes: data.notes,
    });
  };

  const updateDailySummaryRecord = (delta: Partial<DailySummary>) => {
    setDailySummaries((prev) => {
      const idx = prev.findIndex((d) => d.date === selectedDate);
      if (idx >= 0) {
        const item = { ...prev[idx], ...delta };
        item.netCalories = (item.caloriesIn || 0) - (item.caloriesOut || 0);
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      } else {
        const newItem: DailySummary = {
          date: selectedDate,
          caloriesIn: delta.caloriesIn || caloriesIn,
          caloriesOut: delta.caloriesOut || caloriesOut,
          netCalories: (delta.caloriesIn || caloriesIn) - (delta.caloriesOut || caloriesOut),
          water: delta.water || 0,
          sleep: delta.sleep || 0,
          weight: delta.weight,
          notes: delta.notes,
        };
        return [...prev, newItem];
      }
    });
  };

  // Routine toggles
  const handleToggleRoutine = (id: string, completed: boolean) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed } : r))
    );
    if (completed) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
    const item = routines.find((r) => r.id === id);
    if (item) {
      SheetsService.postAction('logRoutine', {
        ...item,
        completed,
      });
    }
  };

  const handleAddRoutine = (routineName: string, targetValue?: string) => {
    const newRoutine: RoutineItem = {
      id: 'r_' + Date.now(),
      date: selectedDate,
      routineName,
      completed: false,
      targetValue,
    };
    setRoutines((prev) => [...prev, newRoutine]);
    SheetsService.postAction('logRoutine', newRoutine);
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    SheetsService.postAction('deleteItem', { id, sheetName: 'Routines_Habits', date: selectedDate });
  };

  const handleDeleteFood = (id: string) => {
    const item = foodLogs.find((f) => f.id === id);
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
    if (item) {
      SheetsService.postAction('deleteItem', { id, sheetName: 'Food_Logs', date: selectedDate });
      updateDailySummaryRecord({
        caloriesIn: Math.max(0, caloriesIn - item.calories),
      });
    }
  };

  const handleDeleteExercise = (id: string) => {
    const item = exerciseLogs.find((e) => e.id === id);
    setExerciseLogs((prev) => prev.filter((e) => e.id !== id));
    if (item) {
      SheetsService.postAction('deleteItem', { id, sheetName: 'Exercise_Logs', date: selectedDate });
      updateDailySummaryRecord({
        caloriesOut: Math.max(0, caloriesOut - item.caloriesBurnt),
      });
    }
  };

  // Change date (previous / next)
  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-');
    const current = new Date(Number(y), Number(m) - 1, Number(d));
    current.setDate(current.getDate() + days);
    const ny = current.getFullYear();
    const nm = String(current.getMonth() + 1).padStart(2, '0');
    const nd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  // Calorie target remaining
  const calorieRemaining = settings.dailyCalorieTarget - caloriesIn + caloriesOut;
  const calorieProgressPercent = Math.min(
    100,
    Math.round((caloriesIn / (settings.dailyCalorieTarget || 2000)) * 100)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16 selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                FitFlow <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Pro</span>
              </h1>
              <p className="text-[11px] text-zinc-400">Sheet Sync & Habit Tracker</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRemoteSync()}
              disabled={syncing}
              title="Sync with Google Sheets"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sync Sheet</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              title="Settings"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="bg-emerald-950/70 border-b border-emerald-800/60 text-emerald-300 text-xs py-2 px-4 text-center animate-in fade-in duration-200">
          {syncMessage}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Date Selector Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-semibold text-base sm:text-lg focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {todayString && selectedDate !== todayString && (
            <button
              onClick={() => setSelectedDate(todayString)}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition font-medium"
            >
              Jump to Today
            </button>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFoodModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Food
            </button>
            <button
              onClick={() => setShowExerciseModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Workout
            </button>
            <button
              onClick={() => setShowDailyModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Scale className="w-4 h-4" /> Weight/Water
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Calorie Balance Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Calorie Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white">{caloriesIn}</span>
                <span className="text-xs text-zinc-400">/ {settings.dailyCalorieTarget} kcal</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {calorieRemaining >= 0 ? `${calorieRemaining} kcal remaining` : `${Math.abs(calorieRemaining)} kcal over target`}
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  calorieProgressPercent > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(calorieProgressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Calories Burnt Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Calories Burnt
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-blue-400">{caloriesOut}</span>
                <span className="text-xs text-zinc-400">kcal burnt</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Net: {netCalories >= 0 ? `+${netCalories}` : netCalories} kcal
              </p>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <span>{todayExercise.length} workout(s) recorded</span>
            </div>
          </div>

          {/* 3. Weight Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Weight Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white">
                  {currentDaily.weight ? `${currentDaily.weight}` : '--'}
                </span>
                <span className="text-xs text-zinc-400">kg</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Target: {settings.targetWeight} kg{' '}
                {currentDaily.weight && (
                  <span className="text-purple-400 font-medium">
                    ({(currentDaily.weight - settings.targetWeight).toFixed(1)} kg away)
                  </span>
                )}
              </p>
            </div>
            <div className="text-[11px] text-zinc-500">
              {currentDaily.weight ? 'Logged for this day' : 'Not logged yet today'}
            </div>
          </div>

          {/* 4. Hydration & Sleep */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Hydration & Rest
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-zinc-400 block">Water</span>
                <span className="text-lg font-bold text-cyan-400">{currentDaily.water || 0}</span>
                <span className="text-[10px] text-zinc-500"> / {settings.dailyWaterTarget}ml</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Sleep</span>
                <span className="text-lg font-bold text-indigo-400">{currentDaily.sleep || 0}</span>
                <span className="text-[10px] text-zinc-500"> / {settings.dailySleepTarget}h</span>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              {currentDaily.notes ? `Note: "${currentDaily.notes}"` : 'No daily notes'}
            </div>
          </div>

        </div>

        {/* Daily Macros Breakdown */}
        {caloriesIn > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold text-zinc-300">Today's Macros:</span>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-400">Protein:</span>
                <span className="font-semibold text-white">{totalProtein}g</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-zinc-400">Carbs:</span>
                <span className="font-semibold text-white">{totalCarbs}g</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-zinc-400">Fat:</span>
                <span className="font-semibold text-white">{totalFat}g</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Logs Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Food Logs Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-400" /> Meals & Calorie Intake
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {todayFood.length} items logged ({caloriesIn} kcal total)
                </p>
              </div>
              <button
                onClick={() => setShowFoodModal(true)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {todayFood.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No meals logged yet for {selectedDate}. Click '+ Log Food' above!
                </div>
              ) : (
                todayFood.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-700/60 text-emerald-400">
                          {food.mealType}
                        </span>
                        <h4 className="text-sm font-medium text-zinc-200">{food.foodItem}</h4>
                      </div>
                      <div className="flex gap-3 text-[11px] text-zinc-400 mt-1">
                        {food.protein > 0 && <span>P: {food.protein}g</span>}
                        {food.carbs > 0 && <span>C: {food.carbs}g</span>}
                        {food.fat > 0 && <span>F: {food.fat}g</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{food.calories} kcal</span>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        className="text-zinc-500 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Exercise Logs Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-400" /> Workouts & Activities
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {todayExercise.length} activities ({caloriesOut} kcal burnt)
                </p>
              </div>
              <button
                onClick={() => setShowExerciseModal(true)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {todayExercise.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No workouts recorded for {selectedDate}. Log a workout or run!
                </div>
              ) : (
                todayExercise.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-700/60 text-blue-400">
                          {ex.intensity}
                        </span>
                        <h4 className="text-sm font-medium text-zinc-200">{ex.activityType}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                        <span>{ex.duration} mins</span>
                        {ex.notes && <span className="text-zinc-500 italic">"{ex.notes}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-400">-{ex.caloriesBurnt} kcal</span>
                      <button
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="text-zinc-500 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Routines & Habit Tracking */}
        <RoutinesSection
          selectedDate={selectedDate}
          routines={routines}
          onToggleRoutine={handleToggleRoutine}
          onAddRoutine={handleAddRoutine}
          onDeleteRoutine={handleDeleteRoutine}
        />

        {/* Analytics & Progress Charts */}
        <ChartsOverview
          dailySummaries={dailySummaries}
          targetWeight={settings.targetWeight}
          calorieTarget={settings.dailyCalorieTarget}
        />

      </main>

      {/* Modals */}
      <LogFoodModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        selectedDate={selectedDate}
        onAddFood={handleAddFood}
      />

      <LogExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        selectedDate={selectedDate}
        onAddExercise={handleAddExercise}
      />

      <LogDailyModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        selectedDate={selectedDate}
        initialWeight={currentDaily.weight}
        initialWater={currentDaily.water}
        initialSleep={currentDaily.sleep}
        initialNotes={currentDaily.notes}
        onSaveDaily={handleSaveDaily}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveToLocal(STORAGE_KEYS.SETTINGS, newSettings);
          if (newSettings.sheetsApiUrl) {
            handleRemoteSync(newSettings.sheetsApiUrl);
          }
        }}
        onTestConnection={async (url) => {
          const res = await SheetsService.fetchAllData(url);
          return res !== null;
        }}
      />
    </div>
  );
}
