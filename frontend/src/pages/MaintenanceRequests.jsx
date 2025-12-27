import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { maintenanceRequestAPI, equipmentAPI, maintenanceTeamAPI, authAPI } from '../services/api';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Calendar,
    User,
    Wrench,
    Clock,
    AlertTriangle
} from 'lucide-react';

export default function MaintenanceRequests() {
    const [requests, setRequests] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [requestFormData, setRequestFormData] = useState({
        subject: '',
        description: '',
        type: 'Corrective',
        priority: 'Medium',
        equipment: '',
        assignedTeam: '',
        scheduledDate: ''
    });
    const [filters, setFilters] = useState({
        stage: '',
        type: '',
        priority: '',
        assignedTeam: '',
        equipment: '',
        page: 1
    });

    const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
    const types = ['Corrective', 'Preventive'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    useEffect(() => {
        fetchRequests();
        fetchEquipment();
        fetchTeams();
        fetchUsers();
    }, [filters]);

    const fetchRequests = async () => {
        try {
            const response = await maintenanceRequestAPI.getRequests(filters);
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load maintenance requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.getEquipment();
            setEquipment(response.data.equipment);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await maintenanceTeamAPI.getTeams();
            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            try {
                await maintenanceRequestAPI.deleteRequest(id);
                toast.success('Request deleted successfully!');
                fetchRequests();
            } catch (error) {
                console.error('Error deleting request:', error);
                toast.error('Failed to delete request');
            }
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!requestFormData.subject.trim()) {
            toast.error('Subject is required');
            return;
        }
        if (!requestFormData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!requestFormData.equipment) {
            toast.error('Equipment selection is required');
            return;
        }

        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        // Prepare the request data
        const requestData = {
            subject: requestFormData.subject.trim(),
            description: requestFormData.description.trim(),
            type: requestFormData.type,
            priority: requestFormData.priority,
            equipment: requestFormData.equipment,
            requestedBy: currentUser.id
        };

        // Add optional fields only if they have values
        if (requestFormData.assignedTeam) {
            requestData.assignedTeam = requestFormData.assignedTeam;
        }
        if (requestFormData.scheduledDate) {
            requestData.scheduledDate = requestFormData.scheduledDate;
        }

        console.log('Submitting request data:', requestData);

        try {
            const response = await maintenanceRequestAPI.createRequest(requestData);
            console.log('Request created successfully:', response.data);
            toast.success('Request created successfully!');
            setShowAddModal(false);
            setRequestFormData({
                subject: '',
                description: '',
                type: 'Corrective',
                priority: 'Medium',
                equipment: '',
                assignedTeam: '',
                scheduledDate: ''
            });
            fetchRequests();
        } catch (error) {
            console.error('Error creating request:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create request';
            toast.error(errorMessage);
        }
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'New': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Repaired': return 'bg-green-100 text-green-800';
            case 'Scrap': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'bg-gray-100 text-gray-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading maintenance requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                    <p className="text-gray-600">Manage all maintenance requests and their status</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to="/kanban"
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        View Kanban
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        data-add-request
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Request
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                            <select
                                value={filters.stage}
                                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Stages</option>
                                {stages.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Types</option>
                                {types.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                            <select
                                value={filters.assignedTeam}
                                onChange={(e) => setFilters({ ...filters, assignedTeam: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Teams</option>
                                {teams.map(team => (
                                    <option key={team._id} value={team._id}>{team.name}</option>
                                ))}
                            </select>
                            <select
                                value={filters.equipment}
                                onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Equipment</option>
                                {equipment && equipment.length > 0 ? equipment.map(eq => (
                                    <option key={eq._id} value={eq._id}>{eq.name || 'Unnamed Equipment'}</option>
                                )) : null}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Equipment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Technician
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Scheduled
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests
                                .filter(request => {
                                    if (!searchTerm) return true;
                                    const searchLower = searchTerm.toLowerCase();
                                    return (
                                        request.subject?.toLowerCase().includes(searchLower) ||
                                        request.description?.toLowerCase().includes(searchLower) ||
                                        request.equipment?.name?.toLowerCase().includes(searchLower) ||
                                        request.assignedTeam?.name?.toLowerCase().includes(searchLower)
                                    );
                                })
                                .map((request) => {
                                    const isOverdue = request.type === 'Preventive' &&
                                        request.stage === 'New' &&
                                        request.scheduledDate &&
                                        new Date(request.scheduledDate) < new Date();

                                    return (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{request.subject}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {request.description}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{request.equipment?.name}</div>
                                                <div className="text-xs text-gray-500">{request.equipment?.serialNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.type === 'Preventive' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {request.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {request.assignedTeam?.name || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {request.assignedTechnician ? (
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-1 text-gray-400" />
                                                        {request.assignedTechnician.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(request.stage)}`}>
                                                    {request.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {request.scheduledDate ? (
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                                                            {new Date(request.scheduledDate).toLocaleDateString()}
                                                        </span>
                                                        {isOverdue && (
                                                            <AlertTriangle className="w-4 h-4 ml-1 text-red-600" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Not scheduled</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/maintenance-requests/${request._id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(request._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {requests.length === 0 && (
                    <div className="text-center py-12">
                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                        <p className="text-gray-500">Get started by creating your first maintenance request.</p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Create Maintenance Request</h2>
                            </div>
                            <form onSubmit={handleCreateRequest} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={requestFormData.subject}
                                            onChange={(e) => setRequestFormData({ ...requestFormData, subject: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                            placeholder="Enter request subject"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                                        <select
                                            value={requestFormData.type}
                                            onChange={(e) => setRequestFormData({ ...requestFormData, type: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                        >
                                            {types.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                                        <select
                                            value={requestFormData.priority}
                                            onChange={(e) => setRequestFormData({ ...requestFormData, priority: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment</label>
                                        <select
                                            required
                                            value={requestFormData.equipment}
                                            onChange={(e) => setRequestFormData({ ...requestFormData, equipment: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                            disabled={!equipment || equipment.length === 0}
                                        >
                                            <option value="">{equipment && equipment.length > 0 ? 'Select Equipment' : 'No equipment available'}</option>
                                            {equipment && equipment.length > 0 && equipment.map(eq => (
                                                <option key={eq._id} value={eq._id}>{eq.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Team</label>
                                        <select
                                            value={requestFormData.assignedTeam}
                                            onChange={(e) => setRequestFormData({ ...requestFormData, assignedTeam: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                        >
                                            <option value="">Auto-assign based on equipment</option>
                                            {teams.map(team => (
                                                <option key={team._id} value={team._id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {requestFormData.type === 'Preventive' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
                                            <input
                                                type="date"
                                                value={requestFormData.scheduledDate}
                                                onChange={(e) => setRequestFormData({ ...requestFormData, scheduledDate: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        required
                                        value={requestFormData.description}
                                        onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors resize-none text-gray-900 placeholder-gray-500"
                                        placeholder="Describe the maintenance issue or task..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Create Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}