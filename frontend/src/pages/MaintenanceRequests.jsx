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
    Users,
    Wrench,
    Clock,
    AlertTriangle,
    X,
    ChevronDown
} from 'lucide-react';

export default function MaintenanceRequests() {
    const [requests, setRequests] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewRequest, setViewRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        equipment: '',
        subject: '',
        description: '',
        type: 'Corrective',
        priority: 'Medium',
        assignedTeam: '',
        requestedBy: '',
        scheduledDate: '',
        duration: 0
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
            setRequests(response.data.requests || []);
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
            setEquipment(response.data.equipment || []);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await maintenanceTeamAPI.getTeams();
            const teamData = response.data.teams || response.data || [];
            setTeams(teamData);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData, duration: Number(formData.duration) };
            
            // Clean empty strings for MongoDB IDs
            Object.keys(dataToSubmit).forEach(key => {
                if (dataToSubmit[key] === "") delete dataToSubmit[key];
            });

            await maintenanceRequestAPI.createRequest(dataToSubmit);
            toast.success('Request created successfully!');
            setShowAddModal(false);
            setFormData({
                equipment: '',
                subject: '',
                description: '',
                type: 'Corrective',
                priority: 'Medium',
                assignedTeam: '',
                requestedBy: '',
                scheduledDate: '',
                duration: 0
            });
            fetchRequests();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Please fill all required fields';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            try {
                await maintenanceRequestAPI.deleteRequest(id);
                toast.success('Request deleted successfully!');
                setRequests(prev => prev.filter(req => req._id !== id));
                fetchRequests();
            } catch (error) {
                console.error('Error deleting request:', error);
                toast.error('Failed to delete request');
            }
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
                <div className="text-gray-500 font-medium">Loading maintenance requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maintenance Requests</h1>
                    <p className="text-gray-500 mt-1">Lifecycle management for repair and preventive jobs</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to="/kanban"
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-medium"
                    >
                        View Kanban
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Request
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                                {equipment.map(eq => (
                                    <option key={eq._id} value={eq._id}>{eq.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Equipment</th>
                                <th className="px-6 py-4 text-center">Assigned Team</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Stage</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests
                                .filter(req => {
                                    if (!searchTerm) return true;
                                    const s = searchTerm.toLowerCase();
                                    return req.subject?.toLowerCase().includes(s) || req.equipment?.name?.toLowerCase().includes(s);
                                })
                                .map((request) => (
                                <tr key={request._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{request.subject}</div>
                                        <div className="text-xs text-gray-400">By: {request.requestedBy?.name || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{request.equipment?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">
                                            {request.assignedTeam?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${request.type === 'Preventive' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {request.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStageColor(request.stage)}`}>
                                            {request.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-4">
                                            <button onClick={() => setViewRequest(request)} className="text-blue-600 hover:scale-110 transition-transform"><Eye className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(request._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VIEW DETAIL MODAL */}
            {viewRequest && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStageColor(viewRequest.stage)}`}>
                                        {viewRequest.stage}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">#{viewRequest._id.slice(-6)}</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mt-1">{viewRequest.subject}</h2>
                            </div>
                            <button onClick={() => setViewRequest(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equipment</label>
                                    <div className="flex items-center text-slate-900 font-bold text-sm">
                                        <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                                        {viewRequest.equipment?.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Team</label>
                                    <div className="flex items-center text-slate-900 font-bold text-sm">
                                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                                        {viewRequest.assignedTeam?.name || 'Unassigned'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Date</label>
                                    <div className="flex items-center text-slate-900 font-bold text-sm">
                                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                                        {viewRequest.scheduledDate ? new Date(viewRequest.scheduledDate).toLocaleDateString() : 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Duration</label>
                                    <div className="flex items-center text-slate-900 font-bold text-sm">
                                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                                        {viewRequest.duration} Hours
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
                                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                    {viewRequest.description || "No additional description provided for this job."}
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black mr-3 uppercase">
                                        {viewRequest.requestedBy?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Requested By</div>
                                        <div className="text-sm font-bold text-slate-800">{viewRequest.requestedBy?.name || 'Unknown User'}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewRequest(null)}
                                    className="px-6 py-2.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW REQUEST MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Maintenance Job</h2>
                                <p className="text-sm text-slate-500 font-medium">Fill in the technical requirements below</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-white">
                            <form id="maintenanceForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subject (What is wrong?) *</label>
                                    <input required type="text" placeholder="e.g. Oil Leakage, Hydraulic Leakage" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Affected Equipment *</label>
                                    <div className="relative group">
                                        <select required value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                                            className="w-full appearance-none px-5 py-3 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            <option value="" className="text-slate-400">Select Machine</option>
                                            {equipment.map(eq => <option key={eq._id} value={eq._id} className="text-slate-900">{eq.name} — {eq.serialNumber}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Assigned Team *</label>
                                    <div className="relative group">
                                        <select required value={formData.assignedTeam} onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                                            className="w-full appearance-none px-5 py-3 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            <option value="" className="text-slate-400">Select Team</option>
                                            {teams.map(t => <option key={t._id} value={t._id} className="text-slate-900">{t.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Requested By *</label>
                                    <div className="relative group">
                                        <select required value={formData.requestedBy} onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                            className="w-full appearance-none px-5 py-3 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            <option value="" className="text-slate-400">Select Name</option>
                                            {users.map(u => <option key={u._id} value={u._id} className="text-slate-900">{u.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Job Category</label>
                                    <div className="relative group">
                                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full appearance-none px-5 py-3 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            <option value="Corrective">Corrective (Breakdown)</option>
                                            <option value="Preventive">Preventive (Routine)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Priority Level</label>
                                    <div className="relative group">
                                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full appearance-none px-5 py-3 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Execution Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10 group-hover:text-blue-500 transition-colors" />
                                        <input type="date" className="relative z-0 w-full pl-12 pr-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer shadow-sm"
                                            value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} onClick={(e) => e.target.showPicker?.()} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estimated Time (Hrs)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                        <input type="number" step="0.5" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full pl-12 pr-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Job Description & Observations</label>
                                    <textarea rows={4} placeholder="Briefly explain the maintenance procedure..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner resize-none" />
                                </div>
                            </form>
                        </div>
                        <div className="px-8 py-6 border-t bg-slate-50 flex justify-end gap-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-3 text-sm font-black text-slate-500 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-100 transition-all active:scale-95">Discard</button>
                            <button type="submit" form="maintenanceForm" className="px-10 py-3 text-sm font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">Launch Job</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}