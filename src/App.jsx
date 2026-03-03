import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Global Styles
import './index.css';
import './App.css';

// Presentational Components
import ScrollToTop from './components/presentational/ScrollToTop';
import GuestLayout from './components/presentational/GuestLayout';
import AdminLayout from './components/presentational/AdminLayout'; // This will protect your admin routes

//Extras
import AnimatedBackground from './components/extras/AnimatedBackground';

// --- LAZY LOADED PAGES ---
// Guest Pages
const GuestLogin = React.lazy(() => import('./pages/guest/GuestLogin'));
const GuestDashboard = React.lazy(() => import('./pages/guest/GuestDashboard'));
const GuestWelcomePage = React.lazy(() => import('./pages/guest/GuestWelcomePage'));
const GuestWelcomeMeetingPage = React.lazy(() => import('./pages/guest/GuestWelcomeMeetingPage'));
const GuestDailyToursPage = React.lazy(() => import('./pages/guest/GuestDailyToursPage'));
const GuestFarewellPage = React.lazy(() => import('./pages/guest/GuestFarewellPage'));

// Admin Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminWelcomeEmailEdit = React.lazy(() => import('./pages/admin/AdminWelcomeEmailEdit'));
const AdminWelcomeMeetingEdit = React.lazy(() => import('./pages/admin/AdminWelcomeMeetingEdit'));
const AdminDailyInfoEdit = React.lazy(() => import('./pages/admin/AdminDailyInfoEdit'));
const AdminFarewellEdit = React.lazy(() => import('./pages/admin/AdminFarewellEdit'));

// Fallback UI
const LoadingFallback = () => (
  <div className="loading-spinner" style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
    Loading OAT Tours...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedBackground />
      <Toaster />    
      <Suspense fallback={<LoadingFallback />}>
        <Routes>


          {/* ----------------- GUEST ROUTES ----------------- */}
          {/* Guest Public Route (Login) */}
          <Route path="/login" element={<GuestLogin />} />
          {/* Guest Protected Routes (Everything inside GuestLayout) */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<GuestDashboard />} />
            <Route path="welcome-email" element={<GuestWelcomePage />} />
            <Route path="welcome-meeting" element={<GuestWelcomeMeetingPage />} />
            <Route path="daily-info" element={<GuestDailyToursPage />} />
            <Route path="farewell" element={<GuestFarewellPage />} />
          </Route>


          {/* ----------------- ADMIN ROUTES ----------------- */}
          {/* Public Admin Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Protected Admin Routes (Wrapped in AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="edit-welcome-email" element={<AdminWelcomeEmailEdit />} />
            <Route path="edit-welcome-meeting" element={<AdminWelcomeMeetingEdit />} />
            <Route path="edit-daily-info" element={<AdminDailyInfoEdit />} />
            <Route path="edit-farewell" element={<AdminFarewellEdit />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;