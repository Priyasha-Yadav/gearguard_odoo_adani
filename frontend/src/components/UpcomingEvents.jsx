import { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await maintenanceRequestAPI.getRequests({
        type: 'Preventive',
        stage: 'New',
        limit: 4
      });
      const requests = response.data.requests || [];
      const upcomingEvents = requests
        .filter(request => request.scheduledDate && new Date(request.scheduledDate) >= new Date())
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Upcoming Events
      </h4>
      
      {events.length === 0 ? (
        <div className="text-center py-4">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => {
            const eventDate = new Date(event.scheduledDate);
            const isOverdue = eventDate < new Date() && event.stage === 'New';
            
            return (
              <div
                key={event._id || event.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isOverdue 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.subject}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.equipment?.name || 'No equipment'}
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                      <span className={`text-xs ${
                        isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                      }`}>
                        {new Date(event.scheduledDate).toLocaleDateString()}
                      </span>
                      {isOverdue && (
                        <AlertTriangle className="w-3 h-3 text-red-500 ml-1" />
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    event.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    event.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {event.priority || 'Medium'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
