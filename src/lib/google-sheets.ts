import { google } from 'googleapis';

export interface Question {
  day: string;
  date: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points?: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getGoogleSheetData() {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.error('GOOGLE_SERVICE_ACCOUNT_KEY is missing from environment variables');
      return null;
    }

    let credentials;
    try {
      // 1. Remove any real carriage returns
      // 2. Escape any real newlines so they don't break JSON.parse
      // 3. Then parse the JSON
      const cleanedKey = serviceAccountKey
        .replace(/\r/g, '') 
        .replace(/\n/g, '\\n');
      
      credentials = JSON.parse(cleanedKey);

      // 4. Finally, if the private_key still has literal '\n' strings, 
      //    convert them to real newline characters for Google Auth
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON:', parseError);
      console.error('Raw key length:', serviceAccountKey.length);
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A2:L';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values;
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    return null;
  }
}

export async function getTodayQuestions(): Promise<Question[]> {
  const rows = await getGoogleSheetData();
  if (!rows) return [];

  const today = new Date().toISOString().split('T')[0];
  console.log('Searching for questions with date:', today);

  const todayRows = rows.filter((row) => row[1] === today);

  if (todayRows.length === 0) {
    console.error(`No questions found for date: ${today}. Available dates:`, rows.map(r => r[1]));
    return [];
  }

  return todayRows.map(row => ({
    day: row[0],
    date: row[1],
    category: row[2],
    difficulty: row[3] as any,
    points: row[11] ? parseInt(row[11]) : undefined,
    question: row[4],
    options: {
      A: row[5],
      B: row[6],
      C: row[7],
      D: row[8],
    },
    correctAnswer: row[9],
    explanation: row[10],
  }));
}
