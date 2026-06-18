import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlanDetailPage from './pages/PlanDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plans/:id" element={<PlanDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
