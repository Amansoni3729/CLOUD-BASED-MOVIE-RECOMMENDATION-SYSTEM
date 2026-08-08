import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Personalized from './pages/Personalized';
import Profile from './pages/Profile';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 frosted-main min-h-[calc(100vh-64px)] overflow-x-hidden custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
    <h1 className="text-9xl font-black text-brand italic">404</h1>
    <p className="text-2xl font-bold">Page lost in the clouds</p>
    <a href="/" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-brand hover:text-white transition-all">Go Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface-dark text-white selection:bg-brand">
          <Routes>
            {/* Public Routes - No Navbar/Sidebar */}
            <Route path="/" element={<><Navbar /><Landing /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/register" element={<><Navbar /><Register /></>} />

            {/* Private Routes with Sidebar Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/personalized" element={<Personalized />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Utility Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'glass-card text-white border border-white/10 px-6 py-4',
              style: {
                background: 'rgba(20, 20, 20, 0.8)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600'
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
