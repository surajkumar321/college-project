import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    subject: { type: String, default: "" },
    examDate: { type: String, required: true }, // keep string (YYYY-MM-DD) for simplicity
    plan: [String] // ["Day 1: ...", "Day 2: ..."]
  },
  { timestamps: true }
);

export default mongoose.model("Planner", plannerSchema);
