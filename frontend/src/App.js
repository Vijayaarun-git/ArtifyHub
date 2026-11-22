import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './components/Login';
import ToastContainer from './components/common/ToastContainer';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './components/dashboard/HomePage';
import ArtistDashboard from './components/dashboard/ArtistDashboard';
import ArtworkList from './components/artwork/ArtworkList';
import ArtworkForm from './components/artwork/ArtworkForm';
import WishlistPage from './components/artwork/WishlistPage';
import TransactionList from './components/transaction/TransactionList';
import PortfolioPage from './components/portfolio/PortfolioPage';
import PublicPortfolioPage from './components/portfolio/PublicPortfolioPage';
import CuratorDashboard from './components/dashboard/CuratorDashboard';
import NotificationStack from './components/NotificationStack';
import ProfilePage from './components/profile/ProfilePage';
import LegalPage from './components/legal/LegalPage';
import { logout } from './store/slices/authSlice';
import { fetchMarketplace } from './store/slices/artworkSlice';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function DashboardRouter() {
  const role = useSelector((state) => state.auth?.role);
  if (role === 'DIGITAL_ARTIST') {
    return <ArtistDashboard />;
  }
  if (role === 'PLATFORM_CURATOR') {
    return <CuratorDashboard />;
  }
  return <HomePage />;
}

function AppShell({ children, onOpenUpload }) {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const handleAuthExpired = () => dispatch(logout());
    window.addEventListener('artify:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('artify:auth-expired', handleAuthExpired);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenUpload={onOpenUpload} />
      <main className="flex-1">
        {children}
      </main>
      {location.pathname === '/' && <Footer />}
      <NotificationStack />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const [globalUploadOpen, setGlobalUploadOpen] = useState(false);

  useEffect(() => {
    // Each application launch starts the demo catalog with every artwork available.
    // Auth/profile data is intentionally preserved so browser reloads do not log users out.
    [
      'artify_demo_purchases',
      'artify_demo_hidden',
      'artify_demo_artist_sales',
      'artify_demo_artist_overrides',
      'artify_demo_artist_deleted',
    ].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem('artify_demo_catalog_version', 'artify_demo_catalog_v6');
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell onOpenUpload={() => setGlobalUploadOpen(true)}>
        <Routes>
          {/* Login is the only entry point for unauthenticated visitors. */}
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/terms-of-service" element={<LegalPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={['ART_COLLECTOR']}>
                <ArtworkList />
              </ProtectedRoute>
            }
          />
          <Route path="/explore" element={<Navigate to="/marketplace" replace />} />
          <Route
            path="/artists/:artistId"
            element={
              <ProtectedRoute allowedRoles={['ART_COLLECTOR']}>
                <PublicPortfolioPage />
              </ProtectedRoute>
            }
          />

          {/* Role-Aware Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/curator"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_CURATOR']}>
                <CuratorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Collector Vault & Wishlist */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vault"
            element={
              <ProtectedRoute allowedRoles={['ART_COLLECTOR']}>
                <TransactionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ART_COLLECTOR']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Artist Portfolio */}
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute allowedRoles={['DIGITAL_ARTIST']}>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Creator Upload Modal */}
        {globalUploadOpen && (
          <ArtworkForm
            onClose={() => setGlobalUploadOpen(false)}
            onCreated={() => {
              setGlobalUploadOpen(false);
              dispatch(fetchMarketplace({}));
            }}
          />
        )}
      </AppShell>
    </BrowserRouter>
  );
}
