import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - will be connected to backend later
    setOrganizations([
      {
        _id: '1',
        name: 'Madurai Environmental Society',
        type: 'NGO',
        city: 'Madurai',
        description: 'Working towards a cleaner and greener Madurai through community initiatives.',
        website: 'https://mes-madurai.org',
        events: 12,
        members: 245
      },
      {
        _id: '2',
        name: 'Tech for Good Foundation',
        type: 'Startup',
        city: 'Madurai',
        description: 'Using technology to solve civic problems and improve public services.',
        website: 'https://techforgood.in',
        events: 8,
        members: 89
      },
      {
        _id: '3',
        name: 'Lady Doak College NSS',
        type: 'College',
        city: 'Madurai',
        description: 'National Service Scheme unit organizing community development programs.',
        website: 'https://ladydoak.edu.in/nss',
        events: 24,
        members: 156
      }
    ]);
    setLoading(false);
  }, []);

  const typeColors = {
    'NGO': 'bg-green-100 text-green-800',
    'Startup': 'bg-blue-100 text-blue-800',
    'College': 'bg-purple-100 text-purple-800',
    'Community Group': 'bg-orange-100 text-orange-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Community Organizations</h1>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Register Organization
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Connect with local NGOs, startups, colleges, and community groups working to make Madurai better.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{org.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[org.type]}`}>
                    {org.type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {org.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>City:</span>
                    <span className="font-medium">{org.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events:</span>
                    <span className="font-medium">{org.events}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-medium">{org.members}</span>
                  </div>
                </div>

                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-red-500 to-yellow-400 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Join the CiviConnect Network</h2>
            <p className="mb-6">
              Is your organization working to improve Madurai? Join our platform to reach more volunteers and organize impactful events.
            </p>
            <button className="px-6 py-3 bg-white text-red-600 rounded-md hover:bg-gray-100 font-medium">
              Register Your Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
