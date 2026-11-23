'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Utensils, Flame, Sparkles } from 'lucide-react';

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onAddFood: (food: {
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    foodItem: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onAddFood,
}) => {
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Quick suggestions
  const quickItems = [
    { name: 'Oatmeal with Berries', cals: 300, p: 10, c: 50, f: 5, type: 'Breakfast' as const },
    { name: 'Grilled Chicken Salad', cals: 450, p: 40, c: 15, f: 12, type: 'Lunch' as const },
    { name: 'Protein Shake', cals: 200, p: 30, c: 5, f: 3, type: 'Snack' as const },
    { name: 'Salmon & Brown Rice', cals: 550, p: 38, c: 45, f: 18, type: 'Dinner' as const },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItem.trim() || !calories) return;

    onAddFood({
      mealType,
      foodItem: foodItem.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });

    // Reset & close
    setFoodItem('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    onClose();
  };

  const applyQuickItem = (item: typeof quickItems[0]) => {
    setFoodItem(item.name);
    setCalories(item.cals.toString());
    setProtein(item.p.toString());
    setCarbs(item.cals ? item.c.toString() : '0');
    setFat(item.f.toString());
    setMealType(item.type);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Meal & Calories">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Picks */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Add Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {quickItems.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => applyQuickItem(item)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition border border-zinc-700/50"
              >
                {item.name} ({item.cals} kcal)
              </button>
            ))}
          </div>
        </div>

        {/* Meal Type */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Meal Category</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setMealType(type)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                  mealType === type
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Food Name */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Food / Meal Name *</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Greek Yogurt with Walnuts"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <Utensils className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Calories */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Calories (kcal) *</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <Flame className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Macros */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Macros (Optional)</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Protein (g)</span>
              <input
                type="number"
                min="0"
                placeholder="g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Carbs (g)</span>
              <input
                type="number"
                min="0"
                placeholder="g"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400 mb-1 block">Fat (g)</span>
              <input
                type="number"
                min="0"
                placeholder="g"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-zinc-950 font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
        >
          Add Meal Log
        </button>
      </form>
    </Modal>
  );
};
