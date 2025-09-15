import Planner from "../models/Planner.js";
import { geminiJSON } from "../utils/gemini.js";

export const generatePlanner = async (req, res) => {
  try {
    const { subject = "", syllabus = "", examDate = "", userId } = req.body;
    if (!syllabus?.trim() || !examDate) return res.status(400).json({ error: "syllabus & examDate required" });

    const prompt = `
Subject: ${subject}
Syllabus:
${syllabus}

Exam date: ${examDate}

Create a day-wise plan from today till exam.
Return JSON array of strings ONLY, like:
["Day 1: ...","Day 2: ...",...]
Include revision near the end.
`;
    const plan = await geminiJSON(prompt);
    const saved = await Planner.create({ userId, subject, examDate, plan });
    res.json({ plan, id: saved._id });
  } catch (e) {
    console.error("generatePlanner:", e.message);
    res.status(500).json({ error: "Study Planner generation failed" });
  }
};
