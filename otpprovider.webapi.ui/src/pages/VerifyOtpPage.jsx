import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtp } from '../api/otpApi';
import { useAuth } from '../auth/AuthContext';

function useQuery() {
    const { search } = useLocation();
    return new URLSearchParams(search);
}

export default function VerifyOtpPage() {
    const query = useQuery();
    const navigate = useNavigate();
    const { username, roles } = useAuth();

    const initialRequestId = query.get('requestId') || '';
    const [requestId, setRequestId] = useState(initialRequestId);
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', ok: '' });
    const [result, setResult] = useState(null);
    const otpInputRef = useRef(null);

    useEffect(() => {
        if (initialRequestId) setRequestId(initialRequestId);
    }, [initialRequestId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ loading: true, error: '', ok: '' });
        setResult(null);

        if (!requestId.trim() || !otp.trim()) {
            setStatus({ loading: false, error: 'Both Request Id and OTP are required.', ok: '' });
            return;
        }

        try {
            const data = await verifyOtp({ requestId: requestId.trim(), otp: otp.trim() });
            if (data.isSuccessful) {
                setStatus({ loading: false, error: '', ok: 'OTP verified successfully.' });
            } else {
                setStatus({ loading: false, error: data.errorMessage || 'Verification failed.', ok: '' });
            }
            setResult(data);
        } catch (err) {
            const msg = err?.response?.data || err.message || 'Verification failed.';
            setStatus({ loading: false, error: msg, ok: '' });
        }
    }

    function handleClear() {
        setOtp('');
        setResult(null);
        setStatus({ loading: false, error: '', ok: '' });
        otpInputRef.current?.focus();
    }

    const initials = (username || 'User')
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join('');

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.headerBar}>
                <div style={styles.identityBlock}>
                    <div style={styles.avatar} aria-label="User avatar">{initials}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h1 style={styles.pageTitle}>Verify One-Time Passcode</h1>
                        <div style={styles.userMetaRow}>
                            <span style={styles.usernameChip}>{username || 'Anonymous'}</span>
                            {roles?.length ? (
                                <div style={styles.roleBadgeContainer}>
                                    {roles.map(r => <span key={r} style={styles.roleBadge}>{r}</span>)}
                                </div>
                            ) : <span style={styles.noRole}>No roles</span>}
                        </div>
                    </div>
                </div>
                <div style={styles.headerActions}>
                    <Link to="/dashboard" style={styles.secondaryButton}>← Dashboard</Link>
                </div>
            </header>

            {/* Context / Quick navigation */}
            <section style={styles.quickGrid}>
                <ContextCard
                    to="/send-otp"
                    icon="📤"
                    accent="#2563eb"
                    title="Send New OTP"
                    description="Generate and dispatch a fresh code."
                />
                <ContextCard
                    to="/dashboard#recent"
                    icon="📊"
                    accent="#9333ea"
                    title="Recent Activity"
                    description="Inspect latest OTP traffic & status."
                />
            </section>

            {/* Verification Form */}
            <section aria-label="OTP verification form" style={styles.formCard}>
                <form onSubmit={handleSubmit} style={styles.formLayout}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>
                            Request Id
                            <input
                                type="text"
                                value={requestId}
                                onChange={e => setRequestId(e.target.value)}
                                placeholder="Paste or enter request id"
                                style={styles.input}
                                autoComplete="off"
                                disabled={status.loading}
                            />
                        </label>

                        <label style={styles.label}>
                            OTP Code
                            <input
                                ref={otpInputRef}
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\s+/g, ''))}
                                placeholder="1234"
                                style={{ ...styles.input, fontWeight: 600, letterSpacing: 4, textAlign: 'center' }}
                                maxLength={12}
                                autoComplete="one-time-code"
                                disabled={status.loading}
                            />
                        </label>
                    </div>

                    <div style={styles.inlineNote}>
                        Provide the received code and its original request id. Codes are short-lived and become invalid after successful verification or expiration.
                    </div>

                    <div style={styles.actionsRow}>
                        <button type="submit" disabled={status.loading || !requestId || !otp} style={styles.primaryButton}>
                            {status.loading ? 'Verifying…' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={handleClear} disabled={status.loading || (!otp && !result)} style={styles.resetButton}>
                            Clear
                        </button>
                        <button type="button" onClick={() => navigate('/send-otp')} disabled={status.loading} style={styles.secondaryButton}>
                            Send New
                        </button>
                    </div>

                    {status.error && <div style={styles.errorMsg}>{status.error}</div>}
                    {status.ok && <div style={styles.successMsg}>{status.ok}</div>}
                </form>
            </section>

            {/* Result */}
            {result && (
                <section style={styles.resultCard} aria-label="Verification result">
                    <div style={styles.resultHeader}>
                        <strong style={{ fontSize: 15 }}>Verification Result</strong>
                        <span style={{
                            ...styles.resultStatusPill,
                            background: result.isSuccessful ? '#dcfce7' : '#fee2e2',
                            color: result.isSuccessful ? '#166534' : '#991b1b'
                        }}>
                            {result.isSuccessful ? 'VALID' : 'FAILED'}
                        </span>
                    </div>
                    <div style={styles.kvRow}>
                        <span style={styles.kvKey}>Outcome</span>
                        <span style={styles.kvValue}>{result.isSuccessful ? 'Successfully Verified' : 'Not Valid'}</span>
                    </div>
                    {!result.isSuccessful && result.errorMessage && (
                        <div style={{ ...styles.errorMsg, marginTop: 6 }} role="alert">
                            Error: {result.errorMessage}
                        </div>
                    )}
                    <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
                        If the code failed, confirm you entered the correct request id and the code is not expired or already used.
                    </div>
                </section>
            )}

            <p style={styles.footerNote}>
                Each verification is audited with attempt metadata. Repeated failures may lock the OTP depending on server policy.
            </p>
        </div>
    );
}

