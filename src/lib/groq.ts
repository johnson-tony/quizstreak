import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIQuestions(category: string, count: number, difficulty: string) {
  const prompt = `
    Generate a JSON object containing a key "questions" which is an array of exactly ${count} unique multiple choice questions for the category "${category}" at ${difficulty} level.
    
    Each object in the "questions" array must follow this exact structure:
    {
      "day": "Auto",
      "set": "Auto",
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

    Return ONLY the raw JSON object. No conversational text, no markdown blocks.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized educational content JSON generator. You output only raw valid JSON objects containing an array of quiz questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    const parsed = JSON.parse(content);
    
    // Extract array from various possible structures
    let questions = [];
    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      questions = parsed.data;
    } else {
      // Look for any array in the object
      const foundArray = Object.values(parsed).find(val => Array.isArray(val));
      if (foundArray) {
        questions = foundArray as any[];
      } else {
        throw new Error("AI response did not contain a valid questions array");
      }
    }

    return questions;
  } catch (error: any) {
    console.error("Groq Generation Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
}
