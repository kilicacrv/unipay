import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Launch Mode ──────────────────────────────────────────────────────────────
// 'landing' → Sadece landing page + kayıt formları açık
// 'full'    → Tüm platform açık
// Launch günü: Vercel > Settings > Environment Variables > VITE_LAUNCH_MODE = full → Redeploy
const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE || 'full';
const IS_FULL = LAUNCH_MODE === 'full';

// Helper: Landing modunda rotaları ana sayfaya yönlendir
const LaunchGate = ({ children }) => {
  if (!IS_FULL) return <Navigate to="/" replace />;
  return children;
};



// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// ─── Pages (Lazy Loaded) ──────────────────────────────────────────────────────
const Home         = lazy(() => import('./pages/Home'));
const BusinessForm = lazy(() => import('./pages/BusinessForm'));
const Register     = lazy(() => import('./pages/Register'));
const Login        = lazy(() => import('./pages/Login'));
const VerifyStudent= lazy(() => import('./pages/VerifyStudent'));
const Admin        = lazy(() => import('./pages/Admin'));
const Privacy      = lazy(() => import('./pages/Privacy'));
const Terms        = lazy(() => import('./pages/Terms'));

// Business Panel
const BusinessLayout   = lazy(() => import('./layouts/BusinessLayout'));
const BusinessDashboard= lazy(() => import('./pages/business/BusinessDashboard'));
const ManageDiscounts  = lazy(() => import('./pages/business/ManageDiscounts'));
const BusinessProfile  = lazy(() => import('./pages/business/BusinessProfile'));
const BusinessSettings = lazy(() => import('./pages/business/BusinessSettings'));

// Student Dashboard
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const QRScanner        = lazy(() => import('./pages/dashboard/QRScanner'));
const StudentProfile   = lazy(() => import('./pages/dashboard/StudentProfile'));
const VenueExplore     = lazy(() => import('./pages/dashboard/VenueExplore'));
const VenueDetail      = lazy(() => import('./pages/dashboard/VenueDetail'));
const Favorites        = lazy(() => import('./pages/dashboard/Favorites'));

// Admin Pages
const AdminLayout    = lazy(() => import('./layouts/AdminLayout'));
const AdminVenues    = lazy(() => import('./pages/admin/AdminVenues'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ScrollToTop />

      <div className="min-h-screen flex flex-col font-poppins bg-background text-dark">
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>

              {/* ── Herkese Açık (Landing + Full) ── */}
              <Route path="/" element={<Home />} />
              <Route path="/kayit" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/isletme-basvurusu" element={<BusinessForm />} />
              <Route path="/gizlilik" element={<Privacy />} />
              <Route path="/kullanim-kosullari" element={<Terms />} />

              {/* ── Admin (Her zaman açık, sadece admin görebilir) ── */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>
              }>
                <Route index element={<Admin />} />
                <Route path="venues" element={<AdminVenues />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              {/* ── Sadece Full Launch'ta Açık ── */}
              <Route path="/dogrulama" element={<VerifyStudent />} />

              {/* Business Panel */}
              <Route path="/business" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="business"><BusinessLayout /></ProtectedRoute>
                </LaunchGate>
              }>
                <Route index element={<BusinessDashboard />} />
                <Route path="discounts" element={<ManageDiscounts />} />
                <Route path="profile" element={<BusinessProfile />} />
                <Route path="settings" element={<BusinessSettings />} />
              </Route>

              {/* Student Dashboard */}
              <Route path="/dashboard" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
                </LaunchGate>
              } />
              <Route path="/dashboard/scan" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><QRScanner /></ProtectedRoute>
                </LaunchGate>
              } />
              <Route path="/dashboard/profile" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><StudentProfile /></ProtectedRoute>
                </LaunchGate>
              } />
              <Route path="/dashboard/explore" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><VenueExplore /></ProtectedRoute>
                </LaunchGate>
              } />
              <Route path="/dashboard/favorites" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><Favorites /></ProtectedRoute>
                </LaunchGate>
              } />
              <Route path="/venue/:id" element={
                <LaunchGate>
                  <ProtectedRoute allowedRole="student"><VenueDetail /></ProtectedRoute>
                </LaunchGate>
              } />

              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