/* Context Card component */
function ContextCard({ to, title, description, icon, accent }) {
    return (
        <Link to={to} style={{ ...styles.contextCard, borderTopColor: accent }}>
            <div style={styles.contextIcon}>{icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={styles.contextTitle}>{title}</h3>
                <p style={styles.contextDescription}>{description}</p>
                <span style={{ ...styles.contextLink, color: accent }}>Open →</span>
            </div>
        </Link>
    );
}

/* Visual Language (aligned with Dashboard & Send OTP pages) */
const styles = {
    page: { padding: 24, fontFamily: 'system-ui, Arial, sans-serif', background: '#fafbfc', minHeight: '100vh', maxWidth: 1040, margin: '0 auto' },
    headerBar: { display: 'flex', justifyContent: 'space-between', gap: 24, padding: '8px 4px 18px', borderBottom: '1px solid #e2e8f0', marginBottom: 30, flexWrap: 'wrap' },
    identityBlock: { display: 'flex', gap: 16, alignItems: 'center', minWidth: 0 },
    avatar: {
        width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,.15)', userSelect: 'none'
    },
    pageTitle: { fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.15, letterSpacing: 0.3 },
    userMetaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    usernameChip: { fontSize: 13, fontWeight: 500, background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: 18 },
    noRole: { fontSize: 12, color: '#94a3b8' },
    roleBadgeContainer: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    roleBadge: { background: '#1e293b', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
    headerActions: { display: 'flex', gap: 10, alignItems: 'center' },

    quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginBottom: 34 },
    contextCard: {
        display: 'flex', gap: 16, textDecoration: 'none', background: '#fff', padding: '16px 18px 18px',
        borderRadius: 14, position: 'relative', border: '1px solid #e2e8f0', borderTopWidth: 6, color: '#111',
        transition: 'box-shadow .2s, transform .15s'
    },
    contextIcon: { width: 48, height: 48, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
    contextTitle: { margin: 0, fontSize: 16, fontWeight: 600 },
    contextDescription: { margin: 0, fontSize: 13, lineHeight: 1.35, color: '#475569' },
    contextLink: { marginTop: 4, fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' },

    formCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '26px 28px 30px', marginBottom: 28, boxShadow: '0 1px 2px rgba(0,0,0,.04)', maxWidth: 760 },
    formLayout: { display: 'flex', flexDirection: 'column', gap: 20 },
    fieldGroup: { display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' },
    label: { display: 'flex', flexDirection: 'column', fontSize: 13, fontWeight: 600, color: '#334155', gap: 6 },
    input: {
        height: 44, borderRadius: 10, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 15,
        background: '#fff', outline: 'none'
    },
    inlineNote: { fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '10px 12px', borderRadius: 10, lineHeight: 1.35 },

    actionsRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    primaryButton: {
        background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontWeight: 600,
        padding: '10px 22px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14
    },
    secondaryButton: {
        background: '#f1f5f9', color: '#334155', padding: '10px 20px', border: '1px solid #cbd5e1',
        borderRadius: 10, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontWeight: 500
    },
    resetButton: {
        background: '#fff', color: '#475569', padding: '10px 18px', border: '1px solid #cbd5e1',
        borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 500
    },

    errorMsg: { fontSize: 13, color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: 10 },
    successMsg: { fontSize: 13, color: '#065f46', background: '#d1fae5', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: 10 },

    resultCard: { background: '#fff', border: '1px solid #e2e8f0', padding: '22px 24px', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,.05)', maxWidth: 760 },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    resultStatusPill: { padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
    kvRow: { display: 'flex', gap: 16, fontSize: 13, padding: '4px 0', alignItems: 'baseline' },
    kvKey: { width: 90, color: '#64748b', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.7 },
    kvValue: { fontSize: 13, color: '#334155', wordBreak: 'break-all' },

    footerNote: { fontSize: 11, color: '#64748b', marginTop: 38, maxWidth: 760, lineHeight: 1.4 }
};

/* Hover CSS injection (to keep file self-contained, similar pattern used elsewhere) */
if (typeof window !== 'undefined') {
    const styleId = '__verifyotp_inline_hover__';
    if (!document.getElementById(styleId)) {
        const tag = document.createElement('style');
        tag.id = styleId;
        tag.innerHTML = `
            a[style*="border-top-width: 6px"]:hover {
                box-shadow: 0 4px 14px rgba(0,0,0,0.12);
                transform: translateY(-2px);
            }
            button:hover:not(:disabled), a:hover[style*="padding: 10px 20px"] { filter: brightness(.96); }
            input:focus { outline: 2px solid #2563eb33; border-color:#2563eb; }
        `;
        document.head.appendChild(tag);
    }
}