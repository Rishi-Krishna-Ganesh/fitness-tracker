/**
 * FITNESS TRACKER - GOOGLE APPS SCRIPT BACKEND (AUTO-HEALING VERSION)
 * 
 * This version automatically creates any missing tab on the fly if it doesn't exist yet!
 */

const SHEET_NAMES = {
  DAILY: 'Daily_Summary',
  FOOD: 'Food_Logs',
  EXERCISE: 'Exercise_Logs',
  ROUTINES: 'Routines_Habits',
  SETTINGS: 'Settings'
};

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  Logger.log("Setup completed successfully!");
}

function ensureSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === SHEET_NAMES.DAILY) {
      sheet.appendRow(['Date', 'Weight (kg)', 'Target Weight (kg)', 'Calories In', 'Calories Out', 'Net Calories', 'Water (ml)', 'Sleep (hrs)', 'Notes', 'Logged At']);
    } else if (sheetName === SHEET_NAMES.FOOD) {
      sheet.appendRow(['ID', 'Date', 'Meal Type', 'Food Item', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Logged At']);
    } else if (sheetName === SHEET_NAMES.EXERCISE) {
      sheet.appendRow(['ID', 'Date', 'Activity Type', 'Duration (mins)', 'Calories Burnt', 'Intensity', 'Notes', 'Logged At']);
    } else if (sheetName === SHEET_NAMES.ROUTINES) {
      sheet.appendRow(['ID', 'Date', 'Routine Name', 'Completed', 'Target Value', 'Actual Value', 'Notes', 'Logged At']);
    } else if (sheetName === SHEET_NAMES.SETTINGS) {
      sheet.appendRow(['Key', 'Value']);
      sheet.appendRow(['Daily Calorie Target', '2000']);
      sheet.appendRow(['Target Weight (kg)', '70']);
      sheet.appendRow(['Daily Water Target (ml)', '2500']);
      sheet.appendRow(['Daily Sleep Target (hrs)', '8']);
    }
    formatHeader(sheet);
  }
  return sheet;
}

function ensureSheets(ss) {
  ensureSheet(ss, SHEET_NAMES.DAILY);
  ensureSheet(ss, SHEET_NAMES.FOOD);
  ensureSheet(ss, SHEET_NAMES.EXERCISE);
  ensureSheet(ss, SHEET_NAMES.ROUTINES);
  ensureSheet(ss, SHEET_NAMES.SETTINGS);

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
}

function formatHeader(sheet) {
  try {
    const lastCol = Math.max(1, sheet.getLastColumn());
    const headerRange = sheet.getRange(1, 1, 1, lastCol);
    headerRange.setBackground('#10B981');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  } catch (e) {}
}

