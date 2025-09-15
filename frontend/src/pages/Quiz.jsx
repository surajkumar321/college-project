// frontend/src/pages/Quiz.jsx
import { useState } from "react";
import { API, getUserId } from "../config";

export default function QuizGenerator() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([]); // always array
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const extractQuestionText = (q) => {
    // try many possible keys
    return (
      q?.question ??
      q?.prompt ??
      q?.q ??
      q?.text ??
      q?.questionText ??
      q?.title ??
      ""
    );
  };

  const extractOptions = (q) => {
    if (Array.isArray(q?.options)) return q.options;
    // sometimes backend returns object like {A: '...', B:'...'} -> convert to array
    if (q && typeof q === "object") {
      const keys = Object.keys(q).filter(k => ["A","B","C","D","options"].includes(k) === false);
    }
    return [];
  };

  const generateQuiz = async () => {
    setErr("");
    setQuestions([]);
    const userId = getUserId();
    if (!userId) {
      setErr("User not logged in. Please login.");
      return;
    }
    if (!content.trim()) {
      setErr("Please paste some study content first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subject, content }),
      });

      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); } catch { data = { raw: rawText }; }

      console.log("quiz generate response:", res.status, data);

      if (!res.ok) {
        setErr(data?.error || `Generation failed: ${res.status}`);
        return;
      }

      // possible shapes:
      // 1) { questions: [...] }
      // 2) { quiz: { questions: [...] } }
      // 3) raw array [...]
      // 4) { quiz: {...} } fallback
      let qArr = [];
      if (Array.isArray(data)) qArr = data;
      else if (Array.isArray(data?.questions)) qArr = data.questions;
      else if (Array.isArray(data?.quiz?.questions)) qArr = data.quiz.questions;
      else if (Array.isArray(data?.quiz)) qArr = data.quiz;
      else if (Array.isArray(data?.items)) qArr = data.items;
      else qArr = [];

      // if qArr empty, try to parse raw text for JSON-like array
      if (!qArr.length && typeof data?.raw === "string") {
        try {
          const maybe = JSON.parse(data.raw);
          if (Array.isArray(maybe)) qArr = maybe;
        } catch {}
      }

      // Finally map/normalize so frontend has consistent shape
      const normalized = qArr.map((item) => {
        const text = extractQuestionText(item) || "";
        const opts = Array.isArray(item?.options) ? item.options : (item?.opts || []);
        const answer = item?.answer || item?.ans || item?.correct || "";
        return { question: text, options: opts, answer };
      });

      if (!normalized.length) {
        setErr("No questions returned or could not parse response. Check server logs / console.");
        // show raw response below for debugging
        setQuestions([{ question: `Raw response: ${JSON.stringify(data).slice(0,300)}` }]);
      } else {
        setQuestions(normalized);
      }
    } catch (e) {
      console.error("generateQuiz error:", e);
      setErr("Something went wrong while generating quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Quiz Generator</h2>

      <label className="block mb-2">Subject (optional)</label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border p-2 w-full mb-4"
        placeholder="e.g. Computer Science"
      />

      <label className="block mb-2">Paste your study material...</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="border p-2 w-full mb-4"
        placeholder="Paste notes / lecture text here..."
      />

      <button
        onClick={generateQuiz}
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate & Save"}
      </button>

      {err && <p className="mt-3 text-red-600">{err}</p>}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Questions</h3>

        {questions.length === 0 && !err && <p className="text-gray-600">No questions yet.</p>}

        <ol className="list-decimal pl-6 space-y-4">
          {questions.map((q, i) => (
            <li key={i} className="bg-white p-4 rounded shadow">
              <p className="font-semibold">{q.question || "Question text missing"}</p>

              {Array.isArray(q.options) && q.options.length > 0 ? (
                <ul className="pl-4 list-disc mt-2">
                  {q.options.map((opt, j) => (<li key={j}>{opt}</li>))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 mt-2">Options not provided</p>
              )}

              {q.answer && <p className="text-green-700 mt-2">Answer: {q.answer}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
