import {
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    Wrench,
    Clock,
    Trash2,
    TrendingUp,
    Activity,
    Zap,
    Shield
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';

import MiniCalendar from "../components/MiniCalendar";
import UpcomingEvents from "../components/UpcomingEvents";

function StatCard({ icon: Icon, label, value, color, trend }) {
    const colorMap = {
        indigo: "from-indigo-500 to-purple-600",
        violet: "from-violet-500 to-purple-600",
        emerald: "from-emerald-500 to-teal-600",
        rose: "from-rose-500 to-pink-600",
        amber: "from-amber-500 to-orange-600",
        slate: "from-slate-500 to-gray-600",
    };

    const bgColorMap = {
        indigo: "bg-gradient-to-br from-indigo-50 to-purple-50",
        violet: "bg-gradient-to-br from-violet-50 to-purple-50",
        emerald: "bg-gradient-to-br from-emerald-50 to-teal-50",
        rose: "bg-gradient-to-br from-rose-50 to-pink-50",
        amber: "bg-gradient-to-br from-amber-50 to-orange-50",
        slate: "bg-gradient-to-br from-slate-50 to-gray-50",
    };

    return (
        <div className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${bgColorMap[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${colorMap[color]} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 leading-tight">{value}</p>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        inProgress: 0,
        repaired: 0,
        scrap: 0,
        preventive: 0,
        corrective: 0,
        overdue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await maintenanceRequestAPI.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEquipment = () => {
        navigate('/equipment', { state: { openModal: 'add' } });
    };

    const handleCreateTeam = () => {
        navigate('/maintenance-teams', { state: { openModal: 'add' } });
    };

    const handleNewRequest = () => {
        navigate('/maintenance-requests', { state: { openModal: 'add' } });
    };
    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Monitor and manage your maintenance operations in real-time
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center">
                                <Shield className="w-4 h-4 mr-1 text-green-500" />
                                System Online
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                                <Zap className="w-4 h-4 mr-1 text-blue-500" />
                                Last Updated: Just now
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* KPI Grid */}
                <div className="xl:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Key Metrics</h2>
                        <p className="text-gray-600">Track your maintenance performance at a glance</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={ClipboardList} label="Total Requests" value={loading ? "..." : stats.total} color="indigo" trend={true} />
                        <StatCard icon={Clock} label="In Progress" value={loading ? "..." : stats.inProgress} color="violet" />
                        <StatCard icon={CheckCircle} label="Completed" value={loading ? "..." : stats.repaired} color="emerald" trend={true} />
                        <StatCard icon={AlertTriangle} label="Overdue" value={loading ? "..." : stats.overdue} color="rose" />
                        <StatCard icon={Wrench} label="Preventive" value={loading ? "..." : stats.preventive} color="amber" />
                        <StatCard icon={Trash2} label="Scrap" value={loading ? "..." : stats.scrap} color="slate" />
                    </div>
                </div>

                {/* Enhanced Calendar Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Maintenance Schedule</h3>
                            <p className="text-sm text-gray-600">Upcoming maintenance tasks</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500">Live</span>
                        </div>
                    </div>

                    <MiniCalendar />

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <UpcomingEvents />
                    </div>
                </div>
            </div>

            {/* Enhanced Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                            <p className="text-sm text-gray-600">Latest system updates</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">System initialized</p>
                                <p className="text-xs text-gray-500">Ready to track maintenance requests</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                            <p className="text-sm text-gray-600">Streamline your workflow</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleAddEquipment}
                            className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 flex items-center justify-between group"
                        >
                            <div className="flex items-center">
                                <Wrench className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mr-3" />
                                <span className="font-medium text-gray-700 group-hover:text-blue-700">Add Equipment</span>
                            </div>
                            <div className="w-6 h-6 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500 group-hover:text-blue-500">+</span>
                            </div>
                        </button>

                        <button
                            onClick={handleCreateTeam}
                            className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 flex items-center justify-between group"
                        >
                            <div className="flex items-center">
                                <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-purple-500 mr-3" />
                                <span className="font-medium text-gray-700 group-hover:text-purple-700">Create Team</span>
                            </div>
                            <div className="w-6 h-6 bg-gray-100 group-hover:bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500 group-hover:text-purple-500">+</span>
                            </div>
                        </button>

                        <button
                            onClick={handleNewRequest}
                            className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-between group"
                        >
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 mr-3" />
                                <span className="font-medium text-gray-700 group-hover:text-emerald-700">New Request</span>
                            </div>
                            <div className="w-6 h-6 bg-gray-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-500 group-hover:text-emerald-500">+</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}