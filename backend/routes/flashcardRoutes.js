// backend/routes/flashcardRoutes.js
import express from "express";
import Flashcard from "../models/Flashcard.js";
import { geminiJSON } from "../utils/gemini.js";

const router = express.Router();

/**
 * Generate flashcards with Gemini + save
 * POST /api/flashcards/generate
 * body: { userId, subject, content }
 */
router.post("/generate", async (req, res) => {
  try {
    const { userId, subject = "", content = "" } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "content required" });

    const prompt = `
Create 6 concise Q/A flashcards from this content:
${content}

Return ONLY valid JSON:
[
  {"question":"...","answer":"..."}
]`;

    let cards;
    try {
      cards = await geminiJSON(prompt);
      if (!Array.isArray(cards)) throw new Error("Invalid JSON from Gemini");
    } catch (e) {
      console.warn("Gemini failed, returning fallback cards:", e?.message || e);
      cards = [
        { question: "Sample Q1", answer: "Sample A1" },
        { question: "Sample Q2", answer: "Sample A2" },
      ];
    }

    const flashcards = await Flashcard.create({ userId, subject, cards });
    res.json({ flashcards });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Flashcard generation failed" });
  }
});

/**
 * List by user (explicit path to avoid conflicts)
 * GET /api/flashcards/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const list = await Flashcard.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error("flashcards list error:", e);
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

/**
 * Get a single flashcard by id
 * GET /api/flashcards/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const doc = await Flashcard.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    console.error("flashcard get error:", e);
    res.status(500).json({ error: "Failed to fetch flashcard" });
  }
});

/**
 * Delete by id
 * DELETE /api/flashcards/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error("flashcard delete error:", e);
    res.status(500).json({ error: "Failed to delete flashcards" });
  }
});

/**
 * Count by user
 * GET /api/flashcards/count/:userId
 */
router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Flashcard.countDocuments({ userId: req.params.userId });
    res.json({ count });
  } catch (e) {
    console.error("flashcards count error:", e);
    res.status(500).json({ error: "Failed to count flashcards" });
  }
});

export default router;
