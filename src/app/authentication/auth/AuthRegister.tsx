import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

interface registerType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email : '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Registration failed');
            // }

            // Registration successful
            router.push('/authentication/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <Box component="form" onSubmit={handleSubmit}>
                <Stack mb={3}>
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='name' mb="5px">Name</Typography>
                    <CustomTextField 
                        id="name" 
                        variant="outlined" 
                        fullWidth 
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">Email</Typography>
                    <CustomTextField 
                        id="email" 
                        variant="outlined" 
                        fullWidth 
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">Password</Typography>
                    <CustomTextField 
                        id="password" 
                        variant="outlined" 
                        fullWidth 
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </Stack>

                {error && (
                    <Typography color="error" variant="body2" mb={2}>
                        {error}
                    </Typography>
                )}

                <Button 
                    color="primary" 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </Box>
            {subtitle}
        </>
    );
};

export default AuthRegister;
