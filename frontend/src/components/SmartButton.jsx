import { Link } from 'react-router-dom';
import { Wrench, AlertCircle } from 'lucide-react';

export default function SmartButton({ equipmentId, openRequestsCount }) {
  return (
    <Link
      to={`/equipment/${equipmentId}/maintenance`}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative"
    >
      <Wrench className="w-4 h-4 mr-2" />
      Maintenance
      {openRequestsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {openRequestsCount > 99 ? '99+' : openRequestsCount}
        </span>
      )}
    </Link>
  );
}
