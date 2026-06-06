import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAIQuestions(category: string, count: number, difficulty: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate ${count} high-quality ${difficulty} level multiple choice questions for the category "${category}".
    
    Return the response as a valid JSON array of objects. 
    Each object must strictly follow this structure:
    {
      "day": "Auto",
      "date": "Auto",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "question": "The question text",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A, B, C, or D",
      "explanation": "A short educational explanation",
      "points": ${difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15}
    }

    Ensure questions are unique, professional, and technically accurate.
    Return ONLY the raw JSON array. No markdown, no backticks.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean up potential markdown formatting if Gemini adds it
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate questions using AI");
  }
}
