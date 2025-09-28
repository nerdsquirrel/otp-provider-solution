import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getRecentOtpActivity } from '../api/dashboardApi';

export default function DashboardPage() {
    const { username, roles, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [rangeMinutes, setRangeMinutes] = useState(1440);

    const loadData = useCallback(async (isRefresh = false) => {
        setError('');
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const [s, r] = await Promise.all([
                getDashboardStats(rangeMinutes),
                getRecentOtpActivity(10)
            ]);
            setStats(s);
            setRecent(r);
        } catch (e) {
            setError(e?.response?.data || e.message || 'Failed to load dashboard data.');
        } finally {
            if (isRefresh) setRefreshing(false); else setLoading(false);
        }
    }, [rangeMinutes]);

    useEffect(() => { loadData(false); }, [loadData]);

    const formatDateTime = v => {
        if (!v) return '';
        try { return new Date(v).toLocaleString(); } catch { return v; }
    };

    const statusColor = status => {
        switch ((status || '').toLowerCase()) {
            case 'verified':
            case 'success': return '#1b873f';
            case 'pending': return '#b88700';
            case 'failed': return '#c62828';
            default: return '#555';
        }
    };

    const initials = (username || 'User')
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join('');

    return (
        <div style={{ padding: 24, fontFamily: 'system-ui, Arial, sans-serif', background: '#fafbfc', minHeight: '100vh' }}>
            {/* Header */}
            <header style={styles.headerBar}>
                <div style={styles.identityBlock}>
                    <div style={styles.avatar} aria-label="User avatar">
                        {initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h1 style={styles.pageTitle}>OTP Operations Overview</h1>
                        <div style={styles.userMetaRow}>
                            <span style={styles.usernameText}>{username || 'Anonymous'}</span>
                            {roles?.length
                                ? <div style={styles.roleBadgeContainer}>
                                    {roles.map(r => <RoleBadge key={r} role={r} />)}
                                  </div>
                                : <span style={styles.noRole}>No roles assigned</span>
                            }
                        </div>
                    </div>
                </div>
                <div style={styles.headerActions}>
                    <select
                        value={rangeMinutes}
                        onChange={e => setRangeMinutes(parseInt(e.target.value, 10))}
                        disabled={loading || refreshing}
                        style={styles.select}
                        title="Summary time range"
                    >
                        <option value={60}>1h</option>
                        <option value={180}>3h</option>
                        <option value={720}>12h</option>
                        <option value={1440}>24h</option>
                        <option value={4320}>3d</option>
                        <option value={10080}>7d</option>
                    </select>
                    <button onClick={() => loadData(true)} disabled={loading || refreshing} style={styles.secondaryButton}>
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                    <button onClick={logout} style={styles.dangerButton}>Logout</button>
                </div>
            </header>

            {/* Quick Actions */}
            <section aria-label="Quick actions" style={styles.quickActionsSection}>
                <ActionCard
                    to="/send-otp"
                    title="Send OTP"
                    description="Generate & dispatch a one-time passcode using an active provider."
                    accent="#2563eb"
                    icon="📤"
                />
                <ActionCard
                    to="/otp-providers"
                    title="Manage Providers"
                    description="Activate, configure & monitor available OTP delivery providers."
                    accent="#9333ea"
                    icon="🧩"
                />
            </section>

            {loading && <div style={{ padding: 16 }}>Loading dashboard...</div>}

            {error && !loading && (
                <div style={styles.errorBox}>
                    <strong style={{ marginRight: 4 }}>Error:</strong>{error}
                </div>
            )}

            {!loading && !error && stats && (
                <>
                    {/* Stats */}
                    <section aria-label="Summary metrics" style={styles.cardsGrid}>
                        <SummaryCard label="Total Sent" value={stats.totalSent} />
                        <SummaryCard label="Verified" value={stats.totalVerified} emphasisColor="#1b873f" />
                        <SummaryCard label="Pending" value={stats.totalPending} emphasisColor="#b88700" />
                        <SummaryCard label="Failed" value={stats.totalFailed} emphasisColor="#c62828" />
                        <SummaryCard label="Success Rate" value={(stats.successRate * 100).toFixed(1) + '%'} />
                    </section>

                    {/* Recent Activity */}
                    <section style={{ marginBottom: 48 }} aria-label="Recent OTP request activity">
                        <div style={styles.sectionHeaderRow}>
                            <h2 style={styles.sectionTitle}>Recent Activity</h2>
                            <small style={{ color: '#666' }}>Showing {recent.length} most recent requests</small>
                        </div>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead style={styles.thead}>
                                    <tr>
                                        <Th>ID</Th>
                                        <Th>Destination</Th>
                                        <Th>Provider</Th>
                                        <Th>Created (UTC)</Th>
                                        <Th>Status</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={styles.emptyCell}>No recent activity.</td>
                                        </tr>
                                    )}
                                    {recent.map(r => (
                                        <tr key={r.id} style={styles.row}>
                                            <Td mono title={r.id}>{r.id}</Td>
                                            <Td>{r.destination}</Td>
                                            <Td>{r.provider}</Td>
                                            <Td>{formatDateTime(r.createdUtc)}</Td>
                                            <Td>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                    background: '#f0f0f0',
                                                    color: statusColor(r.status),
                                                    fontWeight: 600
                                                }}>{r.status}</span>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={styles.legendRow}>
                            Legend: <ColorDot color="#1b873f" /> Verified/Success &nbsp;
                            <ColorDot color="#b88700" /> Pending &nbsp;
                            <ColorDot color="#c62828" /> Failed
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

/* Components */

function ActionCard({ to, title, description, accent, icon }) {
    return (
        <Link to={to} style={{ ...styles.actionCard, borderTopColor: accent }}>
            <div style={styles.actionIcon} aria-hidden="true">{icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h3 style={styles.actionTitle}>{title}</h3>
                <p style={styles.actionDescription}>{description}</p>
                <span style={{ ...styles.actionLink, color: accent }}>Open →</span>
            </div>
        </Link>
    );
}

function SummaryCard({ label, value, emphasisColor }) {
    return (
        <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>{label}</span>
            <strong style={{
                ...styles.summaryValue,
                color: emphasisColor || '#111'
            }}>{value != null ? value : '--'}</strong>
        </div>
    );
}

function RoleBadge({ role }) {
    return (
        <span style={styles.roleBadge}>
            {role}
        </span>
    );
}

function Th({ children }) {
    return (
        <th style={styles.th}>
            {children}
        </th>
    );
}

function Td({ children, mono, title }) {
    return (
        <td title={title} style={{
            ...styles.td,
            fontFamily: mono ? 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace' : undefined
        }}>
            {children}
        </td>
    );
}

function ColorDot({ color }) {
    return (
        <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            background: color,
            borderRadius: '50%',
            verticalAlign: 'middle',
            margin: '0 4px 0 6px'
        }} />
    );
}

/* Inline style object (kept here to avoid external CSS for now) */
const styles = {
    headerBar: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 24,
        alignItems: 'stretch',
        padding: '8px 4px 16px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 28
    },
    identityBlock: {
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        minWidth: 0
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 600,
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        userSelect: 'none'
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 0.3,
        margin: 0,
        lineHeight: 1.15
    },
    userMetaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center'
    },
    usernameText: {
        fontSize: 14,
        fontWeight: 500,
        color: '#334155',
        background: '#e2e8f0',
        padding: '4px 10px',
        borderRadius: 20
    },
    noRole: {
        fontSize: 12,
        color: '#94a3b8'
    },
    roleBadgeContainer: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
    },
    roleBadge: {
        background: '#1e293b',
        color: '#fff',
        fontSize: 11,
        padding: '4px 10px',
        borderRadius: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    headerActions: {
        display: 'flex',
        gap: 10,
        alignItems: 'center'
    },
    select: {
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid #cbd5e1',
        background: '#fff',
        fontSize: 13
    },
    secondaryButton: {
        padding: '8px 14px',
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 13
    },
    dangerButton: {
        padding: '8px 16px',
        background: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600
    },
    quickActionsSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 20,
        marginBottom: 36
    },
    actionCard: {
        display: 'flex',
        gap: 16,
        textDecoration: 'none',
        background: '#fff',
        padding: '16px 18px 18px',
        borderRadius: 14,
        position: 'relative',
        border: '1px solid #e2e8f0',
        borderTopWidth: 6,
        transition: 'box-shadow .2s, transform .15s',
        color: '#111'
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24
    },
    actionTitle: {
        margin: 0,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: 0.2
    },
    actionDescription: {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.35,
        color: '#475569'
    },
    actionLink: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.8
    },
    cardsGrid: {
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        marginBottom: 40
    },
    summaryCard: {
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '18px 16px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    },
    summaryLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#64748b',
        fontWeight: 600
    },
    summaryValue: {
        fontSize: 26,
        lineHeight: 1.05,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums'
    },
    sectionHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 14
    },
    sectionTitle: {
        fontSize: 18,
        margin: 0,
        fontWeight: 600,
        letterSpacing: 0.3
    },
    tableWrapper: {
        overflowX: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        background: '#fff'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: 760
    },
    thead: {
        background: '#f8fafc'
    },
    th: {
        textAlign: 'left',
        padding: '10px 12px',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.5,
        color: '#334155',
        borderBottom: '1px solid #e2e8f0',
        whiteSpace: 'nowrap'
    },
    td: {
        padding: '10px 12px',
        fontSize: 13,
        borderBottom: '1px solid #f1f5f9',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    row: {
        transition: 'background .15s'
    },
    emptyCell: {
        padding: 20,
        textAlign: 'center',
        color: '#64748b',
        fontSize: 13
    },
    legendRow: {
        marginTop: 10,
        fontSize: 12,
        color: '#475569'
    },
    errorBox: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        padding: 14,
        borderRadius: 10,
        color: '#b91c1c',
        marginBottom: 32,
        fontSize: 14
    }
};

/* Small hover effects (inline style augmentation) */
Object.assign(styles.actionCard, {
    ':hover': null
});

/* Basic runtime enhancement: add hover via JS (optional, keeps CSS out) */
if (typeof window !== 'undefined') {
    // This is intentionally lightweight; in a larger app use a CSS file or CSS-in-JS library.
    const styleId = '__dashboard_inline_hover__';
    if (!document.getElementById(styleId)) {
        const tag = document.createElement('style');
        tag.id = styleId;
        tag.innerHTML = `
            a[style*="border-top-width: 6px"]:hover {
                box-shadow: 0 4px 14px rgba(0,0,0,0.12);
                transform: translateY(-2px);
            }
            button:hover:not(:disabled) { filter: brightness(0.95); }
        `;
        document.head.appendChild(tag);
    }
}