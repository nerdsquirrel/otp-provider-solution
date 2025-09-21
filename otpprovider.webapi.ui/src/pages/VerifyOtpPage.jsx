import { useState, useEffect } from 'react';
import { verifyOtp } from '../api/otpApi';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
    const { search } = useLocation();
    return new URLSearchParams(search);
}

export default function VerifyOtpPage() {
    const query = useQuery();
    const navigate = useNavigate();
    const initialRequestId = query.get('requestId') || '';
    const [requestId, setRequestId] = useState(initialRequestId);
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', ok: '' });
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (initialRequestId) setRequestId(initialRequestId);
    }, [initialRequestId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ loading: true, error: '', ok: '' });
        setResult(null);

        if (!requestId || !otp) {
            setStatus(s => ({ ...s, loading: false, error: 'Request Id and OTP are required.' }));
            return;
        }

        try {
            const data = await verifyOtp({ requestId, otp });
            if (data.isSuccessful) {
                setStatus({ loading: false, error: '', ok: 'OTP verified successfully.' });
            } else {
                setStatus({ loading: false, error: data.errorMessage || 'Verification failed.', ok: '' });
            }
            setResult(data);
        } catch (err) {
            const msg = err?.response?.data || err.message || 'Verification failed';
            setStatus({ loading: false, error: msg, ok: '' });
        }
    }

    return (
        <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>Verify OTP</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label>
                    Request Id
                    <input
                        type="text"
                        value={requestId}
                        onChange={e => setRequestId(e.target.value)}
                        placeholder="Paste the Request Id"
                        style={{ width: '100%', marginTop: 4 }}
                    />
                </label>

                <label>
                    OTP
                    <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter received OTP"
                        style={{ width: '100%', marginTop: 4 }}
                    />
                </label>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button disabled={status.loading} type="submit">
                        {status.loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button type="button" onClick={() => navigate('/send-otp')}>Back</button>
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
                    <strong>Verification Result</strong>
                    <div>Status: {result.isSuccessful ? 'Successful' : 'Failed'}</div>
                    {!result.isSuccessful && result.errorMessage && (
                        <div style={{ color: 'crimson' }}>Error: {result.errorMessage}</div>
                    )}
                </div>
            )}

            <p style={{ fontSize: 12, color: '#555', marginTop: 24 }}>
                Enter the OTP you received. The Request Id ties this verification to the original send request.
            </p>
        </div>
    );
}