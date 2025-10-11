import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import AuthPageShell from '../components/AuthPageShell';

export default function RegisterPage() {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function onSubmit(data) {
        setError('');
        setOk(false);
        setLoading(true);
        try {
            await registerUser(data);
            setOk(true);
            setTimeout(() => navigate('/login'), 1600);
        } catch (e) {
            setError(e?.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthPageShell
            title="Create your otpfy account"
            secondaryLink={
                <span>
                    Have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Login</Link>
                </span>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                <label style={styles.label}>
                    Username
                    <input
                        type="text"
                        {...register('username', { required: true, maxLength: 25 })}
                        style={styles.input}
                        disabled={loading}
                    />
                </label>
                <label style={styles.label}>
                    Email
                    <input
                        type="email"
                        {...register('email', { required: true })}
                        style={styles.input}
                        disabled={loading}
                        autoComplete="email"
                    />
                </label>
                <label style={styles.label}>
                    Password
                    <input
                        type="password"
                        {...register('password', { required: true, minLength: 6 })}
                        style={styles.input}
                        disabled={loading}
                        autoComplete="new-password"
                    />
                </label>
                {error && <div style={styles.errorBox}>{error}</div>}
                {ok && <div style={styles.successBox}>Registered successfully. Redirecting…</div>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.primaryButton,
                        ...(loading ? styles.primaryButtonDisabled : null)
                    }}
                >
                    {loading ? 'Submitting…' : 'Register'}
                </button>
            </form>
        </AuthPageShell>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
    },
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
    successBox: {
        background: '#d1fae5',
        border: '1px solid #a7f3d0',
        padding: '10px 12px',
        borderRadius: 10,
        fontSize: 13,
        color: '#065f46'
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