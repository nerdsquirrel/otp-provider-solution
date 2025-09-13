import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper, Stack, Alert
} from '@mui/material';

export default function RegisterPage() {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setError('');
        setOk(false);
        setLoading(true);
        try {
            await registerUser(data);
            setOk(true);
            setTimeout(() => navigate('/login'), 1200);
        } catch (e) {
            setError(e?.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" mt={10} px={2}>
            <Paper elevation={6} sx={{ p: 4, width: 420 }}>
                <Typography variant="h5" mb={2}>Create Account</Typography>
                <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                    <TextField label="Username" {...register('username', { required: true, maxLength: 25 })} />
                    <TextField label="Email" type="email" {...register('email', { required: true })} />
                    <TextField label="Password" type="password" {...register('password', { required: true, minLength: 6 })} />
                    {error && <Alert severity="error">{error}</Alert>}
                    {ok && <Alert severity="success">Registered. Redirecting...</Alert>}
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Submitting...' : 'Register'}
                    </Button>
                    <Typography variant="body2">
                        Have an account? <Link to="/login">Login</Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}