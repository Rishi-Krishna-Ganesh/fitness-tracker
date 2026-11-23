'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailySummary } from '@/types/fitness';
import { formatDateLabel } from '@/services/storageService';

interface ChartsOverviewProps {
  dailySummaries: DailySummary[];
  targetWeight: number;
  calorieTarget: number;
}

export const ChartsOverview: React.FC<ChartsOverviewProps> = ({
  dailySummaries,
  targetWeight,
  calorieTarget,
}) => {
  // Sort daily data by date ascending
  const sortedData = [...dailySummaries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Take the last 14 days
  const chartData = sortedData.slice(-14).map((d) => ({
    date: formatDateLabel(d.date),
    rawDate: d.date,
    Weight: d.weight || null,
    'Target Weight': targetWeight,
    'Calories In': d.caloriesIn || 0,
    'Calories Out': d.caloriesOut || 0,
    Net: d.netCalories || 0,
    CalorieTarget: calorieTarget,
  }));

  const weightDataPoints = chartData.filter((d) => d.Weight !== null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weight Progress Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Weight Progress</h3>
            <p className="text-xs text-zinc-400">Target: {targetWeight} kg</p>
          </div>
          {weightDataPoints.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-950/60 text-purple-300 border border-purple-800/60 rounded-lg">
              Latest: {weightDataPoints[weightDataPoints.length - 1].Weight} kg
            </span>
          )}
        </div>

        <div className="h-64 w-full pt-2">
          {weightDataPoints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No weight logs recorded yet. Log your weight to see progress charts!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Weight"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Calorie Intake vs Burn Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Calories (In vs Out)</h3>
            <p className="text-xs text-zinc-400">Target: {calorieTarget} kcal / day</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No calorie logs yet. Start logging meals and workouts!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar dataKey="Calories In" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Calories Out" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
