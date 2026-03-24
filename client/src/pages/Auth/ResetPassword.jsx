import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, TextField, IconButton } from '@mui/material';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.newPassword || !formData.confirmPassword) {
      return setError('Both password fields are required');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        token,
        newPassword: formData.newPassword,
      });
      if (result.success) {
        setSuccessMsg('Password reset successful! Redirecting to login...');
        setFormData({ newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Failed to reset password. Token may have expired.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 font-sans selection:bg-white/10">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl p-8 md:p-10 text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle size={64} className="mx-auto text-green-400" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-white">Success!</h1>
            <p className="text-zinc-400 mt-2">{successMsg}</p>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold text-white">Set New Password</h1>
            <p className="text-zinc-400 mt-2">Enter your new password below.</p>
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
              label="New Password"
              icon={<Lock size={18} />}
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <AuthInput
              label="Confirm Password"
              icon={<Lock size={18} />}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <AuthButton
              loading={loading}
              disabled={!formData.newPassword || !formData.confirmPassword}
            >
              Reset Password
            </AuthButton>
          </form>

          <div className="text-center text-sm text-zinc-400">
            Remember your password?{" "}
            <Link to="/login" className="text-white hover:underline font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const AuthInput = ({ label, icon, type = 'text', ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && isPasswordVisible ? 'text' : type;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
          {icon}
        </div>
        <TextField
          {...props}
          type={inputType}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              pl: 4,
            },
          }}
        />
        {isPasswordType && (
          <IconButton
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </IconButton>
        )}
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
