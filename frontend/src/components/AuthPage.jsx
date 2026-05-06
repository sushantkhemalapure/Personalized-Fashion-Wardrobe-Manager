const { useState: authUseState } = React;
const { motion: authMotion } = window.Motion;

window.AuthPage = function AuthPage({ onAuth }) {
  const [mode, setMode] = authUseState("login");
  const [form, setForm] = authUseState({ name: "", email: "", password: "" });
  const [message, setMessage] = authUseState("");
  const [loading, setLoading] = authUseState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      onAuth(data);
    } catch (error) {
      setMessage("Could not connect to the auth server.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
  };

  return (
    <section className="auth-page">
      <authMotion.div
        className="auth-card glass glow-hover"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="auth-brand">
          <div className="nav-logo">w</div>
          <div>
            <div className="section-label">Personal Wardrobe</div>
            <h1 className="auth-title">{mode === "login" ? "Welcome back" : "Create your closet"}</h1>
          </div>
        </div>

        <div className="auth-tabs" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => switchMode("login")}>Login</button>
          <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => switchMode("signup")}>Sign up</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label>
              <span>Name</span>
              <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" required />
            </label>
          )}

          <label>
            <span>Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" minLength="6" required />
          </label>

          {message && <p className="auth-message">{message}</p>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait" : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </authMotion.div>
    </section>
  );
};
