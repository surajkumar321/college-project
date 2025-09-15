// src/pages/history/QuizHistory.jsx
import { useEffect, useState } from "react";
import { API, getUserId } from "../../config";

export default function QuizHistory() {
  const [list, setList] = useState(null);

  async function load() {
    const r = await fetch(`${API}/quiz/user/${getUserId()}`);
    const d = await r.json();
    // backend returns array; some variants return { quizzes: [...] } — handle both:
    setList(Array.isArray(d) ? d : d.quizzes ?? []);
  }
  useEffect(() => { load(); }, []);

  async function del(id) {
    if (!confirm("Delete this quiz?")) return;
    await fetch(`${API}/quiz/${id}`, { method: "DELETE" });
    setList(prev => prev.filter(x => x._id !== id));
    window.dispatchEvent(new Event("data-changed"));
  }

  if (!list) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Quiz History</h2>
      {list.length === 0 ? <p>No quizzes yet.</p> : list.map(q => (
        <div key={q._id} className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between">
            <p className="font-semibold">{q.subject || "Untitled"}</p>
            <button onClick={() => del(q._id)} className="text-red-600 underline">Delete</button>
          </div>
          <ol className="list-decimal pl-6 mt-2">
            {q.questions?.map((qq, i) => (
              <li key={i} className="mb-2">
                <p>{qq.question}</p>
                <p className="text-green-700">Answer: {qq.answer}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
