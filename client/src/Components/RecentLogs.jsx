import { useEffect, useState } from 'react';

export default function RecentLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/admin/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLogs(data.data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No logs</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {logs.map((l) => (
            <li key={l.id} className="flex justify-between">
              <span>{l.text}</span>
              <span className="text-gray-500">{new Date(l.time).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
