// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; 
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { MenuProvider } from "./context/MenuContext";
import { BookingProvider } from "./context/BookingContext";
import { PaymentProvider } from "./context/PaymentContext";
import { NotificationProvider } from "./context/NotificationContext";

// Common Components
import Layout from "./components/common/Layout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner, { PageLoader } from "./components/common/LoadingSpinner";

// Auth Components
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";

// Dashboard Components
import UserDashboard from "./components/dashboard/UserDashboard";

// Payment Components
import UPIPayment from "./components/payments/UPIPayment";
import PaymentHistory from "./components/payments/PaymentHistory";
import WalletManagement from "./components/payments/WalletManagement";
import WalletRecharge from "./components/payments/WalletRecharge";
import RefundRequest from "./components/payments/RefundRequest";

// Pages
import QRDisplayPage from "./pages/QRDisplayPage";
import MenuPage from "./pages/MenuPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import ContactPage from "./pages/ContactPage";
import BookingsPage from "./pages/BookingsPage";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import AddUser from "./components/admin/AddUser";
import MenuManagement from "./components/admin/MenuManagement";
import MenuTemplates from "./components/admin/MenuTemplates";
import MenuAnalytics from "./components/admin/MenuAnalytics";
import BookingManagement from "./components/admin/BookingManagement";
import Analytics from "./components/admin/Analytics";
import InventoryManagement from "./components/admin/InventoryManagement";
import FeedbackManagement from "./components/admin/FeedbackManagement";
import WalletManagementAdmin from "./components/admin/WalletManagement";
import ReportsPanel from "./components/admin/ReportsPanel";
import UserReports from "./components/admin/UserReports";
import SystemSettings from "./components/admin/SystemSettings";

// Hooks
import useAuth from "./hooks/useAuth";

// Utils
import constants, { ROUTES, USER_ROLES } from "./utils/constants";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Loading MessMate..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Loading MessMate..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

