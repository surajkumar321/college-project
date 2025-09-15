// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { API, getUserId } from "../config";

export default function Dashboard() {
  const [counts, setCounts] = useState({ notes: 0, quiz: 0, flashcards: 0, voice: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) return;

      const [nRes, qRes, fRes, vRes] = await Promise.all([
        fetch(`${API}/notes/count/${userId}`).then(r => r.json()),
        fetch(`${API}/quiz/count/${userId}`).then(r => r.json()),
        fetch(`${API}/flashcards/count/${userId}`).then(r => r.json()),
        fetch(`${API}/voice/count/${userId}`).then(r => r.json()),
      ]);

      setCounts({
        notes: nRes.count ?? 0,
        quiz: qRes.count ?? 0,
        flashcards: fRes.count ?? 0,
        voice: vRes.count ?? 0,
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  fetchCounts(); // initial load
  const handler = () => fetchCounts();
  window.addEventListener("data-changed", handler);
  return () => window.removeEventListener("data-changed", handler);
}, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <nav className="space-y-4">
          <Link to="/notes" className="block text-gray-700 hover:text-indigo-600">📝 Notes</Link>
          <Link to="/quiz" className="block text-gray-700 hover:text-indigo-600">📚 Quiz</Link>
          <Link to="/flashcards" className="block text-gray-700 hover:text-indigo-600">🃏 Flashcards</Link>
          <Link to="/planner" className="block text-gray-700 hover:text-indigo-600">📅 Planner</Link>
          <Link to="/voice-notes" className="block text-gray-700 hover:text-indigo-600">🎤 Voice Notes</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
        <p className="text-gray-600 mb-6">Here’s your study overview</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">Notes Summarized</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-indigo-600">{loading ? "..." : counts.notes}</p>
              <Link to="/notes-history" className="text-sm text-indigo-500 hover:underline">View →</Link>
            </div>
          </div>

          {/* Quizzes */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">Quizzes Generated</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">{loading ? "..." : counts.quiz}</p>
              <Link to="/quiz-history" className="text-sm text-green-500 hover:underline">View →</Link>
            </div>
          </div>

          {/* Voice Notes */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">Voice Notes</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-purple-600">{loading ? "..." : counts.voice}</p>
              <Link to="/voice-history" className="text-sm text-blue-600 hover:underline">View →</Link>
            </div>
          </div>

          {/* Flashcards */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">Flashcards Created</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-pink-600">{loading ? "..." : counts.flashcards}</p>
              <Link to="/flashcards-history" className="text-sm text-pink-500 hover:underline">View →</Link>
            </div>
          </div>
        </div>

        {/* Planner Preview */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Upcoming Study Plan 📅</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Day 1: Revise Chapter 1 & 2</li>
            <li>Day 2: Practice MCQs from Unit 1</li>
            <li>Day 3: Summarize lecture notes for Unit 2</li>
          </ul>
          <div className="mt-4 text-right">
            <Link to="/planner-history" className="text-sm text-indigo-500 hover:underline">View Full Planner →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
