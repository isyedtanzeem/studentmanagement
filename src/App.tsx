import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ApplicantPortalPage } from './pages/applicant/ApplicantPortalPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'forgot-password' | 'reset-password' | 'applicant-portal'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  // If user is authenticated, render protected dashboard directly
  if (isAuthenticated) {
    return (
      <ProtectedRoute
        fallbackLogin={
          <LoginPage
            onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
            onNavigateToApplicantPortal={() => setCurrentView('applicant-portal')}
          />
        }
      >
        <DashboardPage />
      </ProtectedRoute>
    );
  }

  // Applicant Portal Page
  if (currentView === 'applicant-portal') {
    return (
      <ApplicantPortalPage
        onBackToStaffLogin={() => setCurrentView('login')}
      />
    );
  }

  // Auth pages navigation when unauthenticated
  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onBackToLogin={() => setCurrentView('login')}
        onNavigateToResetPassword={(tok) => {
          setResetToken(tok);
          setCurrentView('reset-password');
        }}
      />
    );
  }

  if (currentView === 'reset-password') {
    return (
      <ResetPasswordPage
        initialToken={resetToken}
        onBackToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginPage
      onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
      onNavigateToApplicantPortal={() => setCurrentView('applicant-portal')}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
