import { FoodLog, ExerciseLog, RoutineItem, DailySummary, UserSettings } from '@/types/fitness';

const STORAGE_KEYS = {
  SETTINGS: 'fitness_settings',
  DAILY: 'fitness_daily_logs',
  FOOD: 'fitness_food_logs',
  EXERCISE: 'fitness_exercise_logs',
  ROUTINES: 'fitness_routines',
};

export const DEFAULT_SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_API_URL || '';

export const defaultSettings: UserSettings = {
  dailyCalorieTarget: 2000,
  targetWeight: 70,
  dailyWaterTarget: 2500,
  dailySleepTarget: 8,
  sheetsApiUrl: DEFAULT_SHEETS_URL,
};

export function normalizeDateString(raw: any): string {
  if (!raw) return getTodayDateString();
  const str = String(raw).trim();
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // If it's an ISO timestamp e.g. 2026-11-23T21:40:00.000Z or date object string
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      // Use local date parts so it matches the user's current calendar day
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}
  return str.substring(0, 10);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  } catch {
    return dateStr;
  }
}

// Local Storage Helpers
export function loadFromLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Error loading key ${key}`, err);
    return defaultValue;
  }
}

export function saveToLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key}`, err);
  }
}

// Google Sheets API Service
export class SheetsService {
  private static getApiUrl(customUrl?: string): string {
    if (customUrl && customUrl.trim()) return customUrl.trim();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.sheetsApiUrl && parsed.sheetsApiUrl.trim()) {
            return parsed.sheetsApiUrl.trim();
          }
        } catch {}
      }
    }
    return DEFAULT_SHEETS_URL;
  }

  public static async fetchAllData(customUrl?: string) {
    const url = this.getApiUrl(customUrl);
    if (!url) return null;

    try {
      // Use internal Next.js proxy route to bypass browser CORS & 302 redirect issues
      const resp = await fetch(`/api/sheets?action=getAll&scriptUrl=${encodeURIComponent(url)}`, {
        method: 'GET',
      });
      const json = await resp.json();
      return json.status === 'success' ? json.data : null;
    } catch (err) {
      console.error('Failed to fetch from Google Sheets', err);
      return null;
    }
  }

  public static async postAction(action: string, data: any, customUrl?: string) {
    const url = this.getApiUrl(customUrl);
    if (!url) {
      console.warn('Google Sheets URL not configured, skipping remote sync');
      return { status: 'mock_local' };
    }

    try {
      // Send through internal Next.js API proxy which reliably executes POST to Apps Script
      const resp = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptUrl: url,
          action,
          data,
        }),
      });
      const res = await resp.json();
      return res;
    } catch (err) {
      console.error(`Error executing remote action ${action}`, err);
      return { status: 'error', error: err };
    }
  }
}

export { STORAGE_KEYS };
