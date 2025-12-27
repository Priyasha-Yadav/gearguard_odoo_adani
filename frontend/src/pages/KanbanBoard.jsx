import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { maintenanceRequestAPI, maintenanceTeamAPI, authAPI } from '../services/api';
import {
    Plus,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    Wrench,
    Filter,
    Search,
    Activity,
    Zap,
    CheckCircle,
    XCircle
} from 'lucide-react';

const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];
const stageColors = {
    'New': 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50',
    'In Progress': 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50',
    'Repaired': 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50',
    'Scrap': 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'
};

const stageIcons = {
    'New': Clock,
    'In Progress': Activity,
    'Repaired': CheckCircle,
    'Scrap': XCircle
};

const priorityColors = {
    'Low': 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800',
    'Medium': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800',
    'High': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800',
    'Critical': 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
};

export default function KanbanBoard() {
    const [kanbanData, setKanbanData] = useState({});
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        team: '',
        technician: '',
        search: ''
    });

    useEffect(() => {
        fetchKanbanData();
        fetchTeams();
        fetchUsers();
    }, [filters]);

    const fetchKanbanData = async () => {
        try {
            const response = await maintenanceRequestAPI.getKanbanData(filters);
            setKanbanData(response.data);
        } catch (error) {
            console.error('Error fetching kanban data:', error);
        } finally {
            setLoading(false);
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

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        try {
            await maintenanceRequestAPI.updateRequestStage(draggableId, {
                stage: destination.droppableId
            });
            toast.success(`Request moved to ${destination.droppableId}`);
            fetchKanbanData();
        } catch (error) {
            console.error('Error updating request stage:', error);
            toast.error('Failed to update request stage');
        }
    };

    const RequestCard = ({ request, index }) => {
        const isOverdue = request.type === 'Preventive' &&
            request.stage === 'New' &&
            request.scheduledDate &&
            new Date(request.scheduledDate) < new Date();

        return (
            <Draggable draggableId={request._id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-5 mb-4 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 ${stageColors[request.stage]
                            } ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2' : 'shadow-lg hover:shadow-xl'} ${isOverdue ? 'border-red-400 ring-2 ring-red-200' : ''
                            } transform hover:scale-105`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900 flex-1 leading-tight">
                                {request.subject}
                            </h4>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${priorityColors[request.priority]} shadow-sm`}>
                                {request.priority}
                            </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {request.description}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                                <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                                <span className="font-medium">{request.equipment?.name || 'Unknown Equipment'}</span>
                            </div>

                            {request.assignedTechnician && (
                                <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                                    <User className="w-4 h-4 mr-2 text-green-500" />
                                    <span className="font-medium">{request.assignedTechnician.name}</span>
                                </div>
                            )}

                            {request.scheduledDate && (
                                <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="font-medium">{new Date(request.scheduledDate).toLocaleDateString()}</span>
                                    {isOverdue && (
                                        <span className="ml-2 text-red-600 font-bold flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Overdue
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {request.type}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500 font-medium">Loading kanban board...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Enhanced Header */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Kanban Board
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Drag and drop maintenance requests to update their status
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Zap className="w-4 h-4 mr-1 text-blue-500" />
                                        Real-time Updates
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-1">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search maintenance requests..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={filters.team}
                                    onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <option value="">All Teams</option>
                                    {teams.map(team => (
                                        <option key={team._id} value={team._id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={filters.technician}
                                    onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <option value="">All Technicians</option>
                                    {users.filter(user => user.role === 'technician').map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Kanban Board */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stages.map((stage) => {
                                const StageIcon = stageIcons[stage];
                                return (
                                    <div key={stage} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-xl ${stage === 'New' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                                        stage === 'In Progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                            stage === 'Repaired' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                                                'bg-gradient-to-r from-red-500 to-pink-500'
                                                    }`}>
                                                    <StageIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-gray-900">{stage}</h3>
                                            </div>
                                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${stage === 'New' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800' :
                                                    stage === 'In Progress' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                                                        stage === 'Repaired' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800' :
                                                            'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                                                }`}>
                                                {kanbanData[stage]?.length || 0}
                                            </span>
                                        </div>

                                        <Droppable droppableId={stage}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`min-h-[300px] rounded-2xl p-3 transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50/50'
                                                        }`}
                                                >
                                                    {kanbanData[stage]?.map((request, index) => (
                                                        <RequestCard key={request._id} request={request} index={index} />
                                                    ))}
                                                    {provided.placeholder}
                                                    {(!kanbanData[stage] || kanbanData[stage].length === 0) && (
                                                        <div className="flex items-center justify-center h-32 text-gray-400">
                                                            <div className="text-center">
                                                                <StageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">No requests</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>

                    {/* Enhanced Legend */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl mr-3">
                                <Filter className="w-5 h-5 text-white" />
                            </div>
                            Status Legend
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                                <Clock className="w-6 h-6 text-amber-600 mr-3" />
                                <div>
                                    <div className="font-semibold text-amber-800">New</div>
                                    <div className="text-xs text-amber-600">Initial request</div>
                                </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <Activity className="w-6 h-6 text-blue-600 mr-3" />
                                <div>
                                    <div className="font-semibold text-blue-800">In Progress</div>
                                    <div className="text-xs text-blue-600">Work started</div>
                                </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                                <div>
                                    <div className="font-semibold text-emerald-800">Repaired</div>
                                    <div className="text-xs text-emerald-600">Work completed</div>
                                </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                                <XCircle className="w-6 h-6 text-red-600 mr-3" />
                                <div>
                                    <div className="font-semibold text-red-800">Scrap</div>
                                    <div className="text-xs text-red-600">Equipment scrapped</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}