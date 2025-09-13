import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
    const { username, roles, logout } = useAuth();
    return (
        <div style={{ padding: 24 }}>
            <h2>Dashboard</h2>
            <p>Welcome {username || 'User'}.</p>
            <p>Roles: {roles?.join(', ') || 'None'}</p>
            <nav style={{ margin: '16px 0' }}>
                <Link to="/send-otp" style={{ marginRight: 16 }}>Send OTP</Link>
            </nav>
            <button onClick={logout}>Logout</button>
        </div>
    );
}