import { useState } from 'react';
import { sendOtp } from '../api/otpApi';
import { useNavigate, Link } from 'react-router-dom';

export default function SendOtpPage() {
    const [method, setMethod] = useState('Sms');
    const [to, setTo] = useState('');
    const [purpose, setPurpose] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', ok: '' });
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ loading: true, error: '', ok: '' });
        setResult(null);

        if (!method || !to) {
            setStatus(s => ({ ...s, loading: false, error: 'Method and destination are required.' }));
            return;
        }

        try {
            const data = await sendOtp({ method, to, purpose });
            if (data.isSent) {
                setStatus({ loading: false, error: '', ok: 'OTP dispatch requested successfully.' });
            } else {
                setStatus({ loading: false, error: data.errorMessage || 'Failed to send OTP.', ok: '' });
            }
            setResult(data);
        } catch (err) {
            const msg = err?.response?.data || err.message || 'Failed to send OTP';
            setStatus({ loading: false, error: msg, ok: '' });
        }
    }

    return (
        <div style={{ maxWidth: 560, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>Send OTP</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label>
                    Method
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        style={{ display: 'block', marginTop: 4 }}
                    >
                        <option value="Sms">SMS</option>
                        <option value="Email">Email</option>
                    </select>
                </label>

                <label>
                    {method === 'Sms' ? 'Phone Number' : 'Email Address'}
                    <input
                        type="text"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder={method === 'Sms' ? '+15551234567' : 'user@example.com'}
                        style={{ width: '100%', marginTop: 4 }}
                    />
                </label>

                <label>
                    Purpose (optional)
                    <input
                        type="text"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        placeholder="e.g. Login, Password Reset"
                        style={{ width: '100%', marginTop: 4 }}
                    />
                </label>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button disabled={status.loading} type="submit">
                        {status.loading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')}>Back</button>
                </div>

                {status.error && <div style={{ color: 'red' }}>{status.error}</div>}
                {status.ok && <div style={{ color: 'green' }}>{status.ok}</div>}
            </form>

            {result && (
                <div style={{
                    marginTop: 24,
                    background: '#fafafa',
                    border: '1px solid #eee',
                    padding: 16,
                    borderRadius: 6,
                    fontSize: 14
                }}>
                    <strong>Server Response</strong>
                    <div>Request Id: <code>{result.requestId}</code></div>
                    <div>Expires In: {result.otpExpirySeconds} seconds</div>
                    <div>Status: {result.isSent ? 'Sent' : 'Failed'}</div>
                    {result.errorMessage && <div style={{ color: 'crimson' }}>Error: {result.errorMessage}</div>}
                    {result.isSent && (
                        <div style={{ marginTop: 12 }}>
                            <Link
                                to={`/verify-otp?requestId=${encodeURIComponent(result.requestId)}`}
                                style={{ fontSize: 13 }}
                            >
                                Verify this OTP
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <p style={{ fontSize: 12, color: '#555', marginTop: 24 }}>
                The server generates and dispatches the OTP. Enter it on the verification page once received.
            </p>
        </div>
    );
}