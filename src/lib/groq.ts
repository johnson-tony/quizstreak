import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIQuestions(category: string, count: number, difficulty: string) {
  const prompt = `
    Generate a JSON array of exactly ${count} unique multiple choice questions for the category "${category}" at ${difficulty} level.
    
    Each object in the array must follow this exact structure:
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

    Return ONLY the raw JSON array. No conversational text, no markdown blocks.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized educational content JSON generator. You output only raw valid JSON arrays of quiz questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Very high quality model
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    const parsed = JSON.parse(content);
    // Handle cases where the model wraps the array in an object
    return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || Object.values(parsed)[0]);
  } catch (error: any) {
    console.error("Groq Generation Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
}
