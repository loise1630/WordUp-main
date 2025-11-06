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

  // ✅ Helper function to extract ONLY the enhanced script
  const extractEnhancedScript = (aiResponse) => {
    if (!aiResponse) return null;
    
    // Try to extract the enhanced/improved version from different formats
    const versionPatterns = [
      /(?:IMPROVED|ENHANCED|CORRECTED|ACADEMIC|CONVERSATIONAL|PERSUASIVE|CONCISE|FORMAL)\s+VERSION:\s*\n([\s\S]*?)(?:\n\n[A-Z\s]+:|$)/i,
      /(?:IMPROVED|ENHANCED|CORRECTED|ACADEMIC|CONVERSATIONAL|PERSUASIVE|CONCISE|FORMAL)\s+VERSION:\s*([\s\S]*?)(?:\n\n[A-Z\s]+:|$)/i
    ];

    for (const pattern of versionPatterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    const firstSectionMatch = aiResponse.match(/^([\s\S]*?)(?:\n\n[A-Z\s]+:|$)/);
    if (firstSectionMatch && firstSectionMatch[1]) {
      const content = firstSectionMatch[1].trim();
      if (content.length > 50) {
        return content;
      }
    }

    return aiResponse;
  };

  // ✅ UPDATED: Extract only enhanced script before navigating
  const practiceNow = () => {
    const enhancedScript = extractEnhancedScript(speech.improvedVersion) || speech.originalDraft;
    
    navigate('/practice', {
      state: {
        preloadedSpeech: enhancedScript,
        speechId: speech._id,
        title: speech.title
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-white mt-6 text-lg font-semibold">Loading speech...</p>
        </div>
      </div>
    );
  }

  if (error || !speech) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl max-w-md">
          <span className="text-7xl mb-6 block">⚠️</span>
          <p className="text-red-600 mb-6 text-lg font-bold">{error || 'Speech not found'}</p>
          <Link 
            to="/speeches" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-lg"
          >
            ← Back to Speeches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6 bg-gray-900 bg-opacity-50 backdrop-blur-md border-b border-purple-500 border-opacity-20">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 p-2 rounded-lg">📄</span>
          Speech Details
        </h1>
        <nav className="space-x-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-white transition font-semibold">Dashboard</Link>
          <Link to="/speeches" className="text-gray-300 hover:text-white transition font-semibold">My Speeches</Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-10 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/speeches"
            className="inline-flex items-center text-purple-300 hover:text-white mb-6 font-semibold transition"
          >
            ← Back to Speeches
          </Link>

          {/* Speech Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            {/* Title */}
            <h2 className="text-3xl font-black text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {speech.title}
            </h2>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(speech.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {speech.practiceCount} practice{speech.practiceCount !== 1 ? 's' : ''}
              </span>
              {speech.lastPracticedAt && (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(speech.lastPracticedAt).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {speech.originalDraft.trim().split(/\s+/).length} words
              </span>
            </div>

            {/* Original Draft */}
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 p-2 rounded-lg">📝</span>
                Original Draft
              </h3>
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                  {speech.originalDraft}
                </p>
              </div>
            </div>

            {/* Improved Version */}
            {speech.improvedVersion && (
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-lg">✨</span>
                  Improved Version
                </h3>
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-lg">
                  <pre className="text-gray-800 whitespace-pre-wrap leading-relaxed font-sans font-medium">
                    {speech.improvedVersion}
                  </pre>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {speech.aiSuggestions && (
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 p-2 rounded-lg">💡</span>
                  AI Suggestions
                </h3>
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-lg">
                  <pre className="text-gray-800 whitespace-pre-wrap leading-relaxed font-sans text-sm">
                    {speech.aiSuggestions}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={practiceNow}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Practice This Speech
              </button>
              <Link
                to="/improve"
                state={{ editSpeech: speech }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition font-bold shadow-xl hover:shadow-2xl hover:scale-105 text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Speech
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}