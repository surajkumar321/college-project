import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Notes", NotesSchema);
