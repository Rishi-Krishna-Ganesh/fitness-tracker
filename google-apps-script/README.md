# Google Sheets & Apps Script Setup Guide

Follow these quick steps to set up your backend spreadsheet:

### 1. Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it something like **"My Fitness Tracker"**.

### 2. Open Apps Script
1. In the top menu, go to **Extensions** > **Apps Script**.
2. Rename the project to **"FitnessTrackerBackend"**.
3. Delete any default code in `Code.gs` and copy-paste the contents of [`google-apps-script/Code.gs`](./Code.gs).

### 3. Run One-Time Setup
1. At the top of the Apps Script editor, select `initialSetup` from the function dropdown.
2. Click **Run**.
3. Google will ask for permissions ("Authorization Required") - click **Review Permissions**, choose your Google account, click **Advanced** -> **Go to FitnessTrackerBackend (unsafe)**, and **Allow**.
4. Check your Google Sheet: You will see tabs auto-created with green headers:
   - `Daily_Summary`
   - `Food_Logs`
   - `Exercise_Logs`
   - `Routines_Habits`
   - `Settings`

### 4. Deploy as Web App
1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and pick **Web app**.
3. Configure:
   - **Description**: `Fitness Tracker API`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(Crucial so your Next.js app can communicate with it)*
4. Click **Deploy**.
5. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/AKfycbx.../exec`).

### 5. Add URL to your App
Save this URL in `fitness-app/.env.local`:
```env
NEXT_PUBLIC_SHEETS_API_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```
*(The app also has a built-in Settings UI where you can paste this URL directly in the browser!)*
