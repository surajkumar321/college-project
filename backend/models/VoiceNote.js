// backend/models/VoiceNote.js
import mongoose from "mongoose";

const VoiceNoteSchema = new mongoose.Schema({
  userId: { type: String, default: "unknown" },
  audioUrl: { type: String },
  audioPublicId: { type: String },
  originalFilename: { type: String },
  transcript: { type: String },
  summary: { type: String },
}, { timestamps: true });

export default mongoose.model("VoiceNote", VoiceNoteSchema);
