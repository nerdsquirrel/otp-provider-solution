import { useEffect, useState, useCallback } from 'react';
import {
    Box, Paper, Typography, Divider, Table, TableHead, TableRow,
    TableCell, TableBody, IconButton, Chip, Tooltip, Stack, Alert,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    getOtpProviders,
    createOtpProvider,
    updateOtpProvider,
    deleteOtpProvider
} from '../api/otpProvidersApi';
import OtpProviderForm from '../components/OtpProviderForm';
import { useNavigate } from 'react-router-dom';

export default function OtpProvidersPage() {
    const navigate = useNavigate();

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editItem, setEditItem] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getOtpProviders();
            setProviders(data);
        } catch (e) {
            setError(e?.response?.data || e.message || 'Load failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [navigate, load]);

    async function handleCreate(values) {
        setSaving(true); setError('');
        try {
            await createOtpProvider(values);
            await load();
        } catch (e) {
            setError(e?.response?.data || e.message || 'Create failed');
        } finally { setSaving(false); }
    }

    async function handleUpdate(values) {
        if (!editItem) return;
        setSaving(true); setError('');
        try {
            await updateOtpProvider(editItem.id, values);
            setEditItem(null);
            await load();
        } catch (e) {
            setError(e?.response?.data || e.message || 'Update failed');
        } finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this provider?')) return;
        setError('');
        try {
            await deleteOtpProvider(id);
            await load();
        } catch (e) {
            setError(e?.response?.data || e.message || 'Delete failed');
        }
    }

    return (
        <Box p={3} sx={{ maxWidth: 1250, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5">OTP Providers</Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Dashboard">
                        <Chip label="Dashboard" onClick={() => navigate('/dashboard')} />
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton onClick={load} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                <Paper sx={{ p: 2, width: 380, flexShrink: 0 }} elevation={4}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <AddCircleOutlineIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={600}>
                            {editItem ? 'Edit Provider' : 'Add Provider'}
                        </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <OtpProviderForm
                        initial={editItem}
                        onSubmit={editItem ? handleUpdate : handleCreate}
                        onCancel={() => setEditItem(null)}
                        submitting={saving}
                    />
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }} elevation={4}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>Existing Providers</Typography>
                        {loading && <CircularProgress size={22} />}
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    {!loading && providers.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No providers configured.</Typography>
                    )}
                    {!loading && providers.length > 0 && (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Delivery</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell>Created (UTC)</TableCell>
                                    <TableCell width={120}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {providers.map(p => (
                                    <TableRow key={p.id} hover>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.deliveryType}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={p.isActive ? 'Yes' : 'No'}
                                                size="small"
                                                color={p.isActive ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(p.createdAtUtc).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => setEditItem(p)}>
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Paper>
            </Stack>
        </Box>
    );
}