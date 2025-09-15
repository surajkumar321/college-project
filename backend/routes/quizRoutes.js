// backend/routes/quizRoutes.js
import express from "express";
import Quiz from "../models/Quiz.js";
import { geminiJSON } from "../utils/gemini.js";

const router = express.Router();

/**
 * POST /api/quiz/generate
 * body: { userId, subject?, content }  <-- content is the source text to make MCQs from
 */
router.post("/generate", async (req, res) => {
  try {
    const { userId, subject = "", content = "" } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!content || !content.trim()) return res.status(400).json({ error: "content required" });

    const prompt = `
Create 5 multiple-choice questions (MCQs) from the following content.
Return ONLY valid JSON array like:
[
  {"question":"...","options":["A","B","C","D"],"answer":"Exact option text"}
]

Content:
${content}
    `.trim();

    // 1) Call Gemini and get raw response (may be malformed)
    let questions = [];
    try {
      questions = await geminiJSON(prompt);
      if (!Array.isArray(questions)) throw new Error("invalid JSON from Gemini");
    } catch (e) {
      // log warning and fall back to safe demo questions so UX doesn't break in dev/quota situations
      console.warn("Gemini failed or returned invalid JSON:", e?.message || e);
      questions = [
        { question: "Sample question 1?", options: ["Opt A","Opt B","Opt C","Opt D"], answer: "Opt A" },
        { question: "Sample question 2?", options: ["Opt A","Opt B","Opt C","Opt D"], answer: "Opt B" },
      ];
    }

    // 2) NORMALIZE each item into shape { question: string, options: string[], answer: string }
    questions = questions.map((it) => {
      if (typeof it === "string") {
        return { question: it, options: [], answer: "" };
      }

      const qText = it.question || it.prompt || it.q || it.text || "";
      let opts = Array.isArray(it.options) ? it.options : (it.opts || []);

      if (!Array.isArray(opts)) {
        // if options provided as object like {A:'..',B:'..'} turn to array
        if (opts && typeof opts === "object") opts = Object.values(opts);
        else opts = [];
      }

      const ans = it.answer || it.ans || it.correct || "";

      // ensure strings (defensive)
      return {
        question: typeof qText === "string" ? qText : JSON.stringify(qText),
        options: opts.map((o) => (typeof o === "string" ? o : String(o))),
        answer: typeof ans === "string" ? ans : String(ans),
      };
    });

    // 3) Save to DB
    const quiz = await Quiz.create({
      userId,
      subject,
      source: content.slice(0, 400), // small preview
      questions,
    });

    return res.json({ quiz });
  } catch (err) {
    console.error("generate error:", err);
    return res.status(500).json({ error: "Quiz generation failed" });
  }
});

/** Count endpoint */
router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Quiz.countDocuments({ userId: req.params.userId });
    res.json({ count });
  } catch (err) {
    console.error("count error:", err);
    res.status(500).json({ error: "Failed to count quizzes" });
  }
});

/** List for a user (explicit path to avoid conflicts) */
router.get("/user/:userId", async (req, res) => {
  try {
    const list = await Quiz.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ quizzes: list });
  } catch (err) {
    console.error("list error:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

/** Delete a quiz by id */
router.delete("/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete error:", err);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
});

export default router;
