import Notes from "../models/Notes.js";
import { geminiText } from "../utils/gemini.js";

export const summarizeNotes = async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "No content" });

    const prompt = `Summarize the notes into 4–6 concise bullet points.\n\n${content}`;
    const summary = await geminiText(prompt);

    const note = await Notes.create({ userId, content, summary });
    return res.json({ summary, noteId: note._id });
  } catch (e) {
    console.error("summarizeNotes:", e.message);
    res.status(500).json({ error: "Summarization failed" });
  }
};
