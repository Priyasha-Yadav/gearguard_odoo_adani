import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { equipmentAPI, authAPI } from '../services/api';
import {
    Plus,
    Search,
    Filter,
    Wrench,
    MapPin,
    User,
    Calendar,
    Edit,
    Trash2,
    AlertCircle,
    Eye,
    Settings,
    Zap,
    Shield,
    Activity
} from 'lucide-react';

const INITIAL_FORM_DATA = {
    name: '',
    serialNumber: '',
    category: 'Other',
    department: '',
    assignedTo: '',
    maintenanceTeam: '',
    defaultTechnician: '',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    description: '',
};

export default function EquipmentList() {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const categories = ['CNC Machine', 'Vehicle', 'Computer', 'Printer', 'Other'];
    const departments = ['Production', 'IT', 'Maintenance', 'Administration', 'Logistics'];

    useEffect(() => {
        fetchEquipment();
        fetchUsers();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.getEquipment();
            setEquipment(response.data.equipment);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };

        Object.keys(payload).forEach((key) => {
            if (payload[key] === '') {
                delete payload[key];
            }
        });

        try {
            await equipmentAPI.createEquipment(payload);
            toast.success('Equipment created successfully!');
            setShowAddModal(false);
            setFormData({
                name: '',
                serialNumber: '',
                category: 'Other',
                department: '',
                assignedTo: '',
                maintenanceTeam: '',
                defaultTechnician: '',
                purchaseDate: '',
                warrantyExpiry: '',
                location: '',
                description: '',
            });
            fetchEquipment();
        } catch (error) {
            console.error('Error creating equipment:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to create equipment');
        }
    };


    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this equipment?');

        if (confirmed) {
            try {
                await equipmentAPI.deleteEquipment(id);
                toast.success('Equipment deleted successfully!');
                fetchEquipment();
            } catch (error) {
                console.error('Error deleting equipment:', error);
                toast.error('Cannot delete equipment with open maintenance requests');
            }
        }
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = !filterDepartment || item.department === filterDepartment;
        const matchesCategory = !filterCategory || item.category === filterCategory;

        return matchesSearch && matchesDepartment && matchesCategory;
    });

    const operationalCount = useMemo(() =>
        filteredEquipment.filter(e => e.status === 'Operational').length,
        [filteredEquipment]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500 font-medium">Loading equipment...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                    <Settings className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Equipment Management
                                    </h1>
                                    <p className="text-gray-600 mt-1">Monitor and manage your company assets efficiently</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-gray-500 flex items-center">
                                            <Activity className="w-4 h-4 mr-1" />
                                            {filteredEquipment.length} Total Assets
                                        </span>
                                        <span className="text-sm text-green-600 flex items-center">
                                            <Zap className="w-4 h-4 mr-1" />
                                            {operationalCount} Operational
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                data-add-equipment
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Equipment
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search equipment or serial number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-105">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md inline-block">
                                                SN: {item.serialNumber}
                                            </p>
                                        </div>
                                        <div className={`p-2 rounded-xl ${item.status === 'Operational' ? 'bg-green-100' :
                                                item.status === 'Under Maintenance' ? 'bg-yellow-100' :
                                                    'bg-red-100'
                                            }`}>
                                            {item.status === 'Operational' ? (
                                                <Shield className="w-5 h-5 text-green-600" />
                                            ) : item.status === 'Under Maintenance' ? (
                                                <Wrench className="w-5 h-5 text-yellow-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Category & Department */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                                            {item.category}
                                        </span>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                                            {item.department}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="font-medium">
                                                {item.assignedTo?.name || 'Unassigned'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>{item.location}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span className={`px-3 py-2 text-sm font-semibold rounded-xl inline-flex items-center ${item.status === 'Operational'
                                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                                                item.status === 'Under Maintenance'
                                                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                                                    'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full mr-2 ${item.status === 'Operational' ? 'bg-green-500' :
                                                    item.status === 'Under Maintenance' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}></div>
                                            {item.status}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/equipment/${item._id}`}
                                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => {
                                                // Navigate to maintenance requests filtered by this equipment
                                                window.location.href = `/maintenance-requests?equipment=${item._id}`;
                                            }}
                                            className="relative flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                                            title="View Maintenance Requests"
                                        >
                                            <Wrench className="w-4 h-4" />
                                            {item.openRequestsCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {item.openRequestsCount}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete Equipment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredEquipment.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <Settings className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Equipment Found</h3>
                            <p className="text-gray-600 mb-6">No equipment matches your current search criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterDepartment('');
                                    setFilterCategory('');
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                <div className="p-8">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Add New Equipment</h2>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                                    placeholder="Enter equipment name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.serialNumber}
                                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                                    placeholder="Enter serial number"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                                                <select
                                                    value={formData.assignedTo}
                                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                                >
                                                    <option value="">Select User</option>
                                                    {users.map(user => (
                                                        <option key={user._id} value={user._id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900 placeholder-gray-500"
                                                    placeholder="Enter location"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.purchaseDate}
                                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Warranty Expiry</label>
                                                <input
                                                    type="date"
                                                    value={formData.warrantyExpiry}
                                                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors resize-none text-gray-900 placeholder-gray-500"
                                                placeholder="Enter equipment description (optional)"
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
                                                Add Equipment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}