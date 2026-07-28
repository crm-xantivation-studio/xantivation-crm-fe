'use client';

import React from 'react';
import { AuthUI } from '@/components/ui/auth-ui';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const { login, register } = useAuth();

  const handleSubmit = async (data: any, isSignIn: boolean) => {
    if (isSignIn) {
      await login({ email: data.email, password: data.password });
    } else {
      await register({
        firstName: data.name || '',
        lastName: '',
        email: data.email,
        password: data.password,
      });
    }
  };

  return <AuthUI defaultIsSignIn={false} onSubmit={handleSubmit} />;
}
