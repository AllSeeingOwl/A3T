import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup basic environment variables if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CREDENTIALS_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
const OUTPUT_FILE = path.join(projectRoot, 'data', 'questions.csv');

async function syncQuestions() {
  if (!SHEET_ID) {
    console.error('❌ Error: GOOGLE_SHEET_ID is not set in environment variables.');
    process.exit(1);
  }

  if (!CREDENTIALS_JSON) {
    console.error('❌ Error: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is not set in environment variables.');
    process.exit(1);
  }

  console.log('🔄 Authenticating with Google...');
  let credentials;
  try {
    credentials = JSON.parse(CREDENTIALS_JSON);
  } catch (error) {
    console.error('❌ Error parsing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS. Ensure it is valid JSON.');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`📡 Fetching data from Google Sheet ID: ${SHEET_ID}...`);
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1', // Defaults to Sheet1. If your sheet has a different name, it will need to be updated.
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data found in the Google Sheet.');
      return;
    }

    console.log(`✅ Successfully fetched ${rows.length} rows.`);

    // The data is an array of arrays (rows of columns). We convert this back to CSV.
    console.log(`📝 Writing data to ${OUTPUT_FILE}...`);
    const csvContent = stringify(rows);

    // Ensure the data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');
    console.log('🎉 Update complete! data/questions.csv has been synchronized.');

  } catch (error) {
    console.error('❌ Failed to fetch or save questions:', error);
    process.exit(1);
  }
}

syncQuestions();