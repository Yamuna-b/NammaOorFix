// Namma Oor Fix Header Component
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

export default function Navbar({ isOfficialView = false }) {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Namma Oor Fix Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">NammaOorFix</h1>

            {/* Main navigation */}
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link to="/user-view" className="text-gray-600 hover:text-red-600">Home</Link>
              <Link to="/report" className="text-gray-600 hover:text-red-600">Report Issue</Link>
              <Link to="/my-issues" className="text-gray-600 hover:text-red-600">My Issues</Link>
              <Link to="/feed" className="text-gray-600 hover:text-red-600">Public Feed</Link>
              <Link to="/organizations" className="text-gray-600 hover:text-red-600">Organizations</Link>
              <Link to="/events" className="text-gray-600 hover:text-red-600">Events</Link>
              <Link to="/profile" className="text-gray-600 hover:text-red-600">Profile</Link>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-purple-700 hover:text-purple-600">Admin</Link>
              )}
            </nav>
          </div>
          
          {/* Search Bar - Only for Verified Officials View */}
          {isOfficialView && (
            <div className="flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="Search Posts..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <span className="text-sm text-gray-600">{user.name}</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}