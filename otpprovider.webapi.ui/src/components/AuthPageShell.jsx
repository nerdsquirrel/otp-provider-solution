import { useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { Link } from 'react-router-dom';

export default function AuthPageShell({ title, children, secondaryLink }) {
    useEffect(() => { document.title = `${title} · otpfy`; }, [title]);

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <BrandLogo withText />
            </header>
            <main style={styles.main}>
                <section style={styles.card} aria-labelledby="auth-title">
                    <h1 id="auth-title" style={styles.heading}>{title}</h1>
                    {children}
                    {secondaryLink && (
                        <div style={styles.secondaryRow}>
                            {secondaryLink}
                        </div>
                    )}
                </section>
            </main>
            <footer style={styles.footer}>
                <span>© {new Date().getFullYear()} otpfy</span>
                <Link to="/login" style={styles.footerLink}>Login</Link>
                <Link to="/register" style={styles.footerLink}>Register</Link>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#fafbfc',
        fontFamily: 'system-ui, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: '24px 26px 10px'
    },
    main: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '30px 16px'
    },
    card: {
        width: '100%',
        maxWidth: 440,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        padding: '34px 34px 40px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 22
    },
    heading: {
        margin: 0,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 0.4
    },
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
        background: '#fff',
        outline: 'none'
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
        fontSize: 15,
        letterSpacing: 0.3
    },
    primaryButtonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    secondaryRow: {
        fontSize: 13,
        textAlign: 'center',
        color: '#475569'
    },
    link: {
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: 600
    },
    footer: {
        padding: '18px 26px 30px',
        display: 'flex',
        gap: 18,
        fontSize: 12,
        color: '#64748b',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    footerLink: {
        color: '#475569',
        textDecoration: 'none',
        fontWeight: 500
    }
};

/* Lightweight runtime focus and hover styling */
if (typeof window !== 'undefined') {
    const styleId = '__auth_inline_hover__';
    if (!document.getElementById(styleId)) {
        const tag = document.createElement('style');
        tag.id = styleId;
        tag.innerHTML = `
            input:focus { outline:2px solid #2563eb33; border-color:#2563eb; }
            button:hover:not(:disabled) { filter:brightness(.96); }
            a:hover { text-decoration:underline; }
        `;
        document.head.appendChild(tag);
    }
}