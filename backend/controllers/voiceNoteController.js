// backend/controllers/voiceNoteController.js
import fs from "fs";
import VoiceNote from "../models/VoiceNote.js";
import { geminiTranscribeAudio, geminiText } from "../utils/gemini.js";

function pickMime(nameOrType = "") {
  const s = (nameOrType || "").toLowerCase();
  if (s.includes("audio/")) return nameOrType;
  if (s.endsWith(".wav")) return "audio/wav";
  if (s.endsWith(".mp3")) return "audio/mpeg";
  if (s.endsWith(".m4a")) return "audio/mp4";
  if (s.endsWith(".ogg")) return "audio/ogg";
  return "audio/webm";
}

// POST /api/voice/upload
export const processVoiceNote = async (req, res) => {
  const tmp = req.file?.path;
  const mime = pickMime(req.file?.mimetype || req.file?.originalname || "");
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const transcript = await geminiTranscribeAudio(tmp, mime);
    const summary = await geminiText(`Summarize in 3–5 bullet points:\n\n${transcript}`);

    // save in DB
    const userId = req.body?.userId || "guest";
    const saved = await VoiceNote.create({ userId, transcript, summary });

    return res.json({ transcript, summary, id: saved._id });
  } catch (e) {
    console.error("voice upload:", e.message);
    return res.status(500).json({ error: "Voice processing failed", details: e.message });
  } finally {
    if (tmp) { try { fs.unlinkSync(tmp); } catch {} }
  }
};

// GET /api/voice/:userId
export const getVoiceNotes = async (req, res) => {
  const { userId } = req.params;
  const items = await VoiceNote.find({ userId }).sort({ createdAt: -1 });
  res.json(items);
};

// DELETE /api/voice/:id
export const deleteVoiceNote = async (req, res) => {
  await VoiceNote.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
