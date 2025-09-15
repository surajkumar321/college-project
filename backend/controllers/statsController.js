import Notes from "../models/Notes.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";

export const getStats = async (req, res) => {
  const { userId } = req.params;
  const [notes, quizzes, flashcards] = await Promise.all([
    Notes.countDocuments({ userId }),
    Quiz.countDocuments({ userId }),
    Flashcard.countDocuments({ userId }),
  ]);
  res.json({ notes, quizzes, flashcards });
};
