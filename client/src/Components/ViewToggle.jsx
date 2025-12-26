import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

export default function ViewToggle() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleViewSwitch = (view) => {
    navigate(view);
  };

  const canAccessOfficialView = user?.role === 'official' || user?.role === 'admin';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewSwitch('/user-view')}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            User View
          </button>
          {canAccessOfficialView && (
            <button
              onClick={() => handleViewSwitch('/official-view')}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
            >
              Official View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
