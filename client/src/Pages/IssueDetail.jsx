import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIssue(data.data.issue);
      } else {
        setError(data.message || 'Failed to fetch issue details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/complaints/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        fetchIssue(); // Refresh to show new comment
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmittingComment(false);
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

  const getStatusTimeline = () => {
    const timeline = [
      { status: 'Reported', date: issue.createdAt, active: true }
    ];

    if (issue.acknowledgedAt) {
      timeline.push({ status: 'Acknowledged', date: issue.acknowledgedAt, active: true });
    }

    if (issue.status === 'In Progress') {
      timeline.push({ status: 'In Progress', date: issue.updatedAt, active: true });
    }

    if (issue.resolvedAt) {
      timeline.push({ status: 'Resolved', date: issue.resolvedAt, active: true });
    } else if (issue.status === 'Resolved') {
      timeline.push({ status: 'Resolved', date: issue.updatedAt, active: true });
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading issue details...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Issue not found'}</div>
          <Link to="/my-issues" className="text-red-600 hover:underline">
            Back to My Issues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-800">{issue.title}</h1>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[issue.status]}`}>
                    {issue.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low']}`}>
                    {issue.severity === 'red' ? 'Urgent' : issue.severity === 'yellow' ? 'High' : issue.severity === 'orange' ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-gray-600">Category: </span>
                <span className="font-medium">{issue.category}</span>
              </div>

              <div className="text-gray-700 mb-4">
                {issue.description}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Reported by:</strong> {issue.reportedBy.name}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(issue.createdAt)}
                </div>
                <div>
                  <strong>Ward:</strong> {issue.wardNumber || 'Not specified'}
                </div>
                <div>
                  <strong>Zone:</strong> {issue.zoneNumber || 'Not specified'}
                </div>
              </div>

              {issue.assignedOfficial && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <strong>Assigned to:</strong> {issue.assignedOfficial.name}
                    {issue.assignedOfficial.department && (
                      <span> ({issue.assignedOfficial.department})</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
              <div className="space-y-3">
                {getStatusTimeline().map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium">{item.status}</div>
                      <div className="text-sm text-gray-600">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {issue.location && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '300px' }}>
                  <MapContainer
                    center={[issue.location.lat, issue.location.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[issue.location.lat, issue.location.lng]}>
                      <Popup>{issue.location.address}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <p className="mt-2 text-sm text-gray-600">{issue.location.address}</p>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Comments ({issue.comments?.length || 0})</h2>
              
              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {issue.comments?.length === 0 ? (
                  <p className="text-gray-500">No comments yet.</p>
                ) : (
                  issue.comments.map((comment, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{comment.user.name}</span>
                          {comment.user.role === 'admin' && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Admin</span>
                          )}
                          {comment.user.role === 'official' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Official</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Official Replies */}
            {issue.officialReplies?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Official Replies</h2>
                <div className="space-y-4">
                  {issue.officialReplies.map((reply, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{reply.user.name}</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {reply.user.role === 'admin' ? 'Admin' : 'Official'}
                          </span>
                          {reply.user.department && (
                            <span className="ml-2 text-xs text-gray-600">
                              ({reply.user.department})
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{reply.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Community Engagement</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upvotes</span>
                  <span className="font-medium">{issue.upvotes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downvotes</span>
                  <span className="font-medium">{issue.downvotes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">{issue.comments?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Official Replies</span>
                  <span className="font-medium">{issue.officialReplies?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/my-issues"
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back to My Issues
                </Link>
                <Link
                  to="/feed"
                  className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  View Public Feed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
