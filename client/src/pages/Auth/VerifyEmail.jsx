import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please use the link from your email.");
      return;
    }

    const runVerification = async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        if (result.code === "ALREADY_VERIFIED") {
          setStatus("already_verified");
          setMessage("Your email is already verified.");
        } else {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          setTimeout(() => navigate("/login"), 3000);
        }
      } else {
        setStatus("error");
        setMessage(result.error || "The verification link is invalid or has expired.");
      }
    };

    runVerification();
  }, []);

  const isSuccess = status === "success" || status === "already_verified";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden
                   bg-white/[0.02] border border-white/10 backdrop-blur-2xl
                   shadow-2xl p-8 md:p-10 text-center"
      >
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-white">Verifying your email...</h2>
            <p className="text-zinc-500 text-sm">This will only take a moment.</p>
          </div>
        )}

        {isSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30
                            flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-zinc-400 text-sm">{message}</p>
            {status === "success" && (
              <p className="text-zinc-600 text-xs">Redirecting to login in 3 seconds...</p>
            )}
            <Link
              to="/login"
              className="block w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700
                         text-white text-sm font-semibold transition-colors mt-4"
            >
              Log in now
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30
                            flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-zinc-400 text-sm">{message}</p>
            <Link
              to="/login"
              className="block w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700
                         text-white text-sm font-medium transition-colors mt-4"
            >
              Back to Login
            </Link>
            <p className="text-zinc-600 text-xs">
              On the login page, use "Resend verification email" to get a fresh link.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
