import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    name: 'Bamuna B',
    username: 'bamunab',
    email: 'bamuna@example.com',
    bio: 'Community activist passionate about improving our neighborhood',
    isPrivate: false,
    notifications: true,
    locationAccess: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic
    console.log('Saving settings:', user);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 ${activeTab === 'profile' ? 'border-b-2 border-red-500 text-red-600 font-semibold' : 'text-gray-600'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-6 ${activeTab === 'privacy' ? 'border-b-2 border-red-500 text-red-600 font-semibold' : 'text-gray-600'}`}
            >
              Privacy
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 ${activeTab === 'notifications' ? 'border-b-2 border-red-500 text-red-600 font-semibold' : 'text-gray-600'}`}
            >
              Notifications
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={user.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={user.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={user.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <div className="flex items-center mt-1">
                      <img 
                        className="h-16 w-16 rounded-full object-cover" 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60" 
                        alt="Profile" 
                      />
                      <button type="button" className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Privacy</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="privateAccount"
                      name="isPrivate"
                      checked={user.isPrivate}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="privateAccount" className="ml-2 block text-sm text-gray-900">
                      Private Account
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">When your account is private, only people you approve can see your issues and activity.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location Access</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="locationAccess"
                      name="locationAccess"
                      checked={user.locationAccess}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="locationAccess" className="ml-2 block text-sm text-gray-900">
                      Allow Location Access
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Allow NammaOorFix to access your location to suggest relevant issues near you.</p>
                </div>
                
                <div className="mt-6">
                  <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email Notifications</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="notifications"
                      checked={user.notifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                      Enable Email Notifications
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Receive emails about activity on your issues and other important updates.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="likesNotifications"
                        defaultChecked
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="likesNotifications" className="ml-2 block text-sm text-gray-900">
                        New Likes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="commentsNotifications"
                        defaultChecked
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="commentsNotifications" className="ml-2 block text-sm text-gray-900">
                        New Comments
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="followsNotifications"
                        defaultChecked
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="followsNotifications" className="ml-2 block text-sm text-gray-900">
                        New Follows
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="resolutionsNotifications"
                        defaultChecked
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="resolutionsNotifications" className="ml-2 block text-sm text-gray-900">
                        Issue Resolutions
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}