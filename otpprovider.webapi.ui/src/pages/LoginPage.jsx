import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthPageShell from '../components/AuthPageShell';

export default function LoginPage() {
    const { register, handleSubmit } = useForm();
    const { login: setAuthToken } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function onSubmit(data) {
        setError('');
        setLoading(true);
        try {
            const token = await login(data);
            setAuthToken(token);
            navigate('/dashboard');
        } catch (e) {
            setError(e?.response?.data || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthPageShell
            title="Sign in to otpfy"
            secondaryLink={
                <span>
                    No account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
                </span>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <label style={styles.label}>
                    Username
                    <input
                        type="text"
                        autoComplete="username"
                        autoFocus
                        {...register('username', { required: true })}
                        style={styles.input}
                        disabled={loading}
                    />
                </label>
                <label style={styles.label}>
                    Password
                    <input
                        type="password"
                        autoComplete="current-password"
                        {...register('password', { required: true })}
                        style={styles.input}
                        disabled={loading}
                    />
                </label>
                {error && <div style={styles.errorBox}>{error}</div>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.primaryButton,
                        ...(loading ? styles.primaryButtonDisabled : null)
                    }}
                >
                    {loading ? 'Signing in…' : 'Login'}
                </button>
            </form>
        </AuthPageShell>
    );
}

const styles = {
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: '#334155',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
    },
    input: {
        height: 46,
        borderRadius: 12,
        border: '1px solid #cbd5e1',
        padding: '0 14px',
        fontSize: 15,
        background: '#fff'
    },
    errorBox: {
        background: '#fee2e2',
        border: '1px solid #fecaca',
        padding: '10px 12px',
        borderRadius: 10,
        fontSize: 13,
        color: '#991b1b'
    },
    primaryButton: {
        background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
        color: '#fff',
        fontWeight: 600,
        padding: '12px 20px',
        border: 'none',
        borderRadius: 12,
        cursor: 'pointer',
        fontSize: 15
    },
    primaryButtonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    }
};