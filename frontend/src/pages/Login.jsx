import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Wrench, Eye, EyeOff, Settings, Shield, Zap, Users } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check password confirmation for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = isLogin
      ? await login({ email: formData.email, password: formData.password })
      : await register(formData);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } else {
      setError(result.error);
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/20">

        {/* Enhanced Form Panel */}
        <div className="px-12 py-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                GearGuard
              </h1>
              <p className="text-xs text-gray-500">Maintenance Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join GearGuard'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to access your maintenance dashboard'
                : 'Create your account to start managing equipment'}
            </p>
          </div>

          {/* Enhanced Toggle */}
          <div className="mt-8 flex w-full rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${!isLogin
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Register
            </button>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    name="confirmPassword" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500" 
                    placeholder="Re-enter your password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900"
                  >
                    <option value="user">User</option>
                    <option value="technician">Technician</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your department"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In to Dashboard' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Enhanced Brand Panel */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border border-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 border border-white rounded-full"></div>
          </div>

          <div className="max-w-md relative z-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-4xl font-bold leading-tight mb-6">
              Streamlined Maintenance Excellence
            </h3>

            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Transform your maintenance operations with intelligent equipment tracking,
              seamless team coordination, and proactive maintenance scheduling.
            </p>

            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Real-time equipment monitoring</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Automated maintenance scheduling</span>
              </div>
              <div className="flex items-center text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                <span>Team collaboration tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
