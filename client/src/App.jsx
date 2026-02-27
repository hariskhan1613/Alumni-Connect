import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AlumniDirectoryPage from './pages/AlumniDirectoryPage';
import ChatPage from './pages/ChatPage';
import JobsPage from './pages/JobsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AIProfilePage from './pages/AIProfilePage';
import ResumeOptimizerPage from './pages/ResumeOptimizerPage';
import ReferralMatchPage from './pages/ReferralMatchPage';
import SessionBookingPage from './pages/SessionBookingPage';
import SkillGrowthPage from './pages/SkillGrowthPage';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
      }} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/directory" element={<AlumniDirectoryPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:userId" element={<ChatPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/ai-profile" element={<AIProfilePage />} />
          <Route path="/resume" element={<ResumeOptimizerPage />} />
          <Route path="/referrals" element={<ReferralMatchPage />} />
          <Route path="/sessions" element={<SessionBookingPage />} />
          <Route path="/skill-growth" element={<SkillGrowthPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