// Handle GET requests
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'getAll';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);

  try {
    let result = {};
    if (action === 'getAll') {
      result = {
        daily: getSheetData(ss, SHEET_NAMES.DAILY),
        food: getSheetData(ss, SHEET_NAMES.FOOD),
        exercise: getSheetData(ss, SHEET_NAMES.EXERCISE),
        routines: getSheetData(ss, SHEET_NAMES.ROUTINES),
        settings: getSettingsData(ss)
      };
    } else if (action === 'getFood') {
      result = getSheetData(ss, SHEET_NAMES.FOOD);
    } else if (action === 'getExercise') {
      result = getSheetData(ss, SHEET_NAMES.EXERCISE);
    } else if (action === 'getDaily') {
      result = getSheetData(ss, SHEET_NAMES.DAILY);
    } else if (action === 'getRoutines') {
      result = getSheetData(ss, SHEET_NAMES.ROUTINES);
    } else {
      return createJsonResponse({ error: 'Unknown action' }, 400);
    }

    return createJsonResponse({ status: 'success', data: result });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

// Handle POST requests
function doPost(e) {
  try {
    let postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      postData = e.parameter;
    } else {
      return createJsonResponse({ status: 'error', message: 'No payload provided' }, 400);
    }

    const action = postData.action;
    const data = postData.data || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheets(ss);

    if (action === 'logFood') {
      const sheet = ensureSheet(ss, SHEET_NAMES.FOOD);
      const id = data.id || Utilities.getUuid();
      const timestamp = new Date().toISOString();
      sheet.appendRow([
        id,
        data.date || getTodayDateString(),
        data.mealType || 'Snack',
        data.foodItem || '',
        Number(data.calories) || 0,
        Number(data.protein) || 0,
        Number(data.carbs) || 0,
        Number(data.fat) || 0,
        timestamp
      ]);
      updateDailySummaryCalories(ss, data.date || getTodayDateString());
      return createJsonResponse({ status: 'success', id: id });
    }

    if (action === 'logExercise') {
      const sheet = ensureSheet(ss, SHEET_NAMES.EXERCISE);
      const id = data.id || Utilities.getUuid();
      const timestamp = new Date().toISOString();
      sheet.appendRow([
        id,
        data.date || getTodayDateString(),
        data.activityType || 'Workout',
        Number(data.duration) || 0,
        Number(data.caloriesBurnt) || 0,
        data.intensity || 'Medium',
        data.notes || '',
        timestamp
      ]);
      updateDailySummaryCalories(ss, data.date || getTodayDateString());
      return createJsonResponse({ status: 'success', id: id });
    }

    if (action === 'logDaily') {
      const sheet = ensureSheet(ss, SHEET_NAMES.DAILY);
      const date = data.date || getTodayDateString();
      const existingRowIndex = findRowByDate(sheet, date);
      const timestamp = new Date().toISOString();

      const rowValues = [
        date,
        data.weight ? Number(data.weight) : '',
        data.targetWeight ? Number(data.targetWeight) : '',
        Number(data.caloriesIn) || 0,
        Number(data.caloriesOut) || 0,
        (Number(data.caloriesIn) || 0) - (Number(data.caloriesOut) || 0),
        Number(data.water) || 0,
        Number(data.sleep) || 0,
        data.notes || '',
        timestamp
      ];

      if (existingRowIndex > 0) {
        sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      return createJsonResponse({ status: 'success', date: date });
    }

    if (action === 'logRoutine') {
      const sheet = ensureSheet(ss, SHEET_NAMES.ROUTINES);
      const id = data.id || Utilities.getUuid();
      const timestamp = new Date().toISOString();
      sheet.appendRow([
        id,
        data.date || getTodayDateString(),
        data.routineName || '',
        data.completed ? 'YES' : 'NO',
        data.targetValue || '',
        data.actualValue || '',
        data.notes || '',
        timestamp
      ]);
      return createJsonResponse({ status: 'success', id: id });
    }

    if (action === 'deleteItem') {
      const targetSheet = ss.getSheetByName(data.sheetName);
      if (!targetSheet) return createJsonResponse({ status: 'error', message: 'Sheet not found' }, 404);
      
      const values = targetSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.id) {
          targetSheet.deleteRow(i + 1);
          if (data.date && (data.sheetName === SHEET_NAMES.FOOD || data.sheetName === SHEET_NAMES.EXERCISE)) {
            updateDailySummaryCalories(ss, data.date);
          }
          return createJsonResponse({ status: 'success', message: 'Deleted' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'Item not found' }, 404);
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action' }, 400);

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      let key = headers[j].toString().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      let val = rows[i][j];
      
      // If cell is a Date object, format it as yyyy-MM-dd using the sheet's timezone
      if (val instanceof Date) {
        val = Utilities.formatDate(val, ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      
      item[key] = val;
    }
    data.push(item);
  }
  return data;
}

function getSettingsData(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) return {};
  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) settings[rows[i][0]] = rows[i][1];
  }
  return settings;
}

function findRowByDate(sheet, dateStr) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const cellDate = values[i][0] instanceof Date 
      ? Utilities.formatDate(values[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(values[i][0]).substring(0, 10);
    if (cellDate === dateStr) {
      return i + 1;
    }
  }
  return -1;
}

function updateDailySummaryCalories(ss, dateStr) {
  const foodSheet = ss.getSheetByName(SHEET_NAMES.FOOD);
  const exerciseSheet = ss.getSheetByName(SHEET_NAMES.EXERCISE);
  const dailySheet = ss.getSheetByName(SHEET_NAMES.DAILY);

  let totalCaloriesIn = 0;
  if (foodSheet && foodSheet.getLastRow() > 1) {
    const foodRows = foodSheet.getDataRange().getValues();
    for (let i = 1; i < foodRows.length; i++) {
      const d = foodRows[i][1] instanceof Date ? Utilities.formatDate(foodRows[i][1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(foodRows[i][1]).substring(0, 10);
      if (d === dateStr) {
        totalCaloriesIn += Number(foodRows[i][4]) || 0;
      }
    }
  }

  let totalCaloriesOut = 0;
  if (exerciseSheet && exerciseSheet.getLastRow() > 1) {
    const exRows = exerciseSheet.getDataRange().getValues();
    for (let i = 1; i < exRows.length; i++) {
      const d = exRows[i][1] instanceof Date ? Utilities.formatDate(exRows[i][1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(exRows[i][1]).substring(0, 10);
      if (d === dateStr) {
        totalCaloriesOut += Number(exRows[i][4]) || 0;
      }
    }
  }

  const rowIndex = findRowByDate(dailySheet, dateStr);
  const netCalories = totalCaloriesIn - totalCaloriesOut;

  if (rowIndex > 0) {
    dailySheet.getRange(rowIndex, 4).setValue(totalCaloriesIn);
    dailySheet.getRange(rowIndex, 5).setValue(totalCaloriesOut);
    dailySheet.getRange(rowIndex, 6).setValue(netCalories);
  } else {
    dailySheet.appendRow([dateStr, '', '', totalCaloriesIn, totalCaloriesOut, netCalories, 0, 0, '', new Date().toISOString()]);
  }
}

function getTodayDateString() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function createJsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
