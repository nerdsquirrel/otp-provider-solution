import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
    const { username, roles, logout } = useAuth();

    return (
        <div style={{ padding: 24 }}>
            <h2>Dashboard</h2>
            <p>Welcome {username || 'User'}.</p>
            <p>Roles: {roles?.join(', ') || 'None'}</p>
            <nav style={{ margin: '16px 0', display: 'flex', gap: 16 }}>
                <Link to="/send-otp">Send OTP</Link>
                <Link to="/otp-providers">OTP Providers</Link>
            </nav>
            <button onClick={logout}>Logout</button>
        </div>
    );
}