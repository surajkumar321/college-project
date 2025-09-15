import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUserId } from "./config";

import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Planner from "./pages/Planner";
import VoiceNotes from "./pages/VoiceNotes";

import NotesHistory from "./pages/history/NotesHistory";
import QuizHistory from "./pages/history/QuizHistory";
import FlashcardsHistory from "./pages/history/FlashcardsHistory";
import PlannerHistory from "./pages/history/PlannerHistory";
import VoiceHistory from "./pages/history/VoiceHistory";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const uid = getUserId();
  if (!uid) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
       <Navbar /> {/* ⬅️ always visible */}
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
        <Route path="/voice-notes" element={<ProtectedRoute><VoiceNotes /></ProtectedRoute>} />

        {/* Histories */}
        <Route path="/notes-history" element={<ProtectedRoute><NotesHistory /></ProtectedRoute>} />
        <Route path="/quiz-history" element={<ProtectedRoute><QuizHistory /></ProtectedRoute>} />
        <Route path="/flashcards-history" element={<ProtectedRoute><FlashcardsHistory /></ProtectedRoute>} />
        <Route path="/planner-history" element={<ProtectedRoute><PlannerHistory /></ProtectedRoute>} />
        <Route path="/voice-history" element={<ProtectedRoute><VoiceHistory /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
