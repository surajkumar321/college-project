import express from "express";
import Note from "../models/Notes.js";
import { geminiText } from "../utils/gemini.js";

const router = express.Router();

// Summarize + save
router.post("/summarize", async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "content required" });

    // Gemini summarization
    let summary;
    try {
      summary = await geminiText(`Summarize into 4-6 bullet points:\n${content}`);
      if (!summary || summary.length < 5) throw new Error("Invalid summary");
    } catch (e) {
      console.warn("Gemini error:", e.message);
      return res.status(502).json({ error: "Summarization failed" });
    }

    // Save with consistent fields
    const note = await Note.create({ userId, content, summary });
    res.json({ note, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
});

// List
router.get("/user/:userId", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Count
router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Note.countDocuments({ userId: req.params.userId });
    res.json({ count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to count notes" });
  }
});

export default router;
