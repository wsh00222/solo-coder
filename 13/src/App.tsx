import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Dumbbell, Home, Flame } from 'lucide-react';
import PlanListPage from './pages/PlanListPage';
import PlanDetailPage from './pages/PlanDetailPage';
import { StatsBoard } from './components/StatsBoard';
import { ReminderBanner } from './components/ReminderBanner';
import { Toast } from './components/Toast';
import { useAppStore } from './store/appStore';

export default function App() {
  const { refreshAll } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      useAppStore.getState().fetchStats();
      useAppStore.getState().fetchReminder();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const isDetailPage = location.pathname.startsWith('/plan/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-gray-800 leading-tight">FitLog</div>
                <div className="text-[11px] text-gray-500 leading-tight">个人健身训练日志</div>
              </div>
            </NavLink>
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`
                }
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">计划</span>
              </NavLink>
              {isDetailPage && (
                <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700">
                  <Flame className="w-4 h-4" />
                  <span className="hidden sm:inline">详情</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-5 mb-6">
          <StatsBoard />
          <ReminderBanner />
        </div>
        <Routes>
          <Route path="/" element={<PlanListPage />} />
          <Route path="/plan/:id" element={<PlanDetailPage />} />
          <Route path="*" element={<PlanListPage />} />
        </Routes>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-gray-400">
        FitLog · 记录每一次训练，见证每一次蜕变 💪
      </footer>

      <Toast />
    </div>
  );
}
