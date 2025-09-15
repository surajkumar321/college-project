// backend/routes/voiceNoteRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js"; // configured cloudinary (v2)
import VoiceNote from "../models/VoiceNote.js";
import { geminiTranscribeAudio, geminiText } from "../utils/gemini.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) { /* ignore */ }
}

/**
 * POST /api/voice/upload
 * form-data: audio file field "audio", optional userId
 */
router.post("/upload", upload.single("audio"), async (req, res) => {
  const file = req.file;
  const userId = req.body?.userId || "unknown";

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = file.path;
  const originalName = file.originalname || file.filename;
  const ext = path.extname(originalName).toLowerCase();

  try {
    // 1) Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "ai-study-assistant/voice-notes",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    const audioUrl = uploadRes.secure_url || uploadRes.url || "";
    const audioPublicId = uploadRes.public_id || "";

    // 2) Transcribe with Gemini (use local file bytes)
    let transcript = "";
    try {
      const mime = file.mimetype || (ext === ".ogg" ? "audio/ogg" : "audio/webm");
      transcript = await geminiTranscribeAudio(filePath, mime);
      // small normalization
      transcript = (transcript || "").trim();
    } catch (e) {
      console.warn("Transcription failed:", e?.message || e);
      transcript = ""; // fallback empty
    }

    // remove local temp file now (we've already uploaded to cloudinary)
    safeUnlink(filePath);

    // 3) Create a robust prompt for summary — IMPORTANT: be strict & explicit
    let summary = "";
    try {
      if (transcript && transcript.trim().length > 5) {
        const prompt = `
You are an expert study assistant. Produce 4 to 6 short concise bullet points that capture the important facts, definitions or steps from the transcript.
- Output ONLY the bullet points (each on its own line starting with a hyphen).
- Do NOT ask for the transcript again and do NOT output anything else.
- Keep each bullet no longer than two short sentences.

Transcript:
${transcript}
        `.trim();

        summary = await geminiText(prompt);
        // If model returns full sentence or extra text, try to keep only bullet lines
        if (summary && !summary.includes("\n")) {
          // If not multiline, ensure at least simple split by sentence
          const cand = summary.split(/(?:\.\s+)/).slice(0, 6).map(s => s.trim()).filter(Boolean);
          summary = cand.map(s => (s.startsWith("-") ? s : `- ${s}`)).join("\n");
        }
      } else {
        summary = "";
      }
    } catch (e) {
      console.warn("Summary failed:", e?.message || e);
      // fallback: take first 200 chars of transcript as fallback summary
      summary = transcript ? transcript.slice(0, 200) + "..." : "";
    }

    // 4) Save doc
    const note = await VoiceNote.create({
      userId,
      audioUrl,
      audioPublicId,
      transcript,
      summary,
      originalFilename: originalName,
    });

    return res.json({ ok: true, note, transcript, summary, audioUrl, audioPublicId });
  } catch (err) {
    console.error("Voice upload error:", err);
    // ensure cleanup
    safeUnlink(filePath);
    // send error detail (not secret values)
    return res.status(500).json({ error: "Upload/transcription failed", detail: (err && err.message) ? err.message : err });
  }
});

/** GET list */
router.get("/user/:userId", async (req, res) => {
  try {
    const list = await VoiceNote.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    console.error("voice list error:", e);
    return res.status(500).json({ error: "Failed to fetch voice notes" });
  }
});

/** GET count */
router.get("/count/:userId", async (req, res) => {
  try {
    const count = await VoiceNote.countDocuments({ userId: req.params.userId });
    return res.json({ count });
  } catch (e) {
    console.error("voice count error:", e);
    return res.status(500).json({ error: "Failed to count voice notes" });
  }
});

/** DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const note = await VoiceNote.findById(id);
    if (!note) return res.status(404).json({ error: "Not found" });

    try {
      if (note.audioPublicId) {
        await cloudinary.uploader.destroy(note.audioPublicId, { resource_type: "auto" });
      }
    } catch (e) {
      console.warn("Cloudinary delete failed:", e?.message || e);
    }

    await VoiceNote.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (e) {
    console.error("delete voice note error:", e);
    return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
