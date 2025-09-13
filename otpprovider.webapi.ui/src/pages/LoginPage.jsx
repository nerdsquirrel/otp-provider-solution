import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper, Stack, Alert
} from '@mui/material';

export default function LoginPage() {
    const { register, handleSubmit } = useForm();
    const { login: setAuthToken } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);
        try {
            const token = await login(data);
            setAuthToken(token);
            navigate('/dashboard');
        } catch (e) {
            setError(e?.response?.data || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" mt={10} px={2}>
            <Paper elevation={6} sx={{ p: 4, width: 380 }}>
                <Typography variant="h5" mb={2}>Sign In</Typography>
                <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                    <TextField label="Username" autoFocus {...register('username', { required: true })} />
                    <TextField type="password" label="Password" {...register('password', { required: true })} />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                    </Button>
                    <Typography variant="body2">
                        No account? <Link to="/register">Register</Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}