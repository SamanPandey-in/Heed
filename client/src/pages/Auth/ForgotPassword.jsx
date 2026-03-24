import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = (value) => value === '' || emailRegex.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await forgotPassword({ email });
      if (result.success) {
        setSuccessMsg('If that email exists, a reset link has been sent.');
        setEmail('');
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 font-sans selection:bg-white/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl p-8 md:p-10"
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Button
            component={Link}
            to="/login"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email"
              icon={<Mail size={18} />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <AuthButton loading={loading} disabled={!isEmailValid(email) || !email.trim()}>
              Send Reset Email
            </AuthButton>

            {successMsg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cyan-400 text-sm text-center">
                {successMsg}
              </motion.p>
            )}
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

const AuthInput = ({ label, icon, type = 'text', ...props }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
          {icon}
        </div>
        <TextField
          {...props}
          type={type}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              pl: 4,
            },
          }}
        />
      </div>
    </div>
  );
};

const AuthButton = ({ children, loading, ...props }) => (
  <Button
    {...props}
    type="submit"
    fullWidth
    variant="contained"
    sx={{ py: 1.4 }}
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : children}
  </Button>
);
