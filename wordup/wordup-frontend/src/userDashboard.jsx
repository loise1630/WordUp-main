import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
    fetchSpeeches();
  }, [navigate]);

  const fetchUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchSpeeches = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/speech', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSpeeches(data.speeches);
      } else {
        setError('Failed to load speeches');
      }

    } catch (err) {
      console.error('Error fetching speeches:', err);
      setError('Failed to load speeches');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const practiceCount = speeches.reduce((sum, speech) => sum + speech.practiceCount, 0);
  const totalSpeeches = speeches.length;
  const recentSpeeches = speeches.slice(0, 5);

  const downloadPDF = (speech) => {
    const doc = new jsPDF();

    doc.text(`WordUP Speech Report: ${speech.title}`, 10, 10);
    doc.text(`User: ${user?.name || 'Unknown'}`, 10, 20);
    doc.text(`Date: ${new Date(speech.createdAt).toLocaleDateString()}`, 10, 30);
    doc.text(`Practice Count: ${speech.practiceCount}`, 10, 40);
    if (speech.improvedVersion) {
      doc.text(`Improved Version: Available`, 10, 50);
    }

    doc.save(`wordup_speech_${speech._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl px-3 py-2 rounded-lg">
                W
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WordUP</h1>
                <p className="text-xs text-gray-500">Your AI Speaking Coach</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition font-medium">Home</Link>
              <Link to="/dashboard" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Dashboard</Link>
              <Link to="/practice" className="text-gray-600 hover:text-blue-600 transition font-medium">Practice</Link>
              <Link to="/history" className="text-gray-600 hover:text-blue-600 transition font-medium">History</Link>
              <Link to="/improve" className="text-gray-600 hover:text-blue-600 transition font-medium">Improve</Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">👋</span>
              <h2 className="text-3xl font-bold">
                Welcome back, {user?.name || 'User'}!
              </h2>
            </div>
            <p className="text-blue-100 text-lg">
              Ready to level up your English fluency today?
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Speeches */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Speeches</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{totalSpeeches}</p>
            <p className="text-sm text-gray-500">Total speeches created</p>
          </div>

          {/* Practice Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Sessions</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{practiceCount}</p>
            <p className="text-sm text-gray-500">Practice sessions completed</p>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">This Week</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">
              {speeches.filter(s => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(s.createdAt) > weekAgo;
              }).length}
            </p>
            <p className="text-sm text-gray-500">Speeches this week</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/improve"
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Improve</p>
                  <p className="text-sm text-gray-600">Get AI feedback</p>
                </div>
              </div>
            </Link>

            <Link
              to="/practice"
              className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-green-100"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Practice</p>
                  <p className="text-sm text-gray-600">Start speaking</p>
                </div>
              </div>
            </Link>

            <Link
              to="/history"
              className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-100"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">History</p>
                  <p className="text-sm text-gray-600">View sessions</p>
                </div>
              </div>
            </Link>

            <Link
              to="/speeches"
              className="group relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-orange-100"
            >
              <div className="flex items-center gap-4">
                <div className="bg-orange-600 text-white rounded-lg p-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">My Speeches</p>
                  <p className="text-sm text-gray-600">View library</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Speeches */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Recent Speeches
            </h3>
            <Link to="/speeches" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Loading your speeches...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">⚠️</span>
              <p className="text-red-500">{error}</p>
            </div>
          ) : recentSpeeches.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🎯</span>
              <p className="text-gray-600 text-lg mb-2 font-semibold">Start Your Journey</p>
              <p className="text-gray-500 mb-6">Create your first speech and begin improving your English fluency</p>
              <Link
                to="/improve"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Speech
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSpeeches.map((speech) => (
                <div
                  key={speech._id}
                  className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{speech.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(speech.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {speech.practiceCount} practice{speech.practiceCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/speeches/${speech._id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to="/practice"
                      state={{ preloadedSpeech: speech.improvedVersion || speech.originalDraft, speechId: speech._id }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md"
                    >
                      Practice
                    </Link>
                    <button 
                      onClick={() => downloadPDF(speech)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}