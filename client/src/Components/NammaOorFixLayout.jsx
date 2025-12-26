import { useState, useEffect } from 'react';
import SuggestionsSidebar from './SuggestionsSidebar';
import TrendingSidebar from './TrendingSidebar';
import MainContent from './MainContent';
import Footer from './Footer';
import ViewToggle from './ViewToggle';

export default function NammaOorFixLayout({ isOfficialView = false }) {
  const [issues, setIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [urgentIssues, setUrgentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssuesData();
  }, []);

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
        
        // Add mock location data to issues for map display
        const issuesWithLocation = allIssues.slice(0, 5).map((issue, index) => ({
          ...issue,
          location: {
            lat: 9.9252 + (Math.random() - 0.5) * 0.1, // Random around Madurai
            lng: 78.1198 + (Math.random() - 0.5) * 0.1,
            address: issue.location?.address || `Location ${index + 1}, Madurai`
          }
        }));
        setIssues(issuesWithLocation); // Main content issues
        
        // Now Trending (User View & Official View)
        setTrendingIssues([
          { id: 1, title: 'Water leakage', type: 'Ongoing Issue', rank: '#1' },
          { id: 2, title: 'Critical Issue', type: 'Critical', rank: '#2' },
          ...allIssues.slice(0, 8).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            type: index % 2 === 0 ? 'Ongoing Issue' : 'Critical',
            rank: `#${index + 3}`
          }))
        ]);
        
        // Top Issues (Official View Only)
        setTopIssues([
          { id: 1, title: 'Street Dogs', rank: '#1' },
          { id: 2, title: 'Sewage', rank: '#2' },
          ...allIssues.filter(issue => issue.category === 'Public Safety').slice(0, 3).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            rank: `#${index + 3}`
          }))
        ]);
        
        // Urgent Issues (Official View Only)
        setUrgentIssues([
          { id: 1, title: 'Water Leak', rank: '#1' },
          { id: 2, title: 'Emergency', rank: '#2' },
          ...allIssues.filter(issue => issue.severity === 'red').slice(0, 3).map((issue, index) => ({
            id: issue._id,
            title: issue.title,
            rank: `#${index + 3}`
          }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
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
            <MainContent issues={issues} loading={loading} />
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
