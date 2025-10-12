import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';
import UserPreferencesForm from '../components/UserPreferencesForm';

export default function UserPreferencesPage() {
    const { username, roles } = useAuth();

    const initials = (username || 'User')
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join('');

    return (
        <div style={styles.page}>
            <header style={styles.headerBar}>
                <div style={styles.identityBlock}>
                    <div style={styles.avatar}>{initials}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h1 style={styles.pageTitle}>User OTP Preferences</h1>
                        <div style={styles.userMetaRow}>
                            <span style={styles.usernameChip}>{username || 'Anonymous'}</span>
                            {roles?.length
                                ? <div style={styles.roleBadgeContainer}>
                                    {roles.map(r => <span key={r} style={styles.roleBadge}>{r}</span>)}
                                </div>
                                : <span style={styles.noRole}>No roles</span>}
                        </div>
                    </div>
                </div>
                <div style={styles.headerActions}>
                    <Link to="/dashboard" style={styles.secondaryButton}>← Dashboard</Link>
                </div>
            </header>

            <UserPreferencesForm />

            <p style={styles.footerNote}>
                Adjust OTP generation & policy. Application logic must apply these settings during send & verify operations.
            </p>
        </div>
    );
}

const styles = {
    page: { padding: 24, fontFamily: 'system-ui, Arial, sans-serif', background: '#fafbfc', minHeight: '100vh', maxWidth: 1100, margin: '0 auto' },
    headerBar: { display: 'flex', justifyContent: 'space-between', gap: 24, padding: '8px 4px 18px', borderBottom: '1px solid #e2e8f0', marginBottom: 30, flexWrap: 'wrap' },
    identityBlock: { display: 'flex', gap: 16, alignItems: 'center', minWidth: 0 },
    avatar: { width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.15)' },
    pageTitle: { fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.15, letterSpacing: 0.3 },
    userMetaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    usernameChip: { fontSize: 13, fontWeight: 500, background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: 18 },
    noRole: { fontSize: 12, color: '#94a3b8' },
    roleBadgeContainer: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    roleBadge: { background: '#1e293b', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
    headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
    secondaryButton: { background: '#f1f5f9', color: '#334155', padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontWeight: 500 },
    footerNote: { fontSize: 11, color: '#64748b', marginTop: 38, maxWidth: 760, lineHeight: 1.4 }
};

if (typeof window !== 'undefined') {
    const id = '__userprefs_page_hover__';
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
        a:hover[style*="padding: 10px 20px"] { filter: brightness(.96); }
        `;
        document.head.appendChild(style);
    }
}