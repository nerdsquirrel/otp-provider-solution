import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp } from '../api/otpApi';
import { getDeliveryTypes } from '../api/otpProvidersApi';
import { useAuth } from '../auth/AuthContext';

export default function SendOtpPage() {
    const navigate = useNavigate();
    const { username, roles } = useAuth();

    const [deliveryTypes, setDeliveryTypes] = useState([]); // [{ value, label }]
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [method, setMethod] = useState('');
    const [to, setTo] = useState('');
    const [purpose, setPurpose] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', ok: '' });
    const [result, setResult] = useState(null);

    const loadDeliveryTypes = useCallback(async () => {
        setLoadingTypes(true);
        try {
            const types = await getDeliveryTypes();
            setDeliveryTypes(types);
            if (!types.find(t => t.value === method)) {
                if (types.length) setMethod(types[0].value); else setMethod('');
            }
        } catch (e) {
            setDeliveryTypes([]);
            setMethod('');
            setStatus(s => ({
                ...s,
                error: s.error || (e?.response?.data || e.message || 'Failed to load delivery types')
            }));
        } finally {
            setLoadingTypes(false);
        }
    }, [method]);

    useEffect(() => { loadDeliveryTypes(); }, [loadDeliveryTypes]);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus({ loading: true, error: '', ok: '' });
        setResult(null);

        if (!method || !to.trim()) {
            setStatus({ loading: false, error: 'Method and destination are required.', ok: '' });
            return;
        }

        try {
            const data = await sendOtp({ method, to: to.trim(), purpose: purpose.trim() });
            if (data.isSent) {
                setStatus({ loading: false, error: '', ok: 'OTP dispatched.' });
            } else {
                setStatus({ loading: false, error: data.errorMessage || 'Failed to send OTP.', ok: '' });
            }
            setResult(data);
        } catch (err) {
            const msg = err?.response?.data || err.message || 'Failed to send OTP';
            setStatus({ loading: false, error: msg, ok: '' });
        }
    }

    const initials = (username || 'User')
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join('');

    const isSmsLike = method === 'SMS' || method === 'WhatsApp';
    const destinationLabel = isSmsLike ? 'Phone Number' : 'Email Address';
    const destinationPlaceholder = isSmsLike ? '+15551234567' : 'user@example.com';

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.headerBar}>
                <div style={styles.identityBlock}>
                    <div style={styles.avatar} aria-label="User avatar">{initials}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h1 style={styles.pageTitle}>Send One-Time Passcode</h1>
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

            {/* Quick Context Cards */}
            <section style={styles.quickGrid}>
                <ContextCard
                    title="Providers"
                    description="Review & adjust active delivery providers."
                    to="/otp-providers"
                    accent="#9333ea"
                    icon="🧩"
                />
                <ContextCard
                    title="Recent Activity"
                    description="View the latest OTP requests & outcomes."
                    to="/dashboard#recent"
                    accent="#2563eb"
                    icon="📊"
                />
            </section>

            {/* Form Card */}
            <section aria-label="Send OTP form" style={styles.formCard}>
                <form onSubmit={handleSubmit} style={styles.formLayout}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>
                            Method
                            <select
                                value={method}
                                disabled={loadingTypes || !deliveryTypes.length || status.loading}
                                onChange={e => setMethod(e.target.value)}
                                style={styles.select}
                            >
                                {loadingTypes && <option value="">Loading...</option>}
                                {!loadingTypes && deliveryTypes.length === 0 && <option value="">No methods</option>}
                                {!loadingTypes && deliveryTypes.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </label>
                        <label style={styles.label}>
                            {destinationLabel}
                            <input
                                type="text"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                placeholder={destinationPlaceholder}
                                style={styles.input}
                                disabled={!method || status.loading}
                                autoComplete="off"
                            />
                        </label>
                    </div>

                    <label style={styles.label}>
                        Purpose (optional)
                        <input
                            type="text"
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                            placeholder="Login, Password Reset, MFA..."
                            style={styles.input}
                            disabled={status.loading}
                        />
                    </label>

                    <div style={styles.inlineNote}>
                        This action will generate a short-lived code and attempt delivery using the selected method.
                    </div>

                    <div style={styles.actionsRow}>
                        <button
                            type="submit"
                            disabled={status.loading || !method}
                            style={styles.primaryButton}
                        >
                            {status.loading ? 'Sending…' : 'Send OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTo(''); setPurpose(''); setResult(null); setStatus({ loading: false, ok: '', error: '' }); }}
                            disabled={status.loading}
                            style={styles.resetButton}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            style={styles.secondaryButton}
                            disabled={status.loading}
                        >
                            Cancel
                        </button>
                    </div>

                    {loadingTypes && <div style={styles.infoMsg}>Loading delivery types…</div>}
                    {status.error && <div style={styles.errorMsg}>{status.error}</div>}
                    {status.ok && <div style={styles.successMsg}>{status.ok}</div>}
                </form>
            </section>

            {/* Result Card */}
            {result && (
                <section style={styles.resultCard} aria-label="Server response">
                    <div style={styles.resultHeader}>
                        <strong style={{ fontSize: 15 }}>Dispatch Result</strong>
                        <span style={{
                            ...styles.resultStatusPill,
                            background: result.isSent ? '#dcfce7' : '#fee2e2',
                            color: result.isSent ? '#166534' : '#991b1b'
                        }}>
                            {result.isSent ? 'SENT' : 'FAILED'}
                        </span>
                    </div>
                    <div style={styles.kvRow}>
                        <span style={styles.kvKey}>Request Id</span>
                        <code style={styles.kvValue}>{result.requestId}</code>
                    </div>
                    <div style={styles.kvRow}>
                        <span style={styles.kvKey}>Expiry</span>
                        <span style={styles.kvValue}>{result.otpExpirySeconds} seconds</span>
                    </div>
                    <div style={styles.kvRow}>
                        <span style={styles.kvKey}>Method</span>
                        <span style={styles.kvValue}>{method}</span>
                    </div>
                    {result.errorMessage && (
                        <div style={styles.errorMsg} role="alert">
                            Error: {result.errorMessage}
                        </div>
                    )}
                    {result.isSent && (
                        <div style={{ marginTop: 12 }}>
                            <Link
                                to={`/verify-otp?requestId=${encodeURIComponent(result.requestId)}`}
                                style={styles.verifyLink}
                            >
                                Verify this OTP →
                            </Link>
                        </div>
                    )}
                </section>
            )}

            <p style={styles.footerNote}>
                For security, OTP values are hashed server-side; only the recipient can use the actual code provided via the chosen channel.
            </p>
        </div>
    );
}

