import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Please set VITE_SUPABASE_ANON_KEY in your frontend .env file to enable Supabase sign in.");
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
        setMessage("Account created! You can now sign in.");
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (onAuthSuccess) onAuthSuccess(data.session);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1
          }}
        >
          ×
        </button>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          color: "var(--cream)",
          marginBottom: 6
        }}>
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 20
        }}>
          {isSignUp
            ? "Sign up to sync your resume, saved jobs, and applications"
            : "Sign in to access your saved resume and application tracker"}
        </p>

        {error && (
          <div style={{
            background: "rgba(217,95,95,0.1)",
            border: "1px solid rgba(217,95,95,0.3)",
            color: "var(--red)",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 13,
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: "rgba(93,186,126,0.1)",
            border: "1px solid rgba(93,186,126,0.3)",
            color: "var(--green)",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 13,
            marginBottom: 16
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            style={{ marginTop: 0 }}
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--gold)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
