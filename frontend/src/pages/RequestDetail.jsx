import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { maintenanceRequestAPI } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Edit,
  Trash2
} from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      const response = await maintenanceRequestAPI.getRequestById(id);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request detail:', error);
      toast.error('Failed to load request details');
      navigate('/maintenance-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await maintenanceRequestAPI.deleteRequest(id);
        toast.success('Request deleted successfully!');
        navigate('/maintenance-requests');
      } catch (error) {
        console.error('Error deleting request:', error);
        toast.error('Failed to delete request');
      }
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'New': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Repaired': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scrap': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'New': return Clock;
      case 'In Progress': return Activity;
      case 'Repaired': return CheckCircle;
      case 'Scrap': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading request details...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Request not found</h3>
        <p className="text-gray-500">The requested maintenance request could not be found.</p>
        <Link
          to="/maintenance-requests"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Requests
        </Link>
      </div>
    );
  }

  const StageIcon = getStageIcon(request.stage);
  const isOverdue = request.type === 'Preventive' && 
                   request.stage === 'New' && 
                   request.scheduledDate && 
                   new Date(request.scheduledDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/maintenance-requests"
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.subject}</h1>
            <p className="text-gray-600">Request Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="mt-1 text-sm text-gray-900">{request.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{request.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.type === 'Preventive' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {request.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Information</h2>
            {request.equipment ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Wrench className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.equipment.name}</p>
                    <p className="text-xs text-gray-500">Serial: {request.equipment.serialNumber}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Category:</span> {request.equipment.category}</p>
                  <p><span className="font-medium">Department:</span> {request.equipment.department}</p>
                  <p><span className="font-medium">Location:</span> {request.equipment.location}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No equipment assigned</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Assignment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Stage</label>
                <div className="mt-1 flex items-center">
                  <StageIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStageColor(request.stage)}`}>
                    {request.stage}
                  </span>
                </div>
              </div>
              
              {request.assignedTeam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Team</label>
                  <p className="mt-1 text-sm text-gray-900">{request.assignedTeam.name}</p>
                </div>
              )}
              
              {request.assignedTechnician && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Technician</label>
                  <div className="mt-1 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{request.assignedTechnician.name}</span>
                  </div>
                </div>
              )}
              
              {request.requestedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested By</label>
                  <p className="mt-1 text-sm text-gray-900">{request.requestedBy.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              {request.scheduledDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(request.scheduledDate).toLocaleDateString()}
                    </span>
                    {isOverdue && (
                      <AlertTriangle className="w-4 h-4 ml-2 text-red-600" />
                    )}
                  </div>
                  {isOverdue && (
                    <p className="text-xs text-red-600 mt-1">
                      Overdue by {Math.floor((new Date() - new Date(request.scheduledDate)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
              )}
              
              {request.completedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed</label>
                  <div className="mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm text-gray-900">
                      {new Date(request.completedAt).toLocaleDateString()} at {new Date(request.completedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
              
              {request.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <div className="mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900">{request.duration} hours</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}