import { useEffect } from 'react';
import {
    Box, TextField, MenuItem, FormControlLabel, Switch,
    Button, Stack, Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';

const defaultValues = {
    name: '',
    description: '',
    deliveryType: '',
    isActive: true,
    configurationJson: ''
};

export default function OtpProviderForm({ initial, onSubmit, onCancel, submitting, deliveryTypeOptions = [] }) {
    const { register, handleSubmit, reset, formState: { errors }, setError, watch } =
        useForm({ defaultValues });

    // Determine a safe default delivery type
    const firstOption = deliveryTypeOptions.length ? deliveryTypeOptions[0].value : '';

    useEffect(() => {
        reset(initial ? {
            name: initial.name ?? '',
            description: initial.description ?? '',
            deliveryType: initial.deliveryType ?? firstOption,
            isActive: initial.isActive ?? true,
            configurationJson: initial.configurationJson ?? ''
        } : {
            ...defaultValues,
            deliveryType: firstOption
        });
    }, [initial, reset, firstOption, deliveryTypeOptions]);

    const validateJson = (v) => {
        if (!v || !v.trim()) return true;
        try { JSON.parse(v); return true; } catch { return false; }
    };

    const submitHandler = (data) => {
        if (!validateJson(data.configurationJson)) {
            setError('configurationJson', { message: 'Invalid JSON' });
            return;
        }
        onSubmit(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submitHandler)}>
            <Stack spacing={2}>
                <Typography variant="h6">{initial ? 'Edit Provider' : 'Add Provider'}</Typography>
                <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    inputProps={{ maxLength: 100 }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    {...register('name', { required: 'Name required', maxLength: { value: 100, message: 'Max 100 chars' } })}
                />
                <TextField
                    label="Description"
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    inputProps={{ maxLength: 512 }}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    {...register('description', { maxLength: { value: 512, message: 'Max 512 chars' } })}
                />
                <TextField
                    label="Delivery Type"
                    select
                    size="small"
                    fullWidth
                    disabled={!deliveryTypeOptions.length}
                    error={!!errors.deliveryType}
                    helperText={errors.deliveryType?.message || (!deliveryTypeOptions.length ? 'Loading options...' : '')}
                    {...register('deliveryType', { required: 'Required' })}
                >
                    {deliveryTypeOptions.map(o => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                </TextField>

                <FormControlLabel
                    control={<Switch defaultChecked={watch('isActive')} {...register('isActive')} />}
                    label="Active"
                />

                <TextField
                    label="Configuration (JSON)"
                    size="small"
                    multiline
                    minRows={4}
                    fullWidth
                    inputProps={{ maxLength: 2048, style: { fontFamily: 'monospace', fontSize: 13 } }}
                    error={!!errors.configurationJson}
                    helperText={errors.configurationJson?.message || 'Optional. Provide JSON for provider-specific settings.'}
                    {...register('configurationJson', {
                        validate: v => validateJson(v) || 'Invalid JSON',
                        maxLength: { value: 2048, message: 'Max 2048 chars' }
                    })}
                />

                <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" disabled={submitting || !deliveryTypeOptions.length}>
                        {submitting ? 'Saving...' : (initial ? 'Update' : 'Create')}
                    </Button>
                    {initial && (
                        <Button type="button" variant="outlined" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}