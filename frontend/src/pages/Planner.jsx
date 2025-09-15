// frontend/src/pages/Planner.jsx
import { useState } from "react";
import { API, getUserId } from "../config"; // adjust path if your config is in a different folder
import { Link } from "react-router-dom";

export default function Planner() {
  const [subject, setSubject] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const generatePlan = async () => {
    setError("");
    setSuccessMsg("");
    setPlan(null);

    const userId = getUserId();
    if (!userId) {
      setError("User not signed in (userId missing). Please login first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/planner/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subject,
          syllabus,
          examDate,
        }),
      });

      if (!res.ok) {
        // try to read JSON error if possible
        let text;
        try {
          text = await res.json();
        } catch {
          text = await res.text();
        }
        throw new Error(text?.error || text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // backend returns { planner: doc } in our routes sample
      const planner = data?.planner || data?.planner?.plan || data?.plan || null;

      // Planner doc shape can vary; normalize for display:
      let finalPlan = null;
      if (data?.planner?.plan && Array.isArray(data.planner.plan)) {
        finalPlan = data.planner.plan;
      } else if (Array.isArray(planner)) {
        finalPlan = planner;
      } else if (data?.planner?.plan && typeof data.planner.plan === "string") {
        finalPlan = [data.planner.plan];
      } else if (Array.isArray(data?.plan)) {
        finalPlan = data.plan;
      }

      // if not parsed, backend uses fallback; still show whatever returned
      if (!finalPlan) {
        // maybe backend returned planner document
        if (data?.planner?.plan) finalPlan = Array.isArray(data.planner.plan) ? data.planner.plan : [String(data.planner.plan)];
        else finalPlan = ["Could not parse plan from server response."];
      }

      setPlan(finalPlan);
      setSuccessMsg("Plan generated and saved.");
      // notify other parts (counts) to refresh
      window.dispatchEvent(new Event("data-changed"));
    } catch (err) {
      console.error("Generate plan error:", err);
      setError(typeof err === "string" ? err : err?.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Study Planner</h2>

      <label className="block mb-2 text-sm">Subject</label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="e.g. Math"
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 text-sm">Enter syllabus / topics</label>
      <textarea
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        placeholder="Paste syllabus or topics..."
        rows={6}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 text-sm">Exam date (optional)</label>
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={generatePlan}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Plan"}
        </button>

        <Link to="/planner-history" className="text-sm text-indigo-600 hover:underline">
          View Saved Plans →
        </Link>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}

      {plan && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Generated Study Plan</h3>
          <ol className="list-decimal pl-6">
            {plan.map((line, i) => (
              <li key={i} className="mb-1">
                {String(line)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