// Temporary placeholder components for routes we haven't built yet
const ComingSoon = ({ title = "Coming Soon" }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-xl">M</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-4">This feature is coming soon!</p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <MenuProvider>
              <BookingProvider>
                <PaymentProvider>
                  <NotificationProvider>
                    <div className="App">
                      <AnimatePresence mode="wait">
                        <Routes>
                          {/* Public Routes */}
                          <Route
                            path="/"
                            element={
                              <PublicRoute>
                                <Navigate to="/login" replace />
                              </PublicRoute>
                            }
                          />

                          <Route
                            path="/login"
                            element={
                              <PublicRoute>
                                <LoginForm />
                              </PublicRoute>
                            }
                          />

                          <Route
                            path="/register"
                            element={
                              <PublicRoute>
                                <RegisterForm />
                              </PublicRoute>
                            }
                          />

                          <Route
                            path="/forgot-password"
                            element={
                              <PublicRoute>
                                <ComingSoon title="Forgot Password" />
                              </PublicRoute>
                            }
                          />

                          {/* Protected Routes with Layout */}
                          <Route path="/" element={<Layout />}>
                            {/* Student Dashboard */}
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <UserDashboard />
                                </ProtectedRoute>
                              }
                            />

                            {/* Menu Routes */}
                            <Route
                              path="/menu"
                              element={
                                <ProtectedRoute>
                                  <MenuPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Booking Routes */}
                            <Route
                              path="/bookings"
                              element={
                                <ProtectedRoute>
                                  <BookingsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Payment Routes */}
                            <Route
                              path="/wallet"
                              element={
                                <ProtectedRoute>
                                  <WalletManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/wallet/recharge"
                              element={
                                <ProtectedRoute>
                                  <WalletRecharge />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/wallet/transactions"
                              element={
                                <ProtectedRoute>
                                  <PaymentHistory />
                                </ProtectedRoute>
                              }
                            />

                            {/* QR Display Route */}
                            <Route
                              path="/qr-display"
                              element={
                                <ProtectedRoute>
                                  <QRDisplayPage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/payments/upi"
                              element={
                                <ProtectedRoute>
                                  <UPIPayment />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/payments/history"
                              element={
                                <ProtectedRoute>
                                  <PaymentHistory />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/payments/refund"
                              element={
                                <ProtectedRoute>
                                  <RefundRequest />
                                </ProtectedRoute>
                              }
                            />

                            {/* Profile Routes */}
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <ProfilePage />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <SettingsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Search Route */}
                            <Route
                              path="/search"
                              element={
                                <ProtectedRoute>
                                  <SearchPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Help & Support Route */}
                            <Route
                              path="/help"
                              element={
                                <ProtectedRoute>
                                  <HelpSupportPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Contact Us Route */}
                            <Route
                              path="/contact"
                              element={
                                <ProtectedRoute>
                                  <ContactPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Other Routes */}
                            <Route
                              path="/feedback"
                              element={
                                <ProtectedRoute>
                                  <div className="min-h-screen bg-gray-50 p-6">
                                    <div className="max-w-7xl mx-auto">
                                      <div className="mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                          Feedback & Reviews
                                        </h1>
                                        <p className="text-gray-600">
                                          Share your experience and help us
                                          improve
                                        </p>
                                      </div>
                                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                          <h2 className="text-xl font-bold text-gray-900">
                                            My Feedback
                                          </h2>
                                          <button
                                            onClick={() =>
                                              (window.location.href =
                                                "/dashboard")
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                          >
                                            Submit New Feedback
                                          </button>
                                        </div>
                                        <div className="text-center py-8">
                                          <p className="text-gray-500 mb-4">
                                            Submit feedback from your dashboard
                                          </p>
                                          <button
                                            onClick={() =>
                                              (window.location.href =
                                                "/dashboard")
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                          >
                                            Go to Dashboard
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/qr-display"
                              element={
                                <ProtectedRoute>
                                  <ComingSoon title="QR Code Display" />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/notifications"
                              element={
                                <ProtectedRoute>
                                  <NotificationsPage />
                                </ProtectedRoute>
                              }
                            />

                            {/* Admin Routes */}
                            <Route
                              path="/admin/dashboard"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <AdminDashboard />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/users"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <UserManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/users/add"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <AddUser />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/menu"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <MenuManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/menu/templates"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <MenuTemplates />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/menu/analytics"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <MenuAnalytics />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/bookings"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <BookingManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/analytics"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <Analytics />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/inventory"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <InventoryManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/reports"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <ReportsPanel />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/user-reports"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <UserReports />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/users/reports"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <UserReports />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/feedback"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <FeedbackManagement />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/wallet"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <WalletManagementAdmin />
                                </ProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/settings"
                              element={
                                <ProtectedRoute requiredRole="admin">
                                  <SystemSettings />
                                </ProtectedRoute>
                              }
                            />

                            {/* 404 Fallback */}
                            <Route
                              path="*"
                              element={
                                <div className="min-h-screen flex items-center justify-center">
                                  <div className="text-center">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                      404
                                    </h1>
                                    <p className="text-gray-600 mb-8">
                                      Page not found
                                    </p>
                                    <button
                                      onClick={() => window.history.back()}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                      Go Back
                                    </button>
                                  </div>
                                </div>
                              }
                            />
                          </Route>
                        </Routes>
                      </AnimatePresence>

                      {/* Global Toast Notifications */}
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: "#363636",
                            color: "#fff",
                          },
                          success: {
                            duration: 3000,
                            theme: {
                              primary: "#10B981",
                            },
                          },
                          error: {
                            duration: 5000,
                            theme: {
                              primary: "#EF4444",
                            },
                          },
                        }}
                      />
                    </div>
                  </NotificationProvider>
                </PaymentProvider>
              </BookingProvider>
            </MenuProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
