import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MeetingList from './pages/MeetingList.jsx';
import MeetingDetail from './pages/MeetingDetail.jsx';
import MeetingForm from './pages/MeetingForm.jsx';
import { getStats } from './api.js';

export default function App() {
  const [stats, setStats] = useState({ weekTotal: 0, todayTotal: 0, avgDuration: 0, attendees: [] });
  const [selectedAttendee, setSelectedAttendee] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      console.error('加载统计数据失败', e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleAttendeeClick = (name) => {
    if (selectedAttendee === name) {
      setSelectedAttendee('');
    } else {
      setSelectedAttendee(name);
    }
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const showSidebar = true;

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar
          attendees={stats.attendees}
          selectedAttendee={selectedAttendee}
          onAttendeeClick={handleAttendeeClick}
        />
      )}
      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <MeetingList
                selectedAttendee={selectedAttendee}
                onAttendeeChange={setSelectedAttendee}
                onDataChange={loadStats}
                stats={stats}
              />
            }
          />
          <Route path="/meetings/:id" element={<MeetingDetail onDataChange={loadStats} />} />
          <Route path="/create" element={<MeetingForm onDataChange={loadStats} />} />
          <Route path="/edit/:id" element={<MeetingForm onDataChange={loadStats} />} />
        </Routes>
      </div>
    </div>
  );
}
