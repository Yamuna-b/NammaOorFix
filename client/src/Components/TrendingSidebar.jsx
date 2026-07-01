import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrendingSidebar({ isOfficialView, trendingIssues, topIssues, urgentIssues }) {
  const [activeTab, setActiveTab] = useState('trending');
  const navigate = useNavigate();

  const handleViewIssue = (issueId) => {
    navigate(`/issue/${issueId}`);
  };

  const handleTrends = () => {
    navigate('/feed');
  };

  return (
    <div className="space-y-6">
      {/* Official View: Top Issues */}
      {isOfficialView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Top Issues</h3>
          <div className="space-y-3">
            {topIssues.slice(0, 2).map((issue, index) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-600">{issue.rank}</span>
                  <div>
                    <p className="font-medium text-gray-800">{issue.title}</p>
                    <p className="text-xs text-gray-500">High priority</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewIssue(issue.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official View: Urgent Issues */}
      {isOfficialView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Urgent Issues</h3>
          <div className="space-y-3">
            {urgentIssues.slice(0, 2).map((issue, index) => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-red-600">{issue.rank}</span>
                  <div>
                    <p className="font-medium text-gray-800">{issue.title}</p>
                    <p className="text-xs text-red-600">Requires immediate attention</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewIssue(issue.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Now Trending - Both Views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Now Trending</h3>
        <div className="space-y-3">
          {trendingIssues.slice(0, 2).map((issue, index) => (
            <div 
              key={issue.id} 
              onClick={() => handleViewIssue(issue.id)}
              className="p-3 border-l-4 border-orange-400 bg-orange-50 rounded-r-lg hover:bg-orange-100 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg font-bold text-orange-600">{issue.rank}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{issue.title}</p>
                  <p className="text-xs text-orange-600">{issue.type}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Show more trending items */}
          {trendingIssues.slice(2, 10).map((issue, index) => (
            <div 
              key={issue.id} 
              onClick={() => handleViewIssue(issue.id)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded transition-colors"
            >
              <span className="text-sm font-medium text-gray-500">#{index + 3}</span>
              <p className="text-sm text-gray-700 truncate">{issue.title}</p>
            </div>
          ))}
        </div>
        
        {/* Trends Button */}
        <button
          onClick={handleTrends}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors font-medium"
        >
          Trends
        </button>
      </div>

      {/* Additional Stats (Official View Only) */}
      {isOfficialView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Issues</span>
              <span className="font-semibold text-gray-800">247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolved Today</span>
              <span className="font-semibold text-green-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-orange-600">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="font-semibold text-red-600">7</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
