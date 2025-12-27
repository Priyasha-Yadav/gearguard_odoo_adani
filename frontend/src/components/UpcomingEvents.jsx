import React from 'react';

const UpcomingEvents = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
      <div className="space-y-4">
        <p className="text-gray-600">No upcoming events.</p>
      </div>
    </div>
  );
};

export default UpcomingEvents;