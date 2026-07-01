import { useState } from 'react';

export default function SuggestionsSidebar() {
  const [following, setFollowing] = useState(new Set());

  const officials = [
    // City leadership
    { id: 1, name: 'Commissioner, Madurai Corporation', role: 'admin', verified: true, zone: 'Head Office' },
    { id: 2, name: 'Mayor, Madurai', role: 'official', verified: true, zone: 'City' },
    { id: 3, name: 'Deputy Mayor, Madurai', role: 'official', verified: true, zone: 'City' },

    // Zone / ward officers
    { id: 4, name: 'Assistant Commissioner – Zone 1', role: 'official', verified: true, zone: 'Zone 1' },
    { id: 5, name: 'Assistant Commissioner – Zone 2', role: 'official', verified: true, zone: 'Zone 2' },
    { id: 6, name: 'Assistant Commissioner – Zone 3', role: 'official', verified: true, zone: 'Zone 3' },
    { id: 7, name: 'Assistant Commissioner – Zone 4', role: 'official', verified: true, zone: 'Zone 4' },
    { id: 8, name: 'Ward Councillor – Ward 23', role: 'official', verified: true, zone: 'Ward 23' },

    // External authorities
    { id: 9, name: 'TN Pollution Control Board – Madurai Region', role: 'official', verified: true, zone: 'State' },
    { id: 10, name: 'Forest Dept – Urban Wildlife', role: 'official', verified: true, zone: 'State' }
  ];

  const suggestions = [
    { id: 11, name: 'Public Health Department', role: 'official', verified: true },
    { id: 12, name: 'Engineering Dept – Roads & Storm Water', role: 'official', verified: true },
    { id: 13, name: 'Town Planning Department', role: 'official', verified: true },
    { id: 14, name: 'Revenue Department (Taxes & Bills)', role: 'official', verified: true },
    { id: 15, name: 'Solid Waste & Sanitation', role: 'official', verified: true },
    { id: 16, name: 'Water Supply & Sewerage Board', role: 'official', verified: true },
    { id: 17, name: 'Street Lighting & Electricity Liaison', role: 'official', verified: true },
    { id: 18, name: 'Parks & Playgrounds Cell', role: 'official', verified: true },
    { id: 19, name: 'Lakes & Waterbodies Restoration Cell', role: 'official', verified: true },
    { id: 20, name: 'Traffic Police – Madurai City', role: 'official', verified: true }
  ];

  const handleFollow = (userId) => {
    setFollowing(prev => {
      const newFollowing = new Set(prev);
      if (newFollowing.has(userId)) {
        newFollowing.delete(userId);
      } else {
        newFollowing.add(userId);
      }
      return newFollowing;
    });
  };

  const getRoleBadge = (role, verified) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800';
    if (role === 'official' && verified) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role, verified) => {
    if (role === 'admin') return 'Admin';
    if (role === 'official' && verified) return 'Official';
    return 'User';
  };

  return (
    <div className="space-y-6">
      {/* Officials Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Officials</h3>
        <div className="space-y-3">
          {officials.slice(0, 2).map(official => (
            <div key={official.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {official.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800 text-sm line-clamp-1">{official.name}</span>
                    {official.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(official.role, official.verified)}`}>
                    {getRoleText(official.role, official.verified)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleFollow(official.id)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  following.has(official.id)
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {following.has(official.id) ? 'Following' : '+ follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Suggestions</h3>
        <div className="space-y-3">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {suggestion.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{suggestion.name}</span>
                    {suggestion.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(suggestion.role, suggestion.verified)}`}>
                    {getRoleText(suggestion.role, suggestion.verified)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleFollow(suggestion.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  following.has(suggestion.id)
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {following.has(suggestion.id) ? 'Following' : '+ follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
