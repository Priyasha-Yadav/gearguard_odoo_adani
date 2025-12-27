import { useState, useEffect } from 'react';
import { maintenanceRequestAPI } from '../services/api';

export default function MiniCalendar() {
  const [events, setEvents] = useState([]);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      const response = await maintenanceRequestAPI.getCalendarData({
        start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
        end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString()
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const days = [];
  const date = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isEventDay = (day) => {
    return events.some(event => {
      const eventDate = new Date(event.scheduledDate || event.start);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const isToday = (day) => {
    return day.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (day) => {
    return day.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">
          {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
          {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => changeMonth(-1)} 
            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-white flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            ‹
          </button>
          <button 
            onClick={() => changeMonth(1)} 
            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-white flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <span key={d} className="font-medium py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors ${
              isToday(day)
                ? 'bg-blue-500 text-white font-semibold'
                : isEventDay(day)
                ? 'bg-green-100 text-green-700 font-medium'
                : isCurrentMonth(day)
                ? 'text-gray-700 hover:bg-white'
                : 'text-gray-400'
            }`}
          >
            {day.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}
