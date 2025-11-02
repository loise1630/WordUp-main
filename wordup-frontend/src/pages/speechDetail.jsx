import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function SpeechDetail() {
  const [speech, setSpeech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpeech();
  }, [id]);

  const fetchSpeech = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/speech/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSpeech(data.speech);
      } else {
        setError('Speech not found');
      }

    } catch (err) {
      console.error('Error fetching speech:', err);
      setError('Failed to load speech');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Only pass original draft, not improved version
  const practiceNow = () => {
    navigate('/practice', {
      state: {
        preloadedSpeech: speech.originalDraft, // ✅ ONLY original draft
        speechId: speech._id
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-white/80 mt-6 text-xl">Loading speech...</p>
        </div>
      </div>
    );
  }

  if (error || !speech) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">⚠️</div>
          <p className="text-red-400 mb-6 text-xl">{error || 'Speech not found'}</p>
          <Link 
            to="/speeches" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300"
          >
            ← Back to Speeches
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = speech.originalDraft.trim().split(/\s+/).length;
  const improvedWordCount = speech.improvedVersion ? speech.improvedVersion.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="px-10 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Speech Details
          </h1>
          <nav className="space-x-6">
            <Link to="/dashboard" className="text-white/80 hover:text-white transition">Dashboard</Link>
            <Link to="/speeches" className="text-white/80 hover:text-white transition">My Speeches</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-10 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            {speech.title}
          </h1>
          <p className="text-xl text-white/80">Review your speech and start practicing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {new Date(speech.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600">Created</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 rounded-xl">
                <svg className="w-8 h-8 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{speech.practiceCount}</p>
                <p className="text-sm text-gray-600">Times Practiced</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{wordCount}</p>
                <p className="text-sm text-gray-600">Word Count</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {speech.lastPracticedAt ? new Date(speech.lastPracticedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                </p>
                <p className="text-sm text-gray-600">Last Practice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Speech Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Back Button */}
            <Link
              to="/speeches"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Speeches
            </Link>

            {/* Original Draft */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Original Draft
              </h3>
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {speech.originalDraft}
                </p>
              </div>
            </div>

            {/* Improved Version */}
            {speech.improvedVersion && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Improved Version
                  <span className="ml-2 text-sm font-normal text-gray-600">({improvedWordCount} words)</span>
                </h3>
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-500">
                  <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans text-lg">
                    {speech.improvedVersion}
                  </pre>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {speech.aiSuggestions && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Suggestions
                </h3>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {speech.aiSuggestions}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={practiceNow}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                </svg>
                Practice This Speech
              </button>
              <Link
                to="/improve"
                state={{ editSpeech: speech }}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Speech
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/60 text-sm border-t border-white/10 bg-black/20 backdrop-blur-sm">
        © {new Date().getFullYear()} Wordup. All rights reserved.
      </footer>
    </div>
  );
}