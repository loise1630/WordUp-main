import { Link } from 'react-router-dom';

export default function ProgressCard({ stats }) {
  if (!stats || stats.totalPractices === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h3 className="text-2xl font-black text-gray-900 mb-4">📊 Progress Tracker</h3>
        <p className="text-gray-600 mb-6">Start practicing to track your progress and identify difficult sentences!</p>
        <Link
          to="/progress"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition font-bold shadow-lg"
        >
          View Progress Page
        </Link>
      </div>
    );
  }

  const improvementColor = stats.improvement >= 0 ? 'text-green-600' : 'text-red-600';
  const improvementBg = stats.improvement >= 0 ? 'bg-green-50' : 'bg-red-50';
  const improvementBorder = stats.improvement >= 0 ? 'border-green-500' : 'border-red-500';

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-gray-900">📊 Progress Tracker</h3>
        <Link
          to="/progress"
          className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Practices</p>
          <p className="text-3xl font-black text-purple-600">{stats.totalPractices}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Latest Score</p>
          <p className="text-3xl font-black text-blue-600">{stats.latestScore}</p>
        </div>

        <div className={`${improvementBg} rounded-xl p-4 border ${improvementBorder}`}>
          <p className="text-sm text-gray-600 mb-1">Improvement</p>
          <p className={`text-3xl font-black ${improvementColor}`}>
            {stats.improvement > 0 ? '+' : ''}{stats.improvement}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Difficult</p>
          <p className="text-3xl font-black text-orange-600">{stats.difficultSentences || 0}</p>
        </div>
      </div>

      {/* Improvement Message */}
      {stats.improvement !== undefined && (
        <div className={`rounded-lg p-4 ${improvementBg} border ${improvementBorder}`}>
          <p className={`font-bold ${improvementColor} text-sm`}>
            {stats.improvement >= 0 
              ? `🎉 You've improved by ${stats.improvement} points!`
              : `💪 Keep practicing! You'll improve soon.`
            }
          </p>
        </div>
      )}

      {/* Mini Chart Preview (Optional) */}
      {stats.improvementTrend && stats.improvementTrend.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-3">Recent Progress:</p>
          <div className="flex items-end gap-2 h-24">
            {stats.improvementTrend.slice(-8).map((practice, idx) => {
              const height = (practice.score / 100) * 100;
              const isLatest = idx === stats.improvementTrend.slice(-8).length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t transition-all ${
                      isLatest 
                        ? 'bg-purple-600' 
                        : practice.score >= 80 
                          ? 'bg-green-500' 
                          : practice.score >= 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`Session ${practice.practice}: ${practice.score}`}
                  />
                  <span className="text-xs text-gray-500">{practice.practice}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}