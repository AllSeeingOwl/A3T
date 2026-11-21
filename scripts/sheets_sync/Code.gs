/**
 * A3T Q&A sync: Google Sheet -> Supabase (one-way).
 *
 * The "Master Database" tab of the A3T-Q&A-Database sheet is the source of
 * truth. Every sync upserts all rows into public.questions, keyed on the
 * sheet's ID column, then deletes rows in Supabase that are no longer in the
 * sheet.
 *
 * List questions written with the Question cell merged down several rows (one
 * answer per row) are stored as a single question, with the answers joined by
 * ", ".
 *
 * Setup (once): see scripts/sheets_sync/README.md.
 *   1. Paste this file into Extensions -> Apps Script.
 *   2. Project Settings -> Script properties: add SUPABASE_URL and
 *      SUPABASE_SECRET_KEY.
 *   3. Run setupOnce() and approve the permissions prompt.
 */

const SHEET_NAME = 'Master Database';
const TABLE = 'questions';
const ID_HEADER = 'ID';
const ID_PREFIX = 'Q-';

// Sheet header -> Supabase column. Columns are found by header text, so
// reordering columns in the sheet is fine; renaming a header is not.
const COLUMN_MAP = {
  'ID': 'id',
  'Deck / Theme': 'deck_theme',
  'Sequence / Q#': 'sequence',
  'Category / Domain': 'category',
  'Difficulty': 'difficulty',
  'Question Type': 'question_type',
  'Question': 'question',
  'Answer': 'answer',
  'The Link': 'link',
  'Notes / Hidden Chain': 'notes',
  'Connection Type': 'connection_type',
  'Franchise / IP': 'franchise',
  'Status / Playtested': 'status',
  'Safety Checks Passed': 'safety_checks_passed',
  'Sub-Theme': 'sub_theme',
  'Readiness Status': 'readiness_status',
  'Primary Pillar': 'primary_pillar',
};

/** Adds a "Supabase" menu to the sheet. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Supabase')
    .addItem('Sync now', 'syncNow')
    .addToUi();
}

/**
 * One-time setup: adds the ID column, installs the triggers and runs the
 * first full sync. Safe to run again.
 */
function setupOnce() {
  const sheet = getSheet_();
  ensureIdColumn_(sheet);
  installTriggers_();
  const result = sync_();
  Logger.log('Setup complete. ' + result);
}

/** Menu item: sync and show the result. */
function syncNow() {
  const result = sync_();
  SpreadsheetApp.getActive().toast(result, 'Supabase sync', 5);
}

/** Installable trigger target (on edit and every 15 minutes). */
function syncTrigger() {
  try {
    sync_();
  } catch (err) {
    console.error('Supabase sync failed: ' + err);
    throw err;
  }
}

function sync_() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) return 'Skipped: another sync is running.';
  try {
    const sheet = getSheet_();
    assignMissingIds_(sheet);

    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(h => String(h).trim());
    const runAt = new Date().toISOString();
    const parentOf = mergedQuestionRows_(sheet, headers.indexOf('Question'));

    const rows = [];
    const byRow = {};
    const seen = {};
    for (let r = 1; r < values.length; r++) {
      const parent = parentOf[r + 1];
      if (parent) {
        // Continuation row of a merged Question cell: fold its answer in.
        const target = byRow[parent];
        const extra = cleanValue_('answer', values[r][headers.indexOf('Answer')]);
        if (target && extra) target.answer = target.answer ? target.answer + ', ' + extra : extra;
        continue;
      }
      const record = { sheet_row: r + 1, synced_at: runAt };
      headers.forEach((h, c) => {
        const col = COLUMN_MAP[h];
        if (col) record[col] = cleanValue_(col, values[r][c]);
      });
      if (!record.question || !record.id) continue; // blank row
      if (seen[record.id]) {
        throw new Error('Duplicate ID ' + record.id + ' on rows ' + seen[record.id] + ' and ' + (r + 1) +
          '. Clear the ID on the copied row and sync again.');
      }
      seen[record.id] = r + 1;
      byRow[r + 1] = record;
      rows.push(record);
    }

    // Never wipe Supabase because the sheet read came back empty.
    if (rows.length === 0) return 'Skipped: no questions found in the sheet.';

    for (let i = 0; i < rows.length; i += 500) {
      supabase_('post', '?on_conflict=id', rows.slice(i, i + 500),
        { Prefer: 'resolution=merge-duplicates,return=minimal' });
    }
    // Rows not touched by this run were removed from the sheet.
    supabase_('delete', '?synced_at=lt.' + encodeURIComponent(runAt), null,
      { Prefer: 'return=minimal' });

    return 'Synced ' + rows.length + ' questions.';
  } finally {
    lock.releaseLock();
  }
}

