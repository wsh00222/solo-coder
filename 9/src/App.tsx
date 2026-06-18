import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlanList from "@/pages/PlanList";
import PlanDetail from "@/pages/PlanDetail";
import { ToastContainer } from "@/components/ToastContainer";

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<PlanList />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
      </Routes>
    </Router>
  );
}
