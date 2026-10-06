import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";

export default function AuthModal({ isOpen = true, onClose, onAuthSuccess, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  if (isOpen === false) return null;

  const handleOAuth = async (provider) => {
    if (!isSupabaseConfigured) {
      setError("Please set VITE_SUPABASE_ANON_KEY in your .env file to enable authentication.");
      return;
    }
    setOauthLoading(provider);
    setError(null);
    setMessage(null);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setOauthLoading(null);
    }
  };

  const handleMagicLink = async () => {
    if (!isSupabaseConfigured) {
      setError("Please set VITE_SUPABASE_ANON_KEY in your .env file to enable authentication.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address above to receive a magic link.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (otpError) throw otpError;
      setMessage("✓ Magic login link sent! Check your email to sign in instantly without a password.");
    } catch (err) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Please set VITE_SUPABASE_ANON_KEY in your .env file to enable authentication.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("Account created! Check your email for verification or sign in now.");
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (onAuthSuccess) onAuthSuccess(data.session);
        if (onSuccess) onSuccess(data.session);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900/95 border border-slate-800 p-5 sm:p-8 shadow-2xl backdrop-blur-xl text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-white text-xl p-1.5 rounded-lg hover:bg-slate-800/80 transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5 sm:mb-6 pr-6 sm:pr-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex-shrink-0">
              ✦
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              AI Career Co-Pilot
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-white">
            {isSignUp ? "Create your workspace account" : "Sign in to your workspace"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your cloud-synced resume, saved job opportunities, and Kanban pipeline.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <span>✓</span>
            <span className="flex-1">{message}</span>
          </div>
        )}

        {/* OAuth Buttons Section */}
        <div className="flex flex-col gap-2.5 mb-2">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading || oauthLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-white text-xs font-semibold transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
          >
            {oauthLoading === "google" ? (
              <span className="animate-spin text-base">⟳</span>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{oauthLoading === "google" ? "Connecting to Google…" : "Continue with Google"}</span>
          </button>

          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={loading || oauthLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-white text-xs font-semibold transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
          >
            {oauthLoading === "github" ? (
              <span className="animate-spin text-base">⟳</span>
            ) : (
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>{oauthLoading === "github" ? "Connecting to GitHub…" : "Continue with GitHub"}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center mb-4">
          Requires provider enabled in your Supabase dashboard.
        </p>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            or continue with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@work.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              {loading ? "Verifying…" : isSignUp ? "Create Account" : "Sign In"}
            </button>
            {!isSignUp && (
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading || oauthLoading !== null}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition min-h-[40px] text-center"
                title="Log in without a password via email link"
              >
                ✉ Magic Link
              </button>
            )}
          </div>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-1"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
