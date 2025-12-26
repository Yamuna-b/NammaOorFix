import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom markers for severity levels
const createCustomIcon = (severity) => {
  const colors = {
    'red': '#ef4444',    // Urgent - Red
    'yellow': '#eab308', // High - Yellow  
    'orange': '#f97316', // Medium - Orange
    'blue': '#3b82f6'    // Low - Blue
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[severity] || colors.blue}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
    className: 'custom-marker'
  });
};

function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        onLocationSelect({
          lat,
          lng,
          address: data.display_name || `${lat}, ${lng}`,
        });
      } catch {
        onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
      }
    },
  });
  return null;
}

export default function MainContent({ issues, loading }) {
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState([
    { id: 1, user: 'Mdu Corp', text: 'This issue will be resolved soon', votes: 4000, userVote: null }
  ]);
  const [newComment, setNewComment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleVote = (commentId, voteType) => {
    setVotes(prev => ({
      ...prev,
      [commentId]: voteType
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: 'Current User',
        text: newComment.trim(),
        votes: 0,
        userVote: null
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return;
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=1`
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setSelectedLocation({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        });
      }
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const formatVotes = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map with Issues */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Issues Map</h3>
        <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '400px' }}>
          <MapContainer
            center={[9.9252, 78.1198]} // Madurai center
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector onLocationSelect={setSelectedLocation} />
            
            {/* Show issue markers */}
            {issues.map((issue) => (
              issue.location && (
                <Marker
                  key={issue._id}
                  position={[issue.location.lat, issue.location.lng]}
                  icon={createCustomIcon(issue.severity)}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold">{issue.title}</h4>
                      <p className="text-sm text-gray-600">{issue.category}</p>
                      <p className="text-sm">{issue.description}</p>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          issue.severity === 'red' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          issue.severity === 'orange' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity === 'red' ? 'Urgent' :
                           issue.severity === 'yellow' ? 'High' :
                           issue.severity === 'orange' ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
        
        {/* Address Selection Form */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Select Location for New Issue</h4>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAddressForm ? 'Hide' : 'Show'} Address Form
            </button>
          </div>
          
          {showAddressForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Click on map or type address:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter address..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddressSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {selectedLocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Selected Location:</p>
                  <p className="text-sm text-blue-600">{selectedLocation.address}</p>
                  <p className="text-xs text-blue-500">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
              
              <button
                disabled={!selectedLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Use This Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Issue Post by Bamu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
            B
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-800">Bamu</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Issue: Water leakage</h3>
            <p className="text-gray-600 mb-4">
              There is a serious water leakage issue in our area. Water has been wasting for the past 3 days and no one has taken action. Please look into this matter urgently.
            </p>
            
            {/* Media Section */}
            <div className="flex space-x-2 mb-4">
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>pic</span>
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Camera</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
              
              {comments.map(comment => (
                <div key={comment.id} className="mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {comment.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800">{comment.user}</span>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.text}</p>
                      
                      {/* Voting */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleVote(comment.id, 'up')}
                            className={`p-1 rounded ${votes[comment.id] === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleVote(comment.id, 'down')}
                            className={`p-1 rounded ${votes[comment.id] === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <span className="text-sm text-gray-600 font-medium">
                            {formatVotes(comment.votes + (votes[comment.id] === 'up' ? 1 : votes[comment.id] === 'down' ? -1 : 0))} Votes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Eb Official Post Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            EB
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-800">Eb official</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Official</span>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
            
            {/* Post Issue Form */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Post an Issue</h4>
              <textarea
                placeholder="Describe the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={3}
              />
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Add Photo</span>
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Add Location</span>
                  </button>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Post Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
