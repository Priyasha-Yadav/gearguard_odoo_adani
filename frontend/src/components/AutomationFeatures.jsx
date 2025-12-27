import { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AutomationFeatures() {
  const [notifications, setNotifications] = useState([]);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    checkOverdueRequests();
    const interval = setInterval(checkOverdueRequests, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkOverdueRequests = async () => {
    try {
      const response = await maintenanceRequestAPI.getRequests({
        stage: 'New',
        type: 'Preventive'
      });
      
      const overdue = response.data.requests.filter(request => 
        request.scheduledDate && new Date(request.scheduledDate) < new Date()
      );
      
      setOverdueCount(overdue.length);
      
      if (overdue.length > 0) {
        setNotifications(overdue.map(request => ({
          id: request._id,
          type: 'overdue',
          message: `Overdue: ${request.subject} for ${request.equipment.name}`,
          equipment: request.equipment.name,
          scheduledDate: request.scheduledDate
        })));
      }
    } catch (error) {
      console.error('Error checking overdue requests:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-2 max-w-sm">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Overdue Maintenance</h4>
              <p className="text-xs text-gray-600 mt-1">
                {overdueCount} preventive maintenance request{overdueCount !== 1 ? 's' : ''} overdue
              </p>
              <div className="mt-2 space-y-1">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                    {notification.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button className="relative bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors">
        <Bell className="w-5 h-5" />
        {overdueCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {overdueCount > 99 ? '99+' : overdueCount}
          </span>
        )}
      </button>
    </div>
  );
}