function cleanValue_(col, v) {
  if (col === 'safety_checks_passed') {
    return v === true || String(v).trim().toUpperCase() === 'TRUE';
  }
  if (v === '' || v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  const s = String(v).trim();
  return s === '' ? null : s;
}

function supabase_(method, query, payload, extraHeaders) {
  const props = PropertiesService.getScriptProperties();
  const url = (props.getProperty('SUPABASE_URL') || '').replace(/\/+$/, '');
  const key = props.getProperty('SUPABASE_SECRET_KEY');
  if (!url || !key) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in Project Settings -> Script properties.');
  }
  const headers = Object.assign({ apikey: key }, extraHeaders || {});
  // Legacy service_role keys are JWTs and must also be sent as a bearer token.
  if (key.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + key;

  const options = { method: method, headers: headers, muteHttpExceptions: true };
  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }
  const res = UrlFetchApp.fetch(url + '/rest/v1/' + TABLE + query, options);
  const code = res.getResponseCode();
  if (code >= 300) {
    throw new Error('Supabase ' + method.toUpperCase() + ' failed (' + code + '): ' + res.getContentText());
  }
  return res;
}

function getSheet_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Tab "' + SHEET_NAME + '" not found.');
  return sheet;
}

function headerIndex_(sheet, name) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(h => String(h).trim());
  return headers.indexOf(name); // 0-based, -1 if missing
}

/** Adds the ID header after the last column if it isn't there yet. */
function ensureIdColumn_(sheet) {
  if (headerIndex_(sheet, ID_HEADER) !== -1) return;
  const col = sheet.getLastColumn() + 1;
  sheet.getRange(1, col).setValue(ID_HEADER).setFontWeight('bold');
}

/** Gives every question without an ID the next Q-#### number. */
function assignMissingIds_(sheet) {
  ensureIdColumn_(sheet);
  const idCol = headerIndex_(sheet, ID_HEADER);
  const qCol = headerIndex_(sheet, 'Question');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = range.getValues();
  let max = 0;
  values.forEach(row => {
    const m = String(row[idCol]).match(/^Q-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  });

  const ids = values.map(row => [row[idCol]]);
  let changed = false;
  values.forEach((row, i) => {
    if (String(row[qCol]).trim() !== '' && String(row[idCol]).trim() === '') {
      max += 1;
      ids[i][0] = ID_PREFIX + String(max).padStart(4, '0');
      changed = true;
    }
  });
  if (changed) sheet.getRange(2, idCol + 1, ids.length, 1).setValues(ids);
}

/**
 * Maps each continuation row of a merged Question cell to the merge's top row
 * (1-based sheet rows).
 */
function mergedQuestionRows_(sheet, qCol) {
  const parentOf = {};
  if (qCol === -1 || sheet.getLastRow() < 2) return parentOf;
  sheet.getRange(1, qCol + 1, sheet.getLastRow(), 1).getMergedRanges().forEach(m => {
    const top = m.getRow();
    for (let r = top + 1; r <= m.getLastRow(); r++) parentOf[r] = top;
  });
  return parentOf;
}

function installTriggers_() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'syncTrigger')
    .forEach(t => ScriptApp.deleteTrigger(t));
  const ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('syncTrigger').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('syncTrigger').forSpreadsheet(ss).onChange().create();
  ScriptApp.newTrigger('syncTrigger').timeBased().everyMinutes(15).create();
}
