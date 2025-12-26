import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents([
      {
        _id: '1',
        title: 'Beach Cleanup Drive',
        type: 'Cleanup',
        date: '2024-01-15',
        time: '7:00 AM',
        location: 'Madurai Beach',
        hostOrg: 'Madurai Environmental Society',
        description: 'Join us for a community beach cleanup event.',
        interested: 45
      },
      {
        _id: '2',
        title: 'Civic Tech Workshop',
        type: 'Workshop',
        date: '2024-01-20',
        time: '2:00 PM',
        location: 'Lady Doak College',
        hostOrg: 'Tech for Good Foundation',
        description: 'Learn how technology can solve civic problems.',
        interested: 32
      }
    ]);
    setLoading(false);
  }, []);

  const typeColors = {
    'Cleanup': 'bg-green-100 text-green-800',
    'Workshop': 'bg-blue-100 text-blue-800',
    'Meetup': 'bg-purple-100 text-purple-800',
    'Campaign': 'bg-orange-100 text-orange-800'
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-gray-600">Loading events...</div></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Community Events</h1>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Create Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                    {event.type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div><strong>Date:</strong> {event.date}</div>
                  <div><strong>Time:</strong> {event.time}</div>
                  <div><strong>Location:</strong> {event.location}</div>
                  <div><strong>Host:</strong> {event.hostOrg}</div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{event.interested} interested</span>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                    Interested
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
