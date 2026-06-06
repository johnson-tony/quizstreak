import { google } from 'googleapis';

export interface Question {
  day: string;
  date: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
    const range = 'Sheet1!A2:K';

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

export async function getTodayQuestion(): Promise<Question | null> {
  const rows = await getGoogleSheetData();
  if (!rows) {
    console.error('No rows returned from Google Sheet');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  console.log('Searching for question with date:', today);

  const todayRow = rows.find((row) => row[1] === today);

  if (!todayRow) {
    console.error(`No question found for date: ${today}. Available dates:`, rows.map(r => r[1]));
    return null;
  }

  return {
    day: todayRow[0],
    date: todayRow[1],
    category: todayRow[2],
    difficulty: todayRow[3] as any,
    question: todayRow[4],
    options: {
      A: todayRow[5],
      B: todayRow[6],
      C: todayRow[7],
      D: todayRow[8],
    },
    correctAnswer: todayRow[9],
    explanation: todayRow[10],
  };
}
