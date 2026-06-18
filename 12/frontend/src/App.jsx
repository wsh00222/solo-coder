import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StatsBoard from './components/StatsBoard';
import ActivityList from './pages/ActivityList';
import ActivityDetail from './pages/ActivityDetail';
import { statsApi } from './services/api';

export default function App() {
  const [stats, setStats] = useState({
    totalActivities: 0,
    openActivities: 0,
    totalRegistrations: 0,
    checkedInCount: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const result = await statsApi.getGlobalStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 60000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  return (
    <Router>
      <div className="app-container">
        <div className="app-header">
          <h1>📅 活动报名与签到管理系统</h1>
          <StatsBoard stats={stats} />
        </div>
        <div className="app-content">
          <Routes>
            <Route path="/" element={<ActivityList refreshStats={fetchStats} />} />
            <Route path="/activity/:id" element={<ActivityDetail refreshStats={fetchStats} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
