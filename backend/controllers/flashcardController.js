import Flashcard from "../models/Flashcard.js";
import { geminiJSON } from "../utils/gemini.js";

export const generateFlashcards = async (req, res) => {
  try {
    const { content, subject = "", userId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "No content" });

    const prompt = `
Make 6 Q/A flashcards from the content.
Each item: {"question":"...","answer":"..."}

Content:
${content}

Return JSON array ONLY.
`;
    const cards = await geminiJSON(prompt);
    const saved = await Flashcard.create({ userId, subject, cards });
    res.json({ cards, id: saved._id });
  } catch (e) {
    console.error("generateFlashcards:", e.message);
    res.status(500).json({ error: "Flashcard generation failed" });
  }
};
