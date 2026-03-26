import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword, resendVerification } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const passwordInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = (email) => email === "" || emailRegex.test(email);

  useEffect(() => {
    if (!location.state?.emailVerified) return;
    const verifiedEmail = typeof location.state?.email === 'string' ? location.state.email : '';

    setUnverifiedEmail("");
    setResendSuccess(false);
    setError("");
    setSuccessMsg("Email verified successfully. You can sign in now.");
    if (verifiedEmail) {
      setFormData((prev) => ({ ...prev, email: verifiedEmail }));
    }

    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  /* Handle Login */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setUnverifiedEmail("");
    setResendSuccess(false);
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else if (result.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(result.email || formData.email);
      } else {
        setError(result.error || "Invalid credentials");
      }
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

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    const result = await resendVerification(unverifiedEmail);
    setResendLoading(false);
    if (result.success) setResendSuccess(true);
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
        className="relative w-full max-w-[400px] rounded-3xl overflow-hidden bg-zinc-950/50 border border-white/10 backdrop-blur-3xl shadow-2xl p-8 sm:p-10"
      >
        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-zinc-500 mt-2 text-sm sm:text-base">Resume your team's relay.</p>
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

            {unverifiedEmail && !resendSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
              >
                <p className="text-amber-300 font-medium mb-1">Email not verified</p>
                <p className="text-amber-400/80 text-xs mb-3">
                  Check your inbox for <span className="font-medium text-amber-300">{unverifiedEmail}</span>.
                  The link expires after 24 hours.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500
                             px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              </motion.div>
            )}

            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
              >
                Verification email resent! Check your inbox.
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
              >
                {successMsg}
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
                inputRef={passwordInputRef}
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

            <div className="text-center text-xs sm:text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:text-zinc-300 font-semibold transition-colors">
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
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
      <TextField
        {...props}
        type={inputType}
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.4)', mr: 0.5 }}>
              {icon}
            </InputAdornment>
          ) : null,
          endAdornment: isPasswordType ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                edge="end"
                size="small"
                sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white' } }}
              >
                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3) !important',
              },
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            fontSize: '0.875rem',
            py: 1.2,
          },
          '& .MuiInputBase-input:-webkit-autofill': {
            WebkitTextFillColor: '#ffffff',
            WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.03) inset',
            transition: 'background-color 9999s ease-out 0s',
            caretColor: '#ffffff',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiInputBase-input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.05) inset',
          },
        }}
      />
    </div>
  );
};

const AuthButton = ({ children, loading, ...props }) => (
  <Button
    {...props}
    type="submit"
    fullWidth
    variant="contained"
    sx={{ 
      py: 1.5, 
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 'bold',
      fontSize: '0.95rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      '&:hover': {
        boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
      }
    }}
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : children}
  </Button>
);
