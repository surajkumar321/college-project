import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    subject: { type: String, default: "" },
    cards: [
      {
        question: String,
        answer: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Flashcard", flashcardSchema);
