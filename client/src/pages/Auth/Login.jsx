import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components';

export default function Login() {
  const navigate = useNavigate();
  const { login, signInWithOAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  /* Handle Google OAuth */
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const result = await signInWithOAuth('google');
    if (!result.success) {
      setError(result.error || "Google sign-in failed");
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
              <Link
                to="/forgot-password"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <AuthButton loading={loading} disabled={!isEmailValid(formData.email) || formData.password === ""}>
              Sign In
            </AuthButton>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/40 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 10.8v3.6h5.1c-.2 1.3-1.5 3.8-5.1 3.8A6 6 0 1 1 12 6c1.7 0 2.9.7 3.6 1.3l2.4-2.3C16.5 3.6 14.4 2.5 12 2.5A9.5 9.5 0 1 0 21.5 12c0-.6-.1-1.1-.2-1.7H12z" />
            </svg>
            Google
          </button>

          <div className="text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-white hover:underline font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </motion.div>
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
        <input
          {...props}
          type={inputType}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AuthButton = ({ children, loading, ...props }) => (
  <button
    {...props}
    className="w-full py-4 rounded-xl bg-white text-black font-bold shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100"
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : children}
  </button>
);
