# 🏋️‍♂️ FitFlow Pro - Fitness Tracker

A modern, responsive fitness tracker built with **Next.js**, **Tailwind CSS**, and **Google Sheets (via Google Apps Script)** as the serverless database.

---

## 🌟 Key Features

1. **Calorie Tracking & Balance**:
   - Log meals (Breakfast, Lunch, Dinner, Snack) with calories and macros (Protein, Carbs, Fat).
   - Real-time remaining calorie balance calculation against daily targets.
2. **Workouts & Activity Logging**:
   - Log exercises, duration, intensity, and estimated calories burned.
   - Calculates net daily calories (`Calories In - Calories Out`).
3. **Weight & Metric Tracking**:
   - Morning weight tracker with target progress.
   - Hydration (water in ml) and sleep (hours) tracking with quick add buttons.
4. **Daily Routines & Habits**:
   - Checklist for daily habits (10k steps, morning stretch, vitamins, clean eating).
   - Confetti celebration upon completion!
5. **Interactive Charts**:
   - Weight trend area chart.
   - Calorie Intake vs. Burn daily comparison bar chart.
6. **2-Way Google Sheets Sync**:
   - Live synchronization with Google Sheets using Apps Script Web App.
   - Full offline/local fallback mode via `localStorage`.

---

## 🚀 Running Locally

```bash
cd fitness-app
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Google Sheets Setup (Backend)

1. Create a new Google Sheet at [sheets.new](https://sheets.new).
2. Go to **Extensions** > **Apps Script**.
3. Copy all code from [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) into the editor.
4. Select `initialSetup` from the function dropdown and click **Run** (Authorize permissions when prompted).
5. Click **Deploy** > **New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web App URL and either:
   - Click the **Settings (gear icon)** inside the running app and paste the URL.
   - Or set `NEXT_PUBLIC_SHEETS_API_URL` in `.env.local`.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Set root directory to `fitness-app`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SHEETS_API_URL`: Your Google Apps Script Web App URL.
5. Click **Deploy**!
