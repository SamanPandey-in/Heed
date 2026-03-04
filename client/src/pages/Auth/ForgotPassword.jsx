import React from 'react';
import { Button } from '@mui/material';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword({
  loginData,
  setLoginData,
  handleForgotPassword,
  loading,
  error,
  successMsg,
  setAuthMode,
  setError,
  setSuccessMsg,
  isEmailValid,
  AuthInput,
  AuthButton,
}) {
  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <Button
        onClick={() => {
          setAuthMode('login');
          setError('');
          setSuccessMsg('');
        }}
        variant="text"
        color="inherit"
        startIcon={<ArrowLeft size={16} />}
      >
        Back to Login
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        <p className="text-zinc-400 mt-2">Enter your email to receive a password reset link.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <AuthInput
          label="Email"
          icon={<Mail size={18} />}
          type="email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        />

        <AuthButton loading={loading} disabled={!isEmailValid(loginData.email)}>
          Send Reset Email
        </AuthButton>

        {successMsg && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cyan-400 text-sm text-center">
            {successMsg}
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}
