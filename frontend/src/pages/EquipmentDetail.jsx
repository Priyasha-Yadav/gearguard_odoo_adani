import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { equipmentAPI, maintenanceRequestAPI } from '../services/api';
import {
    ArrowLeft,
    Wrench,
    MapPin,
    User,
    Calendar,
    Clock,
    Edit,
    Trash2,
    Plus,
    AlertCircle
} from 'lucide-react';

export default function EquipmentDetail() {
    const { id } = useParams();
    const [equipment, setEquipment] = useState(null);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        fetchEquipmentDetail();
    }, [id]);

    const fetchEquipmentDetail = async () => {
        try {
            const [equipmentResponse, requestsResponse] = await Promise.all([
                equipmentAPI.getEquipmentById(id),
                equipmentAPI.getEquipmentMaintenance(id)
            ]);
            setEquipment(equipmentResponse.data);
            setMaintenanceRequests(requestsResponse.data.requests);
        } catch (error) {
            console.error('Error fetching equipment detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading equipment details...</div>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Equipment not found</h3>
                <p className="text-gray-500">The equipment you're looking for doesn't exist.</p>
                <Link
                    to="/equipment"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Equipment
                </Link>
            </div>
        );
    }

    const openRequestsCount = maintenanceRequests.filter(req =>
        req.stage === 'New' || req.stage === 'In Progress'
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        to="/equipment"
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
                        <p className="text-gray-600">Equipment Details</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                                <p className="mt-1 text-sm text-gray-900">{equipment.serialNumber}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Category</label>
                                <span className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {equipment.category}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Department</label>
                                <p className="mt-1 text-sm text-gray-900">{equipment.department}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Status</label>
                                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${equipment.status === 'Operational' ? 'bg-green-100 text-green-800' :
                                        equipment.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {equipment.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Location</label>
                                <div className="mt-1 flex items-center text-sm text-gray-900">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    {equipment.location}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                                <div className="mt-1 flex items-center text-sm text-gray-900">
                                    <User className="w-4 h-4 mr-1 text-gray-400" />
                                    {equipment.assignedTo?.name || 'Unassigned'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Purchase Date</label>
                                <div className="mt-1 flex items-center text-sm text-gray-900">
                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                    {new Date(equipment.purchaseDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Warranty Expiry</label>
                                <div className="mt-1 flex items-center text-sm text-gray-900">
                                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                    {equipment.warrantyExpiry ?
                                        new Date(equipment.warrantyExpiry).toLocaleDateString() :
                                        'No warranty'
                                    }
                                </div>
                            </div>
                        </div>
                        {equipment.description && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-sm text-gray-900">{equipment.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Maintenance History</h2>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {maintenanceRequests.length} Total Requests
                            </span>
                        </div>
                        <div className="space-y-3">
                            {maintenanceRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No maintenance requests found</p>
                            ) : (
                                maintenanceRequests.map((request) => (
                                    <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900">{request.subject}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                                                <div className="flex items-center mt-2 space-x-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${request.stage === 'New' ? 'bg-yellow-100 text-yellow-800' :
                                                            request.stage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                request.stage === 'Repaired' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                        }`}>
                                                        {request.stage}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {request.assignedTechnician && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <User className="w-4 h-4 mr-1" />
                                                        {request.assignedTechnician.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Team</h2>
                        {equipment.maintenanceTeam ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900">{equipment.maintenanceTeam.name}</p>
                                <p className="text-sm text-gray-600">{equipment.maintenanceTeam.specialization}</p>
                                {equipment.defaultTechnician && (
                                    <div className="mt-2">
                                        <label className="block text-xs font-medium text-gray-500">Default Technician</label>
                                        <p className="text-sm text-gray-900">{equipment.defaultTechnician.name}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No team assigned</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Open Requests</span>
                                <span className="text-sm font-semibold text-gray-900">{openRequestsCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Requests</span>
                                <span className="text-sm font-semibold text-gray-900">{maintenanceRequests.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Equipment Age</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {Math.floor((new Date() - new Date(equipment.purchaseDate)) / (365.25 * 24 * 60 * 60 * 1000))} years
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Wrench className="w-4 h-4 mr-2" />
                        View All Maintenance ({openRequestsCount} Open)
                    </button>
                </div>
            </div>
        </div>
    );
}