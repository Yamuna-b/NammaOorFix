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

const categories = [
  'Road Damage',
  'Street Light',
  'Garbage Collection',
  'Water Supply',
  'Sewerage',
  'Public Safety',
  'Noise Pollution',
  'Illegal Dumping',
  'Park Maintenance',
  'Traffic Signal',
  'Other'
];

export default function PublicFeed() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    wardNumber: '',
    sort: 'recent'
  });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchIssues();
    fetchWards();
  }, [filters, pagination.current]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: 12,
        sort: filters.sort
      });
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.wardNumber) queryParams.append('wardNumber', filters.wardNumber);

      const response = await fetch(`http://localhost:5000/api/complaints?${queryParams}`);
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

  const fetchWards = async () => {
    try {
      const response = await fetch('http://localhost:5000/wards');
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        setWards(data.data.wards);
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
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

  const handleUpvote = async (issueId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchIssues(); // Refresh to update vote counts
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      wardNumber: '',
      sort: 'recent'
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  if (loading && issues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading public feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Public Issue Feed</h1>
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                <select
                  value={filters.wardNumber}
                  onChange={(e) => handleFilterChange('wardNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward._id} value={ward.wardNumber}>
                      Ward {ward.wardNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-gray-600">
            Showing {issues.length} of {pagination.total} issues
          </div>

          {/* Issues Grid */}
          {issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                No issues found matching your criteria.
              </div>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div key={issue._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <Link 
                      to={`/issue/${issue._id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-red-600 line-clamp-2"
                    >
                      {issue.title}
                    </Link>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low']}`}>
                      {issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{issue.category}</p>
                  
                  <p className="text-gray-700 mb-3 line-clamp-3 text-sm">
                    {issue.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <div>
                      Ward {issue.wardNumber || 'N/A'}
                    </div>
                    <div>
                      {formatDate(issue.createdAt)}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-3">
                    Reported by {issue.reportedBy.name}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{issue.upvotes?.length || 0} upvotes</span>
                      <span>{issue.comments?.length || 0} comments</span>
                    </div>
                    <button
                      onClick={() => handleUpvote(issue._id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Upvote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        pageNum === pagination.current
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
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
