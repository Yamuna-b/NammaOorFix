// App.jsx - Namma Oor Fix Implementation
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';
import Navbar from './Components/Navbar';
// Namma Oor Fix Components
import NammaOorFixLayout from './Components/NammaOorFixLayout';
// CiviConnect Pages
import ReportIssue from './Pages/ReportIssue';
import MyIssues from './Pages/MyIssues';
import IssueDetail from './Pages/IssueDetail';
import PublicFeed from './Pages/PublicFeed';
import Organizations from './Pages/Organizations';
import Events from './Pages/Events';
import AdminDashboard from './Pages/AdminDashboard';
import AdminLogin from './Pages/AdminLogin';
import OfficerLogin from './Pages/OfficerLogin';
import './App.css';

// Auth context to manage user state
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <Router>
        <div className="App">
          {isAuthenticated && <Navbar user={user} />}
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/user-view" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/user-view" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/user-view" /> : <Register />} 
            />
            <Route 
              path="/home" 
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
            />
            {/* Namma Oor Fix Routes */}
            <Route 
              path="/user-view" 
              element={isAuthenticated ? <NammaOorFixLayout isOfficialView={false} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/official-view" 
              element={isAuthenticated && (user?.role === 'official' || user?.role === 'admin') ? <NammaOorFixLayout isOfficialView={true} /> : <Navigate to="/login" />} 
            />
            
            {/* CiviConnect Routes */}
            <Route 
              path="/report" 
              element={isAuthenticated ? <ReportIssue /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-issues" 
              element={isAuthenticated ? <MyIssues /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/issue/:id" 
              element={isAuthenticated ? <IssueDetail /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/feed" 
              element={isAuthenticated ? <PublicFeed /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/organizations" 
              element={isAuthenticated ? <Organizations /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/events" 
              element={isAuthenticated ? <Events /> : <Navigate to="/login" />} 
            />
            {/* Officer Verification */}
            <Route
              path="/officer"
              element={<OfficerLogin />}
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={<AdminLogin />}
            />
            <Route 
              path="/admin/dashboard" 
              element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin" />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
