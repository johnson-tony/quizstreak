import { getAllQuestions } from "@/lib/google-sheets";
import { generateAIQuestions } from "@/lib/groq";
import { IPoolQuestion } from "@/models/Pool";

export async function curatePoolQuestions(
  category: string,
  count: number = 10,
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed" = "Medium"
): Promise<IPoolQuestion[]> {
  try {
    const allQuestions = await getAllQuestions();
    
    // Filter questions matching category (case-insensitive) or mixed
    let matching = allQuestions.filter((q) => {
      if (!q.question || !q.options?.A || !q.correctAnswer) return false;
      if (category.toLowerCase() === "all" || category.toLowerCase() === "mixed" || category.toLowerCase() === "full-stack") {
        return true;
      }
      return q.category?.toLowerCase() === category.toLowerCase();
    });

    // If difficulty is specified and not Mixed, filter or prioritize
    if (difficulty !== "Mixed" && matching.length >= count * 2) {
      const difficultyMatching = matching.filter(
        (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
      if (difficultyMatching.length >= count) {
        matching = difficultyMatching;
      }
    }

    // Shuffle matching questions
    const shuffled = [...matching].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const formatted: IPoolQuestion[] = selected.map((q, idx) => ({
      day: `P-${idx + 1}-${Date.now().toString().slice(-4)}`,
      question: q.question,
      options: {
        A: q.options.A || "",
        B: q.options.B || "",
        C: q.options.C || "",
        D: q.options.D || "",
      },
      correctAnswer: q.correctAnswer.trim().toUpperCase(),
      explanation: q.explanation || "No explanation provided.",
      difficulty: q.difficulty || (difficulty === "Mixed" ? "Medium" : difficulty),
      points: 10,
    }));

    // If we have enough questions, return them
    if (formatted.length >= count) {
      return formatted.slice(0, count);
    }

    // If we need more questions, use Groq AI generation to fill the rest!
    const needed = count - formatted.length;
    if (needed > 0 && process.env.GROQ_API_KEY) {
      try {
        const aiQuestions = await generateAIQuestions(
          category === "all" || category === "full-stack" ? "Full-Stack Development" : category,
          needed,
          difficulty === "Mixed" ? "Medium" : difficulty
        );

        if (Array.isArray(aiQuestions)) {
          aiQuestions.forEach((aiQ: any, idx: number) => {
            if (formatted.length < count && aiQ.question && aiQ.options && aiQ.correctAnswer) {
              formatted.push({
                day: `AI-${idx + 1}-${Date.now().toString().slice(-4)}`,
                question: aiQ.question,
                options: {
                  A: aiQ.options.A || "",
                  B: aiQ.options.B || "",
                  C: aiQ.options.C || "",
                  D: aiQ.options.D || "",
                },
                correctAnswer: String(aiQ.correctAnswer).trim().toUpperCase(),
                explanation: aiQ.explanation || "AI-generated quiz question.",
                difficulty: aiQ.difficulty || (difficulty === "Mixed" ? "Medium" : difficulty),
                points: 10,
              });
            }
          });
        }
      } catch (aiErr) {
        console.warn("Groq AI generation fallback skipped:", aiErr);
      }
    }

    // If still empty (e.g. sheet has no rows and no AI key), provide standard fallback questions
    if (formatted.length === 0) {
      for (let i = 1; i <= count; i++) {
        formatted.push({
          day: `FALLBACK-${i}`,
          question: `Sample Question ${i} for ${category}: What is the primary concept in modern software architecture?`,
          options: {
            A: "Separation of concerns",
            B: "Tight coupling",
            C: "Monolithic locking",
            D: "Unstructured scripts",
          },
          correctAnswer: "A",
          explanation: "Separation of concerns is a fundamental design principle for modular software.",
          difficulty: "Medium",
          points: 10,
        });
      }
    }

    return formatted;
  } catch (error) {
    console.error("Error curating pool questions:", error);
    // Fallback if everything fails
    return Array.from({ length: count }, (_, i) => ({
      day: `ERR-${i + 1}`,
      question: `Standard Evaluation ${i + 1} (${category}): Identify the correct statement.`,
      options: {
        A: "Modular code improves maintainability and scalability",
        B: "Global variables should always be preferred",
        C: "Testing is not recommended in production systems",
        D: "Syntax errors are detected at runtime only",
      },
      correctAnswer: "A",
      explanation: "Modularity enhances maintainability and scalability.",
      difficulty: "Medium",
      points: 10,
    }));
  }
}
