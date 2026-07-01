import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import IssueCard from './IssueCard';
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

export default function MainContent({ issues, loading, userLocation, calculateLocationScore }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

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
                onClick={() => navigate('/report', { state: { selectedLocation } })}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                Use This Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Issues Feed */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">📢 Local Issues Feed</h3>
        {issues && issues.length > 0 ? (
          <div className="space-y-6">
            {issues.map((issue) => {
              const isLocal = userLocation && calculateLocationScore ? 
                calculateLocationScore(issue, userLocation) > 0.5 : false;
              return (
                <IssueCard key={issue._id} issue={issue} isLocal={isLocal} />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            📍 No active issues found. Pin a location on the map and click 'Use This Location' to file a report!
          </div>
        )}
      </div>
    </div>
  );
}
