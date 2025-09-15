// backend/routes/plannerRoutes.js
import express from "express";
import Planner from "../models/Planner.js";
import { geminiJSON } from "../utils/gemini.js";

const router = express.Router();

/**
 * Create planner (POST /api/planner/generate)
 */
router.post("/generate", async (req, res) => {
  try {
    const { subject = "", syllabus = "", examDate = "", userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const prompt = `
Create a daily study plan for subject "${subject}".
Syllabus:
${syllabus}
Exam date: ${examDate}

Distribute topics sensibly from today until the exam.
Return STRICT JSON array of strings only:
["Day 1: ...", "Day 2: ...", "Day 3: ..."]`.trim();

    let plan = null;
    try {
      plan = await geminiJSON(prompt, "gemini-1.5-flash");
      if (!Array.isArray(plan) || plan.length === 0) {
        console.warn("Gemini: invalid plan response, using fallback");
        plan = null;
      }
    } catch (e) {
      console.warn("Gemini error (planner):", e?.message || e);
      plan = null;
    }

    if (!Array.isArray(plan)) {
      plan = [
        "Day 1: Revise key definitions and concepts",
        "Day 2: Practice basic problems",
        "Day 3: Cover next set of topics and take short quiz",
        "Day 4: Revise previous topics and solve mixed exercises",
        "Day 5: Mock test and review mistakes"
      ];
    }

    const doc = await Planner.create({ userId, subject, examDate, plan });
    return res.json({ planner: doc });
  } catch (err) {
    console.error("Planner route error:", err);
    return res.status(500).json({ error: "Planner generation failed (server error)" });
  }
});

/**
 * Get planners for a user
 * Support both /user/:userId and /:userId so frontend variations work
 */
async function getPlannersForUser(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: "userId required in params" });

    const planners = await Planner.find({ userId }).sort({ createdAt: -1 });
    return res.json(Array.isArray(planners) ? planners : []);
  } catch (err) {
    console.error("Planner list error:", err);
    return res.status(500).json({ error: "Failed to fetch planners" });
  }
}

router.get("/user/:userId", getPlannersForUser);
router.get("/:userId", getPlannersForUser);

/**
 * Delete a plan by id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Planner.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Planner delete error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