/* Context Card */
function ContextCard({ title, description, to, icon, accent }) {
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

/* Styles (aligned with dashboard visual language) */
const styles = {
    page: {
        padding: 24,
        fontFamily: 'system-ui, Arial, sans-serif',
        background: '#fafbfc',
        minHeight: '100vh',
        maxWidth: 1040,
        margin: '0 auto'
    },
    headerBar: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 24,
        padding: '8px 4px 18px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 30,
        flexWrap: 'wrap'
    },
    identityBlock: { display: 'flex', gap: 16, alignItems: 'center', minWidth: 0 },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 600,
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,.15)',
        userSelect: 'none'
    },
    pageTitle: { fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.15, letterSpacing: 0.3 },
    userMetaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    usernameChip: {
        fontSize: 13,
        fontWeight: 500,
        background: '#e2e8f0',
        color: '#334155',
        padding: '4px 10px',
        borderRadius: 18
    },
    noRole: { fontSize: 12, color: '#94a3b8' },
    roleBadgeContainer: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    roleBadge: {
        background: '#1e293b',
        color: '#fff',
        fontSize: 11,
        padding: '4px 10px',
        borderRadius: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
    quickGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 20,
        marginBottom: 34
    },
    contextCard: {
        display: 'flex',
        gap: 16,
        textDecoration: 'none',
        background: '#fff',
        padding: '16px 18px 18px',
        borderRadius: 14,
        position: 'relative',
        border: '1px solid #e2e8f0',
        borderTopWidth: 6,
        color: '#111',
        transition: 'box-shadow .2s, transform .15s'
    },
    contextIcon: {
        width: 48,
        height: 48,
        background: '#f1f5f9',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24
    },
    contextTitle: { margin: 0, fontSize: 16, fontWeight: 600 },
    contextDescription: { margin: 0, fontSize: 13, lineHeight: 1.35, color: '#475569' },
    contextLink: { marginTop: 4, fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' },

    formCard: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '26px 28px 30px',
        marginBottom: 28,
        boxShadow: '0 1px 2px rgba(0,0,0,.04)',
        maxWidth: 760
    },
    formLayout: { display: 'flex', flexDirection: 'column', gap: 20 },
    fieldGroup: {
        display: 'grid',
        gap: 18,
        gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))'
    },
    label: { display: 'flex', flexDirection: 'column', fontSize: 13, fontWeight: 600, color: '#334155', gap: 6 },
    select: {
        minHeight: 40,
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        padding: '0 12px',
        fontSize: 14,
        background: '#fff'
    },
    input: {
        height: 40,
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        padding: '0 12px',
        fontSize: 14,
        background: '#fff'
    },
    inlineNote: {
        fontSize: 12,
        color: '#64748b',
        background: '#f1f5f9',
        padding: '10px 12px',
        borderRadius: 10,
        lineHeight: 1.35
    },
    actionsRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    primaryButton: {
        background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
        color: '#fff',
        fontWeight: 600,
        padding: '10px 22px',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: 14
    },
    secondaryButton: {
        background: '#f1f5f9',
        color: '#334155',
        padding: '10px 20px',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        fontSize: 14,
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500
    },
    resetButton: {
        background: '#fff',
        color: '#475569',
        padding: '10px 18px',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        fontSize: 14,
        cursor: 'pointer',
        fontWeight: 500
    },
    infoMsg: { fontSize: 12, color: '#475569' },
    errorMsg: {
        fontSize: 13,
        color: '#991b1b',
        background: '#fee2e2',
        border: '1px solid #fecaca',
        padding: '10px 12px',
        borderRadius: 10
    },
    successMsg: {
        fontSize: 13,
        color: '#065f46',
        background: '#d1fae5',
        border: '1px solid #a7f3d0',
        padding: '10px 12px',
        borderRadius: 10
    },
    resultCard: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        padding: '22px 24px',
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(0,0,0,.05)',
        maxWidth: 760
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    resultStatusPill: {
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5
    },
    kvRow: {
        display: 'flex',
        gap: 16,
        fontSize: 13,
        padding: '4px 0',
        alignItems: 'baseline'
    },
    kvKey: { width: 90, color: '#64748b', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.7 },
    kvValue: { fontSize: 13, color: '#334155', wordBreak: 'break-all' },
    verifyLink: {
        fontSize: 13,
        fontWeight: 600,
        color: '#2563eb',
        textDecoration: 'none',
        background: '#eff6ff',
        padding: '8px 14px',
        borderRadius: 10,
        display: 'inline-block'
    },
    footerNote: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 38,
        maxWidth: 760,
        lineHeight: 1.4
    }
};

/* Lightweight hover CSS injection (keeps file self-contained) */
if (typeof window !== 'undefined') {
    const styleId = '__sendotp_inline_hover__';
    if (!document.getElementById(styleId)) {
        const tag = document.createElement('style');
        tag.id = styleId;
        tag.innerHTML = `
            a[style*="border-top-width: 6px"]:hover {
                box-shadow: 0 4px 14px rgba(0,0,0,0.12);
                transform: translateY(-2px);
            }
            a[style*="Open →"]:hover { text-decoration: none; }
            button:hover:not(:disabled), a:hover[style*="padding: 10px 20px"] { filter: brightness(.96); }
            a:hover[style*="background: #eff6ff"] { background:#dbeafe; }
        `;
        document.head.appendChild(tag);
    }
}