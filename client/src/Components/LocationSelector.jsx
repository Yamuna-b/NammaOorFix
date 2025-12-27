import React, { useState, useEffect } from 'react';
import '../styles/location.css';

const LocationSelector = ({ onLocationSelect, currentLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);

  useEffect(() => {
    loadAvailableAreas();
  }, []);

  const loadAvailableAreas = async () => {
    try {
      const response = await fetch('/Datasets/madurai_comprehensive_location_lookup_SAFE.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const areas = [];
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 5) {
          const address = columns[4]?.replace(/"/g, '').trim();
          if (address && address !== 'Not Available') {
            areas.push({
              address: address,
              wardNumber: columns[0]?.trim(),
              zone: columns[1]?.trim()
            });
          }
        }
      }
      
      setAvailableAreas(areas.slice(0, 100));
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      setIsLoading(true);
      const filtered = availableAreas
        .filter(area => 
          area.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setIsLoading(false);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, availableAreas]);

  return (
    <div className="location-selector-container">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your area..."
            className="location-input"
          />
          {isLoading && (
            <div className="location-loading">
              <div className="location-spinner"></div>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="location-suggestions">
              {suggestions.map((area, index) => (
                <div
                  key={index}
                  className="location-suggestion-item"
                  onClick={() => {
                    onLocationSelect(area);
                    setSearchTerm(area.address);
                    setSuggestions([]);
                  }}
                >
                  {area.address}
                </div>
              ))}
            </div>
          )}
        </div>
        {currentLocation.area && (
          <button
            onClick={() => onLocationSelect({})}
            className="clear-location-btn"
            title="Clear location"
          >
            ×
          </button>
        )}
      </div>
      {currentLocation.area && (
        <div className="location-status">
          Showing issues near: <span className="location-status-text">{currentLocation.area}</span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
