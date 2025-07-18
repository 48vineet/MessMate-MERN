// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ToastProvider from './components/ui/Toast';

// Import your existing components directly (NO pages folder)
import { 
  LoginForm, 
  RegisterForm,
  ForgotPassword,
  ResetPassword
} from './components/auth';

import { 
  UserDashboard,
  MenuCard,
  BookingCard,
  ProfileCard,
  MealHistory
} from './components/dashboard';

import { 
  AdminDashboard,
  UserManagement,
  MenuManagement,
  InventoryManagement,
  Analytics
} from './components/admin';

import { 
  Layout,
  Header,
  Footer
} from './components/common';

import { AuthGuard } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SocketProvider>
          <ToastProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  {/* Protected Student Routes */}
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <Layout>
                        <UserDashboard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/menu" element={
                    <AuthGuard>
                      <Layout>
                        <MenuCard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/bookings" element={
                    <AuthGuard>
                      <Layout>
                        <BookingCard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/profile" element={
                    <AuthGuard>
                      <Layout>
                        <ProfileCard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/history" element={
                    <AuthGuard>
                      <Layout>
                        <MealHistory />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={
                    <AuthGuard allowedRoles={['admin']}>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin/users" element={
                    <AuthGuard allowedRoles={['admin']}>
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin/menu" element={
                    <AuthGuard allowedRoles={['admin']}>
                      <Layout>
                        <MenuManagement />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin/inventory" element={
                    <AuthGuard allowedRoles={['admin']}>
                      <Layout>
                        <InventoryManagement />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin/analytics" element={
                    <AuthGuard allowedRoles={['admin']}>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  {/* Default Redirects */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={
                    <div className="text-center py-20">
                      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                    </div>
                  } />
                </Routes>
              </div>
            </Router>
          </ToastProvider>
        </SocketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
