import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();

    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new link.");
        }
    }, [token]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!token) return;

        setError("");

        if (formData.password.length < 8) {
            return setError("Password must be at least 8 characters");
        }

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        try {
            const result = await resetPassword(token, formData.password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(result.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
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

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Password Reset Successful</h1>
                            <p className="text-zinc-400 mt-2">Your password has been updated. Redirecting to login...</p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
                        >
                            Sign In Now
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reset"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Set New Password</h1>
                            <p className="text-zinc-400 mt-2">Create a secure password for your account.</p>
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

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <AuthInput
                                label="New Password"
                                icon={<Lock size={18} />}
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <AuthInput
                                label="Confirm Password"
                                icon={<Lock size={18} />}
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />

                            <AuthButton loading={loading} disabled={!token || loading}>
                                Reset Password
                            </AuthButton>
                        </form>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
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
