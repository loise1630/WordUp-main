import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAIFeedback } from "../services/aiFeedback";

export default function Practice() {
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginPrompt(true);
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const startRecording = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setFeedback("⚠️ Speech recognition not supported. Use Chrome, Edge, or Safari.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      transcriptRef.current = fullTranscript;
      setTranscript(fullTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      setFeedback("⚠️ Error: " + event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      const finalTranscript = transcriptRef.current;
      if (finalTranscript && finalTranscript.trim().length > 0) {
        analyzeSpeech(finalTranscript);
      } else {
        setFeedback("⚠️ No speech detected. Please try again.");
      }
    };

    recognitionRef.current.start();
    setIsListening(true);
    transcriptRef.current = "";
    setTranscript("");
    setFeedback("");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const analyzeSpeech = async (text) => {
    if (!text || text.trim().length === 0) {
      setFeedback("⚠️ No speech detected.");
      return;
    }

    setFeedback("🤖 AI is analyzing your speech... Please wait...");

    try {
      const wordCount = text.trim().split(/\s+/).length;
      const charCount = text.length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = sentences.length || 1;

      const result = await getAIFeedback(text);

      if (result.success) {
        let feedbackText = `📈 QUICK STATS:\n`;
        feedbackText += `Words: ${wordCount} | Characters: ${charCount} | Sentences: ${sentenceCount}\n\n`;
        feedbackText += `─────────────────────────────────────\n\n`;
        feedbackText += result.feedback;
        
        setFeedback(feedbackText);
      } else {
        setFeedback(`⚠️ AI analysis unavailable: ${result.error}\n\nShowing basic analysis:\n\n📊 Word count: ${wordCount}\n📝 Sentences: ${sentenceCount}`);
      }

    } catch (error) {
      console.error("Analysis error:", error);
      setFeedback("❌ Error analyzing speech: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 hover:scale-105 transition-transform duration-300">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            SpeakUp
          </span>
        </h1>
        <nav className="flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/practice" 
                className="text-white font-semibold border-b-2 border-purple-400 pb-1"
              >
                Practice
              </Link>
              <Link 
                to="/history" 
                className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group"
              >
                History
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/improve" 
                className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group"
              >
                Improve
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-full backdrop-blur-sm border border-red-400/30 transition-all duration-300 hover:scale-105 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group"
              >
                Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 font-medium"
              >
                Register
              </Link>
              <Link 
                to="/practice" 
                className=""
              >
                Practice
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Login Prompt Modal */}
      {showLoginPrompt && !isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600">
                You need to log in first to access the Practice feature and get AI-powered feedback.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-full hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition font-bold"
              >
                Go Home
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Practice Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                SpeakUp Coach
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Practice your speech and get instant AI-powered feedback.
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-purple-900 font-medium">
                  <strong>Real-time Speech Recognition:</strong> Uses your browser's built-in speech recognition. 
                  Works instantly, no downloads needed! (Chrome, Edge, Safari)
                </p>
              </div>
            </div>
          </div>

          {/* Recorder */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="relative">
              <div className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                isListening
                  ? "bg-red-100 text-red-600 animate-pulse shadow-lg shadow-red-200"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  {isListening ? "Listening..." : "Ready to record"}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startRecording}
                disabled={isListening || !isLoggedIn}
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform disabled:transform-none flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Speaking
              </button>

              <button
                onClick={stopRecording}
                disabled={!isListening}
                className="px-10 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-xl hover:from-red-600 hover:to-pink-600 transition-all text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform disabled:transform-none flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop & Analyze
              </button>
            </div>

            {isListening && (
              <div className="mt-2 text-center">
                <p className="text-purple-600 font-bold animate-pulse flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Speak now... I'm listening!
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

          {/* Results */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-black text-gray-900">Transcript</h3>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl text-gray-700 shadow-inner min-h-[120px] whitespace-pre-wrap border border-gray-200">
                {transcript || "Your speech will appear here in real-time..."}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-black text-gray-900">Feedback & Analysis</h3>
              </div>
              <pre className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl text-gray-700 shadow-inner min-h-[250px] whitespace-pre-wrap font-mono text-sm border border-purple-200 leading-relaxed">
                {feedback || "Feedback will appear here after you stop speaking."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}