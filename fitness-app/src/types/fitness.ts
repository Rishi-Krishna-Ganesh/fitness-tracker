export interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodItem: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt?: string;
}

export interface ExerciseLog {
  id: string;
  date: string; // YYYY-MM-DD
  activityType: string;
  duration: number; // minutes
  caloriesBurnt: number;
  intensity: 'Low' | 'Medium' | 'High';
  notes?: string;
  loggedAt?: string;
}

export interface RoutineItem {
  id: string;
  date: string;
  routineName: string;
  completed: boolean;
  targetValue?: string;
  actualValue?: string;
  notes?: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  weight?: number;
  targetWeight?: number;
  caloriesIn: number;
  caloriesOut: number;
  netCalories: number;
  water: number; // ml
  sleep: number; // hours
  notes?: string;
}

export interface UserSettings {
  dailyCalorieTarget: number;
  targetWeight: number;
  dailyWaterTarget: number;
  dailySleepTarget: number;
  sheetsApiUrl?: string;
}
