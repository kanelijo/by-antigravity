import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Input({ label, type = "text", value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: "100%", padding: "11px 14px", borderRadius: "var(--radius-input)", border: `1.5px solid ${focused ? "var(--primary)" : "var(--border)"}`, boxShadow: focused ? "0 0 0 3px rgba(26,86,219,0.1)" : "none", fontSize: 14, outline: "none", background: "var(--white)", color: "var(--text)", transition: "all 0.2s", fontFamily: "var(--font-body)" }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}

function GoogleButton({ label, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ width: "100%", padding: "11px", background: "var(--white)", color: "var(--secondary)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-btn)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.6 : 1 }}>
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
      </svg>
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function Alert({ message, type }) {
  if (!message) return null;
  const s = type === "success"
    ? { bg: "var(--success-light)", color: "var(--success)", border: "#6EE7B7" }
    : { bg: "var(--danger-light)", color: "var(--danger)", border: "#FCA5A5" };
  return (
    <div style={{ padding: "10px 14px", borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 13, fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>
      {type === "error" ? "⚠️ " : "✅ "}{message}
    </div>
  );
}

function AuthCard({ children }) {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#F0F5FF,#F9FAFB)", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: 460, background: "var(--white)", borderRadius: "var(--radius-card)", padding: "36px 40px", boxShadow: "0 4px 24px rgba(26,86,219,0.08)", border: "1px solid #DCE8FF" }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "",
    postal_code: "", address: "", password: "", user_type: "seeker",
  });
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSignUp = async () => {
    if (!form.full_name || !form.email || !form.password || !form.phone) {
      setAlert({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (form.password.length < 6) {
      setAlert({ message: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    setLoading(true);
    setAlert({ message: "", type: "" });

    try {
      // Step 1 — Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");

      console.log("Auth user created:", authData.user.id);

      // Step 2 — Use service role style upsert with the user's ID directly
      // We use upsert so it works whether the row exists or not
      const profileData = {
        id: authData.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        postal_code: form.postal_code,
        address: form.address,
        user_type: form.user_type,
      };

      console.log("Inserting profile:", profileData);

      const { error: profileError } = await supabase
        .from("users")
        .upsert([profileData], { onConflict: "id" });

      if (profileError) {
        console.error("Profile error:", profileError);
        // Don't throw — auth worked, profile can be retried
        setAlert({ message: `Account created but profile save failed: ${profileError.message}`, type: "error" });
        setLoading(false);
        return;
      }

      console.log("Profile saved successfully!");

      // Step 3 — Set user and navigate
      onLogin?.({ ...authData.user, ...form });
      setAlert({ message: "Account created successfully!", type: "success" });

      setTimeout(() => {
        navigate(form.user_type === "owner" ? "/dashboard" : "/rooms");
      }, 1000);

    } catch (err) {
      console.error("Signup error:", err);
      setAlert({ message: err.message || "Sign up failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAlert({ message: error.message, type: "error" });
  };

  return (
    <AuthCard>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "white" }}>K</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--secondary)", marginBottom: 4 }}>Create your account</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Join Kanelijo — it's free</p>
      </div>

      <Alert message={alert.message} type={alert.type} />

      <GoogleButton label="Continue with Google" onClick={handleGoogleSignUp} loading={false} />
      <Divider />

      <Input label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Mohan Singh" required />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
      <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" required />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="City" value={form.city} onChange={set("city")} placeholder="Sehore" />
        <Input label="Postal Code" value={form.postal_code} onChange={set("postal_code")} placeholder="466001" />
      </div>

      <Input label="Address" value={form.address} onChange={set("address")} placeholder="Street / Area / Landmark" />
      <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" required />

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>I am a <span style={{ color: "var(--danger)" }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ v: "seeker", l: "🔍 Room Seeker", d: "Looking for a room" }, { v: "owner", l: "🏠 Room Owner", d: "I have rooms to list" }].map((r) => (
            <div key={r.v} onClick={() => setForm((p) => ({ ...p, user_type: r.v }))}
              style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${form.user_type === r.v ? "var(--primary)" : "var(--border)"}`, background: form.user_type === r.v ? "var(--primary-light)" : "var(--white)", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: form.user_type === r.v ? "var(--primary)" : "var(--secondary)" }}>{r.l}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{r.d}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSignUp} disabled={loading}
        style={{ width: "100%", padding: "13px", background: loading ? "#93B4F0" : "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-btn)", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16 }}>
        {loading ? "Creating account..." : "Create Account →"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>
    </AuthCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [form, setForm] = useState({ email: "", password: "" });
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setAlert({ message: "Please enter your email and password.", type: "error" });
      return;
    }

    setLoading(true);
    setAlert({ message: "", type: "" });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      // Fetch full profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const userData = profile || data.user;
      onLogin?.(userData);
      navigate(userData.user_type === "owner" ? "/dashboard" : "/rooms");

    } catch (err) {
      setAlert({ message: err.message || "Login failed. Please check your credentials.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAlert({ message: error.message, type: "error" });
  };

  return (
    <AuthCard>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "white" }}>K</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--secondary)", marginBottom: 4 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Sign in to your Kanelijo account</p>
      </div>

      <Alert message={alert.message} type={alert.type} />

      <GoogleButton label="Continue with Google" onClick={handleGoogleLogin} loading={false} />
      <Divider />

      <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
      <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />

      <div style={{ textAlign: "right", marginBottom: 20, marginTop: -6 }}>
        <span style={{ fontSize: 12, color: "var(--primary)", cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
      </div>

      <button onClick={handleLogin} disabled={loading}
        style={{ width: "100%", padding: "13px", background: loading ? "#93B4F0" : "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-btn)", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16 }}>
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
      </p>
    </AuthCard>
  );
}
