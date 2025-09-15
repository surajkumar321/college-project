import Quiz from "../models/Quiz.js";
import { geminiJSON } from "../utils/gemini.js";

export const generateQuiz = async (req, res) => {
  try {
    const { content, subject = "", userId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "No content" });

    const prompt = `
Create 5 MCQs from the content.
Each item: {"question":"...","options":["A","B","C","D"],"answer":"<one of options>"}

Content:
${content}

Return JSON array ONLY.
`;
    const questions = await geminiJSON(prompt);
    const quiz = await Quiz.create({ userId, subject, questions });
    res.json({ questions, quizId: quiz._id });
  } catch (e) {
    console.error("generateQuiz:", e.message);
    res.status(500).json({ error: "Quiz generation failed" });
  }
};
