// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App




import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Global Styles
import './index.css';
import './App.css'; 

// Presentational Components
import ScrollToTop from './components/presentational/ScrollToTop';
import GuestLayout from './components/presentational/GuestLayout';
import AdminLayout from './components/presentational/AdminLayout'; // This will protect your admin routes

// --- LAZY LOADED PAGES ---
// Guest Pages
const GuestWelcomePage = React.lazy(() => import('./pages/guest/GuestWelcomePage'));
const DailyInfoPage = React.lazy(() => import('./pages/guest/DailyInfoPage'));

// Admin Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTourEdit = React.lazy(() => import('./pages/admin/AdminTourEdit'));

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
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          
          {/* ----------------- GUEST ROUTES ----------------- */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<GuestWelcomePage />} />
            <Route path="tour/:tourId/day/:dayId" element={<DailyInfoPage />} />
          </Route>

          {/* ----------------- ADMIN ROUTES ----------------- */}
          {/* Public Admin Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes (Wrapped in AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="edit/:tourId" element={<AdminTourEdit />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;