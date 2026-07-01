// Login.jsx (Dynamic, Compact, Red-Yellow Gradient)
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData);
      if (response.data.status === 'success') {
        login(response.data.data.user, response.data.token);
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg p-6 sm:p-6">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Sign in to your account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-white/80">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-white/30 text-yellow-400 focus:ring-yellow-300"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:text-yellow-200">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-gradient-to-r from-red-500 to-yellow-400 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-white/80">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-yellow-200 hover:text-yellow-100 font-medium"
            >
              Sign up
            </Link>
          </p>

          {/* Test Credentials Box */}
          <div className="mt-5 pt-3 border-t border-white/10 text-xs text-white/70 bg-black/10 rounded-lg p-3 text-center space-y-1">
            <p className="font-semibold text-yellow-200 uppercase tracking-wider text-[10px] mb-1">🔑 Demo Account</p>
            <p className="font-mono text-white select-all">eb@nammaoorfix.gov.in</p>
            <p className="font-mono text-white select-all">Password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
