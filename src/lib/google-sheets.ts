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
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A2:K'; // Adjust sheet name as needed

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
  if (!rows) return null;

  // Get current date in YYYY-MM-DD format (UTC)
  const today = new Date().toISOString().split('T')[0];

  const todayRow = rows.find((row) => row[1] === today);

  if (!todayRow) return null;

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
