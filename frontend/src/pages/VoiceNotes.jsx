import { useState, useRef, useEffect } from "react";
import { getUserId } from "../config"; 
import { API } from "../config";

// Helper function: agar transcript chhota ya bekar hai, to ignore karo
const cleanTranscript = (t) => (t && t.length > 3 ? t : "");

export default function VoiceNotes() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const pickSupportedMime = () => {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
      return "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus"))
      return "audio/ogg;codecs=opus";
    return "";
  };

  const startRecording = async () => {
    try {
      setErr("");
      setTranscript("");
      setSummary("");
      setAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMime();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      chunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };

      mr.onstop = () => {
        const type = mr.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        chunks.current = [];
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const ext = type.includes("ogg") ? "ogg" : "webm";
        uploadAudio(blob, ext);
      };

      mr.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      setErr("Microphone permission denied or not available.");
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
      streamRef.current = null;
    } catch (e) {
      console.error(e);
    }
  };

  const uploadAudio = async (blob, ext = "webm") => {
    try {
      setLoading(true);
      setErr("");
      const formData = new FormData();
      formData.append("audio", blob, `lecture.${ext}`); // IMPORTANT: field "audio"
      formData.append("userId", getUserId() || "123");

      const res = await fetch(`${API}/voice/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const data = await res.json();

      // ✅ Clean transcript before setting
      setTranscript(cleanTranscript(data.transcript));
      setSummary(data.summary ?? "");
    } catch (e) {
      console.error(e);
      setErr("Upload or transcription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">Voice to Notes</h2>

      {!recording ? (
        <button
          onClick={startRecording}
          className="bg-red-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          ⏹ Stop Recording
        </button>
      )}

      {loading && <p className="mt-3 text-blue-600">Processing...</p>}
      {err && <p className="mt-3 text-red-600">{err}</p>}

      {audioUrl && (
        <div className="mt-4">
          <h3 className="font-bold">Recorded Audio:</h3>
          <audio src={audioUrl} controls />
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-4 border bg-gray-50 rounded">
          <h3 className="font-bold">Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-4 border bg-green-50 rounded">
          <h3 className="font-bold">AI Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
