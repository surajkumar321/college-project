import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    subject: { type: String, default: "" },
    questions: [
      {
        question: String,
        options: [String],
        answer: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
