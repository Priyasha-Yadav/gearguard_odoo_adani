import { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import timeGridPlugin from '@fullcalendar/timegrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import toast from 'react-hot-toast';
import { maintenanceRequestAPI, maintenanceTeamAPI, equipmentAPI } from '../services/api';
import {
    Calendar as CalendarIcon,
    Clock,
    Wrench,
    User,
    AlertTriangle,
    Filter,
    Plus,
    X
} from 'lucide-react';

export default function CalendarView() {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventForm, setEventForm] = useState({
        subject: '',
        description: '',
        equipment: '',
        priority: 'Medium'
    });
    const [filters, setFilters] = useState({
        team: '',
        start: '',
        end: ''
    });

    const fetchTeams = useCallback(async () => {
        try {
            const response = await maintenanceTeamAPI.getTeams();
            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, []);

    const fetchEquipment = useCallback(async () => {
        try {
            const response = await equipmentAPI.getEquipment();
            setEquipment(response.data.equipment);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    }, []);

    const fetchCalendarEvents = useCallback(async () => {
        try {
            const response = await maintenanceRequestAPI.getCalendarData(filters);
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([fetchTeams(), fetchEquipment()]);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, [fetchTeams, fetchEquipment]);

    useEffect(() => {
        fetchCalendarEvents();
    }, [fetchCalendarEvents]);

    const upcomingEvents = useMemo(() => {
        return events
            .filter(event => new Date(event.start) >= new Date())
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5);
    }, [events]);

    const overdueTasks = useMemo(() => {
        return events.filter(event => new Date(event.start) < new Date() && event.extendedProps.stage === 'New');
    }, [events]);

    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: events.length,
            thisMonth: events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.getMonth() === now.getMonth() &&
                    eventDate.getFullYear() === now.getFullYear();
            }).length,
            overdue: overdueTasks.length,
            critical: events.filter(event => event.extendedProps.priority === 'Critical').length
        };
    }, [events, overdueTasks]);

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo.startStr);
        setShowEventModal(true);
        selectInfo.view.calendar.unselect();
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        toast.info(`${event.title} - ${event.extendedProps.equipment?.name || 'No equipment'} (${event.extendedProps.team?.name || 'No team'})`);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        if (!eventForm.subject || !eventForm.equipment) {
            toast.error('Subject and equipment are required');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            toast.error('User not authenticated');
            return;
        }

        try {
            const requestData = {
                subject: eventForm.subject,
                description: eventForm.description,
                type: 'Preventive',
                priority: eventForm.priority,
                equipment: eventForm.equipment,
                requestedBy: currentUser.id,
                scheduledDate: selectedDate
            };

            await maintenanceRequestAPI.createRequest(requestData);
            toast.success('Maintenance event created successfully!');
            setShowEventModal(false);
            setEventForm({ subject: '', description: '', equipment: '', priority: 'Medium' });
            fetchCalendarEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create maintenance event');
        }
    };

    const getEventClassNames = (eventInfo) => {
        const priority = eventInfo.event.extendedProps.priority;
        const stage = eventInfo.event.extendedProps.stage;

        let classes = ['cursor-pointer'];

        if (priority === 'Critical') classes.push('bg-red-500', 'text-white');
        else if (priority === 'High') classes.push('bg-orange-500', 'text-white');
        else if (priority === 'Medium') classes.push('bg-blue-500', 'text-white');
        else classes.push('bg-gray-500', 'text-white');

        if (stage === 'New') classes.push('border-2', 'border-yellow-400');
        else if (stage === 'In Progress') classes.push('border-2', 'border-blue-400');

        return classes.join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading calendar...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
                    <p className="text-gray-600">View and schedule preventive maintenance</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <select
                            value={filters.team}
                            onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Teams</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Critical Priority
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                            High Priority
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Medium Priority
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                            Low Priority
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        initialView="dayGridMonth"
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        events={events}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        eventClassNames={getEventClassNames}
                        height="auto"
                        aspectRatio={1.8}
                        eventDidMount={(info) => { }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Maintenance</h3>
                    <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-2 h-2 rounded-full mt-2 ${event.extendedProps.priority === 'Critical' ? 'bg-red-500' :
                                    event.extendedProps.priority === 'High' ? 'bg-orange-500' :
                                        event.extendedProps.priority === 'Medium' ? 'bg-blue-500' :
                                            'bg-gray-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-gray-600">{new Date(event.start).toLocaleDateString()}</p>
                                    {event.extendedProps.equipment && (
                                        <div className="flex items-center mt-1">
                                            <Wrench className="w-3 h-3 text-gray-400 mr-1" />
                                            <p className="text-xs text-gray-500">{event.extendedProps.equipment.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {upcomingEvents.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No upcoming maintenance scheduled</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Tasks</h3>
                    <div className="space-y-3">
                        {overdueTasks.map((event) => (
                            <div key={event.id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                    <p className="text-xs text-red-600">Overdue by {Math.floor((new Date() - new Date(event.start)) / (1000 * 60 * 60 * 24))} days</p>
                                    {event.extendedProps.equipment && (
                                        <div className="flex items-center mt-1">
                                            <Wrench className="w-3 h-3 text-gray-400 mr-1" />
                                            <p className="text-xs text-gray-500">{event.extendedProps.equipment.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {overdueTasks.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No overdue tasks</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Scheduled</span>
                            <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">This Month</span>
                            <span className="text-sm font-semibold text-gray-900">{stats.thisMonth}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Overdue</span>
                            <span className="text-sm font-semibold text-red-600">{stats.overdue}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Critical Priority</span>
                            <span className="text-sm font-semibold text-red-600">{stats.critical}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Create Maintenance Event</h3>
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={eventForm.subject}
                                        onChange={(e) => setEventForm({ ...eventForm, subject: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        placeholder="Enter event subject"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                                    <select
                                        required
                                        value={eventForm.equipment}
                                        onChange={(e) => setEventForm({ ...eventForm, equipment: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipment.map(eq => (
                                            <option key={eq._id} value={eq._id}>{eq.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={eventForm.priority}
                                        onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={eventForm.description}
                                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        placeholder="Enter description (optional)"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Scheduled for: {new Date(selectedDate).toLocaleDateString()}
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEventModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Create Event
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