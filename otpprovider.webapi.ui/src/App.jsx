import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import SendOtpPage from './pages/SendOtpPage';
import OtpProvidersPage from './pages/OtpProvidersPage';
import VerifyOtpPage from './pages/VerifyOtpPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />
            <Route path="/send-otp" element={
                <ProtectedRoute>
                    <SendOtpPage />
                </ProtectedRoute>
            } />
            <Route path="/verify-otp" element={
                <ProtectedRoute>
                    <VerifyOtpPage />
                </ProtectedRoute>
            } />

            <Route path="/otp-providers" element={
                <ProtectedRoute>
                    <OtpProvidersPage />
                </ProtectedRoute>
            } />
            <Route path="*" element={<h3 style={{ padding: 24 }}>Not Found</h3>} />
        </Routes>
    );
}
