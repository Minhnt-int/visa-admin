'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button, Typography, Container, Stack, Box } from '@mui/material';

const NotFoundContent = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Container maxWidth="sm">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            The page you are looking for doesn&apos;t exist or has been moved.
          </Typography>
          <Link href="/" passHref>
            <Button variant="contained" color="primary">
              Go back to home
            </Button>
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 