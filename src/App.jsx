import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import HeroSlider from './components/HeroSlider';
import ScrollProgress from './components/ScrollProgress';
import About from './components/sections/About';
import Experts from './components/sections/Experts';
import FAQ from './components/sections/FAQ';
import Register from './components/sections/Register';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Bookings from './pages/admin/Bookings';
import Users from './pages/admin/Users';
import SessionsAdmin from './pages/admin/SessionsAdmin';
import Analytics from './pages/admin/Analytics';
import Notifications from './pages/admin/Notifications';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useClickTracker } from './hooks/useClickTracker';
import { logFunnelEvent } from './services/funnelService';
import SeparatorSpeaker from './components/SeparatorSpeaker';
import AuditLog from './pages/admin/AuditLog';

function PublicSite() {
  useEffect(() => {
    function reportHeight() {
      window.parent.postMessage({ type: 'PAGE_HEIGHT', height: document.documentElement.scrollHeight }, '*');
    }
    reportHeight();
    const observer = new ResizeObserver(reportHeight);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useClickTracker();
  useEffect(() => { logFunnelEvent('page_view'); }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      <HeroSlider />
      <SeparatorSpeaker />
      <About />
      <Experts />
      <Register />
      <FAQ />
      <Footer />
    </div>
  );
}
function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/admin/bookings" element={<Protected><Bookings /></Protected>} />
      <Route path="/admin/users" element={<Protected><Users /></Protected>} />
      <Route path="/admin/sessions" element={<Protected><SessionsAdmin /></Protected>} />
      <Route path="/admin/analytics" element={<Protected><Analytics /></Protected>} />
      <Route path="/admin/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/admin/audit" element={<Protected><AuditLog /></Protected>} />
    </Routes>
  );
}

export default App;