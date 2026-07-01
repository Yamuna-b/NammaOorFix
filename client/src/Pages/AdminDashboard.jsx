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

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    note: '',
    assignedDepartment: '',
    assignedOfficial: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    wardNumber: '',
    search: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch issues
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.wardNumber) queryParams.append('wardNumber', filters.wardNumber);
      
      const issuesResponse = await fetch(`http://localhost:5000/api/complaints?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const issuesData = await issuesResponse.json();
      const usersData = await usersResponse.json();
      
      if (issuesData.success) {
        setIssues(issuesData.data.issues);
        calculateAnalytics(issuesData.data.issues);
      }
      
      if (usersData.status === 'success') {
        setUsers(usersData.data.users);
      }
      
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (issuesData) => {
    const total = issuesData.length;
    const statusCounts = {};
    const categoryCounts = {};
    const wardCounts = {};
    
    issuesData.forEach(issue => {
      // Status counts
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      
      // Category counts
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
      
      // Ward counts
      if (issue.wardNumber) {
        wardCounts[issue.wardNumber] = (wardCounts[issue.wardNumber] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
    
    const topWards = Object.entries(wardCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([ward, count]) => ({ ward, count }));
    
    setAnalytics({
      total,
      open: statusCounts['Reported'] + statusCounts['Acknowledged'] + statusCounts['In Progress'] || 0,
      resolved: statusCounts['Resolved'] || 0,
      statusCounts,
      topCategories,
      topWards
    });
  };

  const handleStatusUpdate = async (issueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/complaints/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdateForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedIssue(null);
        setStatusUpdateForm({ status: '', note: '', assignedDepartment: '', assignedOfficial: '' });
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to update issue');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link
            to="/home"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Public Site
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-gray-800">{analytics.total || 0}</div>
            <div className="text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-orange-600">{analytics.open || 0}</div>
            <div className="text-gray-600">Open Issues</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600">{analytics.resolved || 0}</div>
            <div className="text-gray-600">Resolved Issues</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Top Issue Categories</h2>
            <div className="space-y-3">
              {analytics.topCategories?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.category}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!analytics.topCategories || analytics.topCategories.length === 0) && (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>

          {/* Top Wards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Issues by Ward</h2>
            <div className="space-y-3">
              {analytics.topWards?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">Ward {item.ward}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!analytics.topWards || analytics.topWards.length === 0) && (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Issues Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Issues Management</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search issues..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues
                  .filter(issue => 
                    !filters.search || 
                    issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                    issue.description.toLowerCase().includes(filters.search.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((issue) => (
                  <tr key={issue._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        <Link 
                          to={`/issue/${issue._id}`}
                          className="hover:text-red-600"
                        >
                          {issue.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.wardNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.reportedBy.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Update Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Update Issue Status</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Issue:</strong> {selectedIssue.title}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> {selectedIssue.status}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Reported">Reported</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={statusUpdateForm.assignedDepartment}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, assignedDepartment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Department</option>
                    <option value="EB">Electricity Board</option>
                    <option value="Madurai Corp">Madurai Corp</option>
                    <option value="PWD">Public Works Department</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Health">Health</option>
                    <option value="Urban Planning">Urban Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Official Note
                  </label>
                  <textarea
                    value={statusUpdateForm.note}
                    onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Add a note for the public..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setStatusUpdateForm({ status: '', note: '', assignedDepartment: '', assignedOfficial: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedIssue._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Update Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
