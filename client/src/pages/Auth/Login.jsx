import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components';

export default function Login() {
  const navigate = useNavigate();
  const { login, forgotPassword } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = (email) => email === "" || emailRegex.test(email);

  /* Handle Login */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) navigate("/dashboard");
      else setError(result.error || "Invalid credentials");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(formData.email);
      if (result.success) {
        setSuccessMsg('If that email exists, a reset link has been sent.');
        setFormData({ email: '', password: '' });
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 font-sans selection:bg-white/10">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl p-8 md:p-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo />
        </motion.div>

        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-zinc-400 mt-2">Resume your team's relay.</p>
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

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <AuthInput
                label="Email"
                icon={<Mail size={18} />}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <AuthInput
                label="Password"
                icon={<Lock size={18} />}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError("");
                    setSuccessMsg("");
                  }}
                  variant="text"
                  color="inherit"
                  size="small"
                >
                  Forgot password?
                </Button>
              </div>

              <AuthButton loading={loading} disabled={!isEmailValid(formData.email) || formData.password === ""}>
                Sign In
              </AuthButton>
            </form>

            <div className="text-center text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:underline font-semibold transition-colors">
                Sign up
              </Link>
            </div>
          </motion.div>
        )}

        {mode === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Button
              onClick={() => {
                setMode('login');
                setError("");
                setSuccessMsg("");
              }}
              variant="text"
              color="inherit"
              startIcon={<ArrowLeft size={16} />}
            >
              Back to Login
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
              <p className="text-zinc-400 mt-2">Enter your email to receive a reset link.</p>
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <AuthButton loading={loading} disabled={!isEmailValid(formData.email)}>
                Send Reset Link
              </AuthButton>
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-400 text-sm text-center"
                >
                  {successMsg}
                </motion.p>
              )}
            </form>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

/* Helper Components */
const AuthInput = ({ label, icon, type = 'text', ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && isPasswordVisible ? 'text' : type;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
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
