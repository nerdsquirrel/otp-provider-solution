import { useState } from 'react';
import { sendOtp } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function SendOtpPage() {
    const [method, setMethod] = useState('Sms');
    const [to, setTo] = useState('');
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', ok: '' });
    const navigate = useNavigate();

    function generateOtp(length = 6) {
        // Simple numeric OTP generator
        const v = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
        setOtp(v);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ loading: true, error: '', ok: '' });
        try {
            if (!method || !to || !otp) {
                setStatus(s => ({ ...s, loading: false, error: 'All fields are required.' }));
                return;
            }
            await sendOtp({ method, to, otp });
            setStatus({ loading: false, error: '', ok: 'OTP sent successfully.' });
        } catch (err) {
            const msg = err?.response?.data || err.message || 'Failed to send OTP';
            setStatus({ loading: false, error: msg, ok: '' });
        }
    }

    return (
        <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>Send OTP</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label>
                    Method
                    <select value={method} onChange={e => setMethod(e.target.value)} style={{ display: 'block', marginTop: 4 }}>
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
                    OTP
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="e.g. 842193"
                            style={{ flex: 1 }}
                        />
                        <button type="button" onClick={() => generateOtp(6)}>Generate</button>
                    </div>
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

            <p style={{ fontSize: 12, color: '#555', marginTop: 24 }}>
                Note: Client-side OTP generation is for demo only. For higher security you can
                generate OTP on the server and only send the destination + method from the client.
            </p>
        </div>
    );
}