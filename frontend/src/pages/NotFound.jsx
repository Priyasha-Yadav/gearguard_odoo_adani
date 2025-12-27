import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
            404
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h1>
          <p className="text-gray-600 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
          <div className="space-y-2">
            <Link to="/equipment" className="block text-blue-600 hover:text-blue-800 transition-colors">
              Equipment Management
            </Link>
            <Link to="/maintenance-requests" className="block text-blue-600 hover:text-blue-800 transition-colors">
              Maintenance Requests
            </Link>
            <Link to="/maintenance-teams" className="block text-blue-600 hover:text-blue-800 transition-colors">
              Maintenance Teams
            </Link>
            <Link to="/kanban" className="block text-blue-600 hover:text-blue-800 transition-colors">
              Kanban Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}