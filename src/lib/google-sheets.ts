import { google } from 'googleapis';

export interface Question {
  day: string;
  set: string; // Column B: Which set this question belongs to (1, 2, 3...)
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
  rowIndex?: number;
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getGoogleSheetData() {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.error('GOOGLE_SERVICE_ACCOUNT_KEY is missing from environment variables');
      return null;
    }

    let credentials;
    try {
      const cleanedKey = serviceAccountKey
        .replace(/\r/g, '') 
        .replace(/\n/g, '\\n');
      
      credentials = JSON.parse(cleanedKey);

      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON:', parseError);
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

export async function getAllQuestions(): Promise<Question[]> {
  const rows = await getGoogleSheetData();
  if (!rows) return [];

  return rows.map((row, index) => ({
    day: row[0],
    set: row[1], // Column B
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
    rowIndex: index + 2,
  }));
}

export async function getQuestionsBySet(setNumber: number): Promise<Question[]> {
  const all = await getAllQuestions();
  // Fallback to set 1 if setNumber is missing or invalid
  const targetSet = (setNumber || 1).toString();
  return all.filter(q => q.set === targetSet);
}

export async function appendQuestions(questions: Question[]) {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is missing');

    const cleanedKey = serviceAccountKey.replace(/\r/g, '').replace(/\n/g, '\\n');
    const credentials = JSON.parse(cleanedKey);
    if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const values = questions.map(q => [
      q.day,
      q.set,
      q.category,
      q.difficulty,
      q.question,
      q.options.A,
      q.options.B,
      q.options.C,
      q.options.D,
      q.correctAnswer,
      q.explanation,
      q.points || 10
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A2:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return { success: true };
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw error;
  }
}

export async function updateQuestion(rowIndex: number, q: Question) {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const cleanedKey = serviceAccountKey!.replace(/\r/g, '').replace(/\n/g, '\\n');
    const credentials = JSON.parse(cleanedKey);
    if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Sheet1!A${rowIndex}:L${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          q.day, q.set, q.category, q.difficulty, q.question,
          q.options.A, q.options.B, q.options.C, q.options.D,
          q.correctAnswer, q.explanation, q.points || 10
        ]]
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating row:', error);
    throw error;
  }
}

export async function deleteQuestion(rowIndex: number) {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const cleanedKey = serviceAccountKey!.replace(/\r/g, '').replace(/\n/g, '\\n');
    const credentials = JSON.parse(cleanedKey);
    if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get the sheet ID for "Sheet1"
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Sheet1');
    const sheetId = sheet?.properties?.sheetId || 0;

    // To physically remove the row and shift others up, we use batchUpdate with deleteDimension
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting row:', error);
    throw error;
  }
}
