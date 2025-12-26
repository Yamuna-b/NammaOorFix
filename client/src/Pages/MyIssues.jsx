import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const statusColors = {
  'Reported': 'bg-blue-100 text-blue-800',
  'Acknowledged': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Resolved': 'bg-green-100 text-green-800'
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Urgent': 'bg-red-100 text-red-800'
};

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchIssues();
  }, [filter, pagination.current]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });
      
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }

      const response = await fetch(`http://localhost:5000/api/complaints/my?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIssues(data.data.issues);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch issues');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  if (loading && issues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading your issues...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Issues</h1>
            <Link
              to="/report"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Report New Issue
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({pagination.total})
            </button>
            <button
              onClick={() => setFilter('Reported')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'Reported' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reported
            </button>
            <button
              onClick={() => setFilter('Acknowledged')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'Acknowledged' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Acknowledged
            </button>
            <button
              onClick={() => setFilter('In Progress')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'In Progress' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('Resolved')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'Resolved' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Issues List */}
          {issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't reported any issues yet." 
                  : `No issues with status "${filter}" found.`}
              </div>
              {filter === 'all' && (
                <Link
                  to="/report"
                  className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Report Your First Issue
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Link 
                        to={`/issue/${issue._id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-red-600"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-gray-600 mt-1">{issue.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low']}`}>
                        {issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      Ward {issue.wardNumber || 'N/A'} • {issue.location?.address?.split(',')[0] || 'Location not specified'}
                    </div>
                    <div>
                      {formatDate(issue.createdAt)}
                    </div>
                  </div>

                  {issue.assignedOfficial && (
                    <div className="mt-2 text-sm text-gray-600">
                      Assigned to: {issue.assignedOfficial.name} ({issue.assignedOfficial.department})
                    </div>
                  )}

                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>{issue.upvotes?.length || 0} upvotes</span>
                    <span>{issue.comments?.length || 0} comments</span>
                    {issue.officialReplies?.length > 0 && (
                      <span>{issue.officialReplies.length} official replies</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
