import { useState, useEffect, useContext } from 'react';
import SuggestionsSidebar from './SuggestionsSidebar';
import TrendingSidebar from './TrendingSidebar';
import MainContent from './MainContent';
import Footer from './Footer';
import ViewToggle from './ViewToggle';
import LocationSelector from './LocationSelector';
import { AuthContext } from '../App';

export default function NammaOorFixLayout({ isOfficialView = false }) {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [urgentIssues, setUrgentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isOfficialView ? 'official' : 'public');
  const [userLocation, setUserLocation] = useState({
    area: '',
    wardNumber: '',
    zone: ''
  });
  const [availableAreas, setAvailableAreas] = useState([]);

  useEffect(() => {
    fetchIssuesData();
  }, [activeTab, userLocation]);

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
      
      setAvailableAreas(areas.slice(0, 100)); // Limit to first 100 for performance
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const fetchIssuesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all issues
      const response = await fetch('http://localhost:5000/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const allIssues = data.data.issues;
        
        // Sort issues based on user type and active tab
        let sortedIssues;
        if (isOfficialView && activeTab === 'official') {
          // Officials homepage: oldest to newest (excluding acknowledged)
          sortedIssues = allIssues
            .filter(issue => !issue.acknowledged)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
          // Normal people and officials public feed: newest to oldest with location priority
          sortedIssues = allIssues.sort((a, b) => {
            // Location-based AI prioritization
            const aLocationScore = calculateLocationScore(a, userLocation);
            const bLocationScore = calculateLocationScore(b, userLocation);
            
            // If location scores are significantly different, prioritize location
            if (Math.abs(aLocationScore - bLocationScore) > 0.3) {
              return bLocationScore - aLocationScore;
            }
            
            // Otherwise, sort by time (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        }
        
        // Add mock location data to issues for map display
        const issuesWithLocation = sortedIssues.slice(0, 10).map((issue, index) => ({
          ...issue,
          location: {
            lat: 9.9252 + (Math.random() - 0.5) * 0.1, // Random around Madurai
            lng: 78.1198 + (Math.random() - 0.5) * 0.1,
            address: issue.location?.address || `Location ${index + 1}, Madurai`
          }
        }));
        setIssues(issuesWithLocation); // Main content issues
        
        // Now Trending (User View & Official View)
        setTrendingIssues(
          allIssues.slice(0, 10).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            type: issue.severity === 'red' ? 'Critical' : 'Ongoing Issue',
            rank: `#${index + 1}`
          }))
        );
        
        // Top Issues (Official View Only)
        setTopIssues(
          allIssues.filter(issue => issue.category === 'Public Safety').slice(0, 5).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            rank: `#${index + 1}`
          }))
        );
        
        // Urgent Issues (Official View Only)
        setUrgentIssues(
          allIssues.filter(issue => issue.severity === 'red').slice(0, 5).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            rank: `#${index + 1}`
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI-based location scoring algorithm
  const calculateLocationScore = (issue, userLoc) => {
    if (!userLoc.area || !issue.location?.address) return 0;
    
    const issueAddress = issue.location.address.toLowerCase();
    const userArea = userLoc.area.toLowerCase();
    
    let score = 0;
    
    // Exact area match
    if (issueAddress.includes(userArea)) {
      score += 1.0;
    }
    
    // Ward number match
    if (userLoc.wardNumber && issue.wardNumber === userLoc.wardNumber) {
      score += 0.8;
    }
    
    // Zone match
    if (userLoc.zone && issue.zone === userLoc.zone) {
      score += 0.6;
    }
    
    // Partial address match
    const userWords = userArea.split(' ');
    userWords.forEach(word => {
      if (word.length > 2 && issueAddress.includes(word)) {
        score += 0.2;
      }
    });
    
    return Math.min(score, 1.0); // Cap at 1.0
  };

  const handleLocationChange = (selectedArea) => {
    const area = availableAreas.find(a => a.address === selectedArea);
    if (area) {
      setUserLocation({
        area: area.address,
        wardNumber: area.wardNumber,
        zone: area.zone
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Suggestions & Officials */}
          <div className="w-64 flex-shrink-0">
            <SuggestionsSidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Location Selector */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <LocationSelector 
                onLocationSelect={(areaObj) => {
                  setUserLocation({
                    area: areaObj.address || '',
                    wardNumber: areaObj.wardNumber || null,
                    zone: areaObj.zone || null
                  });
                }}
                currentLocation={userLocation}
              />
            </div>
            
            {/* Tab Navigation for Officials */}
            {isOfficialView && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('official')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'official'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Official Feed (Oldest → Newest)
                  </button>
                  <button
                    onClick={() => setActiveTab('public')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'public'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Public Feed (Newest → Oldest)
                  </button>
                </div>
              </div>
            )}
            
            <MainContent 
              issues={issues} 
              loading={loading} 
              userLocation={userLocation}
              calculateLocationScore={calculateLocationScore}
            />
          </div>
          
          {/* Right Sidebar - Trending/Top/Urgent Issues */}
          <div className="w-80 flex-shrink-0">
            <TrendingSidebar 
              isOfficialView={isOfficialView}
              trendingIssues={trendingIssues}
              topIssues={topIssues}
              urgentIssues={urgentIssues}
            />
          </div>
        </div>
      </div>
      
      <Footer />
      <ViewToggle />
    </div>
  );
}
