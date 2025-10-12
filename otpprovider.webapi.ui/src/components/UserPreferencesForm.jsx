import { useState, useEffect } from 'react';
import { getUserPreferences, saveUserPreferences } from '../api/userPreferencesApi';
import { getDeliveryTypes, getOtpProviders } from '../api/otpProvidersApi';

export default function UserPreferencesForm({ onSaved }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');
    const [updatedAt, setUpdatedAt] = useState(null);

    const [channels, setChannels] = useState([]);
    const [providers, setProviders] = useState([]);
    const [providersLoading, setProvidersLoading] = useState(false);

    const [form, setForm] = useState({
        otpLength: 4,
        characterSet: 0,
        expirationSeconds: 300,
        maxVerificationAttempts: 3,
        retryDelaySeconds: 30,
        preferredChannel: 'SMS',
        preferredProviderId: 0
    });

    // Load delivery types & user preferences
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const [deliveryTypes, prefs] = await Promise.all([
                    getDeliveryTypes(),
                    getUserPreferences()
                ]);
                if (!active) return;

                const normalizedChannels = deliveryTypes.map(d => (d.value ? d : { value: d, label: String(d) }));
                setChannels(normalizedChannels);

                setForm(f => ({
                    ...f,
                    otpLength: prefs.otpLength,
                    characterSet: prefs.characterSet,
                    expirationSeconds: prefs.expirationSeconds,
                    maxVerificationAttempts: prefs.maxVerificationAttempts,
                    retryDelaySeconds: prefs.retryDelaySeconds,
                    preferredChannel: prefs.preferredChannel || (normalizedChannels[0]?.value ?? 'SMS'),
                    preferredProviderId: prefs.preferredProviderId > 0 ? prefs.preferredProviderId : 0
                }));
                setUpdatedAt(prefs.updatedAtUtc);
            } catch (e) {
                setError(e?.response?.data || e.message || 'Failed to load preferences.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    // Load providers when channel changes
    useEffect(() => {
        let active = true;
        (async () => {
            if (!form.preferredChannel) return;
            setProvidersLoading(true);
            try {
                const list = await getOtpProviders({ onlyActive: true, deliveryType: form.preferredChannel });
                if (!active) return;
                setProviders(list);
                setForm(f => ({
                    ...f,
                    preferredProviderId: list.some(p => p.id === f.preferredProviderId)
                        ? f.preferredProviderId
                        : (list[0]?.id ?? 0)
                }));
            } catch (e) {
                if (!active) return;
                setProviders([]);
                setForm(f => ({ ...f, preferredProviderId: 0 }));
                setError(e?.response?.data || e.message || 'Failed to load providers.');
            } finally {
                if (active) setProvidersLoading(false);
            }
        })();
        return () => { active = false; };
    }, [form.preferredChannel]);

    function updateField(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.preferredProviderId || !providers.some(p => p.id === form.preferredProviderId)) {
            setError('A valid preferred provider is required.');
            return;
        }
        setSaving(true);
        setError('');
        setOk('');
        try {
            const payload = {
                otpLength: form.otpLength,
                characterSet: Number(form.characterSet),
                expirationSeconds: form.expirationSeconds,
                maxVerificationAttempts: form.maxVerificationAttempts,
                retryDelaySeconds: form.retryDelaySeconds,
                preferredChannel: form.preferredChannel,
                preferredProviderId: form.preferredProviderId
            };
            const saved = await saveUserPreferences(payload);
            setOk('Preferences saved.');
            setUpdatedAt(saved.updatedAtUtc);
            onSaved?.(saved);
        } catch (e) {
            setError(e?.response?.data || e.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <section style={styles.formCard}>
            <form onSubmit={handleSubmit} style={styles.formLayout}>
                <div style={styles.fieldGrid}>
                    <Field label="OTP Length">
                        <select
                            value={form.otpLength}
                            onChange={e => updateField('otpLength', Number(e.target.value))}
                            style={styles.select}
                            disabled={saving}
                        >
                            {[4, 5, 6].map(v => <option key={v} value={v}>{v} digits</option>)}
                        </select>
                    </Field>

                    <Field label="Character Set">
                        <select
                            value={form.characterSet}
                            onChange={e => updateField('characterSet', Number(e.target.value))}
                            style={styles.select}
                            disabled={saving}
                        >
                            <option value={0}>Numeric</option>
                            <option value={1}>Alphanumeric</option>
                        </select>
                    </Field>

                    <Field label="Expiration (sec)">
                        <input
                            type="number"
                            min={10}
                            max={3600}
                            value={form.expirationSeconds}
                            onChange={e => updateField('expirationSeconds', Number(e.target.value))}
                            style={styles.input}
                            disabled={saving}
                        />
                    </Field>

                    <Field label="Max Attempts">
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={form.maxVerificationAttempts}
                            onChange={e => updateField('maxVerificationAttempts', Number(e.target.value))}
                            style={styles.input}
                            disabled={saving}
                        />
                    </Field>

                    <Field label="Retry Delay (sec)">
                        <input
                            type="number"
                            min={0}
                            max={1800}
                            value={form.retryDelaySeconds}
                            onChange={e => updateField('retryDelaySeconds', Number(e.target.value))}
                            style={styles.input}
                            disabled={saving}
                        />
                    </Field>

                    <Field label="Preferred Channel">
                        <select
                            value={form.preferredChannel}
                            onChange={e => updateField('preferredChannel', e.target.value)}
                            style={styles.select}
                            disabled={saving || !channels.length}
                        >
                            {channels.map(ch => (
                                <option key={ch.value} value={ch.value}>{ch.label}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Preferred Provider">
                        <select
                            value={form.preferredProviderId || ''}
                            onChange={e => updateField('preferredProviderId', e.target.value ? Number(e.target.value) : 0)}
                            style={styles.select}
                            disabled={saving || providersLoading || !providers.length}
                        >
                            {providersLoading && <option value="">Loading...</option>}
                            {!providersLoading && providers.length === 0 && <option value="">None</option>}
                            {!providersLoading && providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div style={styles.inlineNote}>
                    A preferred provider must be selected for the chosen channel.
                </div>

                <div style={styles.actionsRow}>
                    <button type="submit" disabled={saving} style={styles.primaryButton}>
                        {saving ? 'Saving�' : 'Save Preferences'}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        style={styles.resetButton}
                        onClick={() => { setError(''); setOk(''); }}
                    >
                        Reset Status
                    </button>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}
                {ok && <div style={styles.successMsg}>{ok}</div>}
                {updatedAt && <div style={styles.lastUpdated}>Last updated: {new Date(updatedAt).toLocaleString()}</div>}
                {loading && <div style={styles.infoMsg}>Loading preferences�</div>}
            </form>
        </section>
    );
}

function Field({ label, children }) {
    return (
        <label style={styles.field}>
            <span style={styles.fieldLabel}>{label}</span>
            {children}
        </label>
    );
}

const styles = {
    formCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 30px', boxShadow: '0 1px 2px rgba(0,0,0,.04)', maxWidth: 1000 },
    formLayout: { display: 'flex', flexDirection: 'column', gap: 24 },
    fieldGrid: { display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
    field: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 },
    fieldLabel: { fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#475569' },
    select: { height: 42, borderRadius: 10, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, background: '#fff' },
    input: { height: 42, borderRadius: 10, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, background: '#fff' },
    inlineNote: { fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '10px 12px', borderRadius: 10, lineHeight: 1.35 },
    actionsRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    primaryButton: { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontWeight: 600, padding: '10px 22px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 },
    resetButton: { background: '#fff', color: '#475569', padding: '10px 18px', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 500 },
    errorMsg: { fontSize: 13, color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: 10 },
    successMsg: { fontSize: 13, color: '#065f46', background: '#d1fae5', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: 10 },
    infoMsg: { fontSize: 12, color: '#475569' },
    lastUpdated: { fontSize: 11, color: '#64748b', marginTop: -6 }
};

if (typeof window !== 'undefined') {
    const id = '__userprefs_req_provider_hover__';
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
        button:hover:not(:disabled) { filter: brightness(.96); }
        input:focus, select:focus { outline:2px solid #2563eb33; border-color:#2563eb; }
        `;
        document.head.appendChild(style);
    }
}