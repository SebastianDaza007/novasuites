'use client';

import React from 'react';
import FormLogin from '../../../components/formulario/form_login';


export default function LoginPage() {
  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    console.log('Login submitted:', { email, password, rememberMe });
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <FormLogin
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
