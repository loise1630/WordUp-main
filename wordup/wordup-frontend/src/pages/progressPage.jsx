import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [difficultSentences, setDifficultSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, sentences, trends
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchProgress();
    fetchDifficultSentences();
  }, [navigate]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/progress/overall', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDifficultSentences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/progress/difficult-sentences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setDifficultSentences(data.difficultSentences);
      }
    } catch (error) {
      console.error('Error fetching difficult sentences:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
          <p className="text-white mt-4 text-lg font-semibold">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Header currentPage="Progress" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-white mb-3">📊 Your Progress</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {['overview', 'sentences', 'trends'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                activeTab === tab
                  ? 'bg-white text-purple-600 shadow-xl'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && progress && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 rounded-xl p-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{progress.totalPractices}</p>
                <p className="text-sm text-gray-600 font-medium">Total Practices</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-xl p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{progress.latestScore}</p>
                <p className="text-sm text-gray-600 font-medium">Latest Score</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-xl p-3 ${progress.improvement >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${progress.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className={`text-4xl font-black mb-1 ${progress.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {progress.improvement > 0 ? '+' : ''}{progress.improvement}
                </p>
                <p className="text-sm text-gray-600 font-medium">Improvement</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 rounded-xl p-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{progress.difficultSentences?.length || 0}</p>
                <p className="text-sm text-gray-600 font-medium">Difficult Sentences</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('sentences')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition border border-purple-200"
                >
                  <div className="bg-purple-600 text-white rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Practice Sentences</p>
                    <p className="text-sm text-gray-600">Focus on difficult ones</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('trends')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition border border-blue-200"
                >
                  <div className="bg-blue-600 text-white rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">View Trends</p>
                    <p className="text-sm text-gray-600">See your improvement</p>
                  </div>
                </button>

                <Link
                  to="/practice"
                  className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition border border-green-200"
                >
                  <div className="bg-green-600 text-white rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">New Practice</p>
                    <p className="text-sm text-gray-600">Start a session</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Difficult Sentences Tab */}
        {activeTab === 'sentences' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">⚠️ Difficult Sentences</h2>
            
            {difficultSentences.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎉</div>
                <p className="text-gray-700 text-lg font-bold mb-2">No Difficult Sentences!</p>
                <p className="text-gray-600">You haven't flagged any sentences as difficult yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {difficultSentences.map((sentence, idx) => (
                  <div
                    key={idx}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-900 mb-2">"{sentence.text}"</p>
                        <p className="text-sm text-gray-600">From: <span className="font-semibold">{sentence.speechTitle}</span></p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                        {sentence.attempts} attempts
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Best Score</p>
                        <p className="text-2xl font-black text-blue-600">{sentence.bestScore}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Last Score</p>
                        <p className="text-2xl font-black text-purple-600">{sentence.lastScore}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Average</p>
                        <p className="text-2xl font-black text-green-600">
                          {Math.round(sentence.scores.reduce((a, b) => a + b, 0) / sentence.scores.length)}
                        </p>
                      </div>
                    </div>

                    {sentence.notes && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-4 border-l-4 border-yellow-400">
                        <p className="text-sm text-gray-700"><strong>Notes:</strong> {sentence.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        to="/practice"
                        state={{ 
                          targetSentence: sentence.text,
                          speechId: sentence.speechId 
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition font-semibold text-center"
                      >
                        Practice This Sentence
                      </Link>
                      <Link
                        to={`/speeches/${sentence.speechId}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                      >
                        View Speech
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && progress && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">📈 Improvement Trends</h2>
            
            {progress.improvementTrend && progress.improvementTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progress.improvementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="practice" label={{ value: 'Practice Session', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #9333ea',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Not enough data to show trends. Keep practicing!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}