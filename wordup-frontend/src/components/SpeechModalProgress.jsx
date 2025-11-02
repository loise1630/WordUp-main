import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SpeechProgressModal({ isOpen, onClose, speechId, speechTitle }) {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && speechId) {
      fetchSpeechPractices();
    }
  }, [isOpen, speechId]);

  const fetchSpeechPractices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/practice/speech/${speechId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPractices(data.practices || []);
      }
    } catch (error) {
      console.error('Error fetching practices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const calculateComparison = () => {
    if (!practices || practices.length < 4) {
      return null;
    }

    const recentPractices = practices.slice(0, 5);
    const halfPoint = Math.floor(recentPractices.length / 2);
    
    const currentPractices = recentPractices.slice(0, halfPoint);
    const previousPractices = recentPractices.slice(halfPoint);

    const avgPrevious = previousPractices.reduce((sum, p) => sum + p.score, 0) / previousPractices.length;
    const avgCurrent = currentPractices.reduce((sum, p) => sum + p.score, 0) / currentPractices.length;
    
    const improvement = ((avgCurrent - avgPrevious) / avgPrevious) * 100;

    return {
      previous: avgPrevious.toFixed(1),
      current: avgCurrent.toFixed(1),
      improvement: improvement.toFixed(1),
      isImproved: improvement > 0,
      practices: {
        previous: previousPractices,
        current: currentPractices
      }
    };
  };

  const comparison = calculateComparison();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black mb-1">📊 Speech Progress</h2>
              <p className="text-purple-100 text-lg font-semibold">{speechTitle}</p>
              <p className="text-purple-200 text-sm">{practices.length} total practice{practices.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading progress...</p>
            </div>
          ) : practices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎤</div>
              <p className="text-gray-900 font-black text-xl mb-2">No Practice Yet</p>
              <p className="text-gray-600 mb-6">Start practicing this speech to track your progress</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/practice', { state: { speechId } });
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-lg"
              >
                Start Practicing
              </button>
            </div>
          ) : !comparison ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-900 font-black text-xl mb-2">Keep Practicing!</p>
              <p className="text-gray-600 mb-6">Practice at least 4 times to see detailed comparison</p>
              
              {/* Show existing practices */}
              <div className="max-w-md mx-auto mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Your Practices So Far:</h4>
                <div className="space-y-2">
                  {practices.map((practice, index) => (
                    <div key={practice._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 text-purple-600 rounded-lg w-10 h-10 flex items-center justify-center font-black text-sm">
                          #{practices.length - index}
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">
                            {new Date(practice.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg font-black ${
                        practice.score >= 90 ? 'bg-green-100 text-green-700' :
                        practice.score >= 75 ? 'bg-blue-100 text-blue-700' :
                        practice.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {practice.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/practice', { state: { speechId } });
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-lg"
              >
                Practice Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Improvement Overview */}
              <div className={`rounded-xl p-6 ${comparison.isImproved ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-4xl ${comparison.isImproved ? 'text-green-600' : 'text-orange-600'}`}>
                    {comparison.isImproved ? '🎉' : '💪'}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-xl">
                      {comparison.isImproved ? 'Great Progress!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-sm text-gray-600">Comparing your recent vs previous sessions</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 shadow-md text-center">
                    <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Previous Avg</p>
                    <p className="text-4xl font-black text-gray-700">{comparison.previous}%</p>
                    <p className="text-xs text-gray-500 mt-1">Last {comparison.practices.previous.length} sessions</p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <svg className={`w-12 h-12 ${comparison.isImproved ? 'text-green-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-md text-center">
                    <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Current Avg</p>
                    <p className="text-4xl font-black text-gray-900">{comparison.current}%</p>
                    <p className="text-xs text-gray-500 mt-1">Recent {comparison.practices.current.length} sessions</p>
                  </div>
                </div>

                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${comparison.isImproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} font-black text-lg`}>
                  {comparison.isImproved ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>+{Math.abs(parseFloat(comparison.improvement))}% Improvement!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      <span>{Math.abs(parseFloat(comparison.improvement))}% to improve</span>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Previous Sessions */}
                <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-gray-400">📋</span>
                    Previous Sessions
                  </h4>
                  <div className="space-y-2">
                    {comparison.practices.previous.map((practice, index) => (
                      <div key={practice._id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold text-gray-700">
                            Session #{practices.length - (index + comparison.practices.current.length)}
                          </p>
                          <span className={`px-3 py-1 rounded-full text-sm font-black ${
                            practice.score >= 90 ? 'bg-green-100 text-green-700' :
                            practice.score >= 75 ? 'bg-blue-100 text-blue-700' :
                            practice.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {practice.score}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(practice.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Sessions */}
                <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-300">
                  <h4 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-purple-600">⭐</span>
                    Recent Sessions
                  </h4>
                  <div className="space-y-2">
                    {comparison.practices.current.map((practice, index) => (
                      <div key={practice._id} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold text-gray-700">
                            Session #{practices.length - index}
                          </p>
                          <span className={`px-3 py-1 rounded-full text-sm font-black ${
                            practice.score >= 90 ? 'bg-green-100 text-green-700' :
                            practice.score >= 75 ? 'bg-blue-100 text-blue-700' :
                            practice.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {practice.score}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(practice.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Practices History */}
              {practices.length > 5 && (
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                  <h4 className="font-black text-gray-900 mb-3">All Practice Sessions ({practices.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {practices.map((practice, index) => (
                      <div key={practice._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 text-purple-600 rounded-lg w-10 h-10 flex items-center justify-center font-black text-sm">
                            #{practices.length - index}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {new Date(practice.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-lg font-black ${
                          practice.score >= 90 ? 'bg-green-100 text-green-700' :
                          practice.score >= 75 ? 'bg-blue-100 text-blue-700' :
                          practice.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {practice.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/practice', { state: { speechId } });
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition font-black text-lg shadow-lg hover:shadow-xl"
              >
                Practice This Speech Again →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}