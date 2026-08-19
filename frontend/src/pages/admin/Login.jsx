import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { isAuthed, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthed) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <p className="kicker text-center mb-2">Staff Entrance</p>
        <h1 className="font-display text-3xl font-bold text-center mb-8">District Chronicle</h1>
        <form onSubmit={submit} className="space-y-4 border border-line bg-paper-raised p-6">
          <div>
            <label className="label" htmlFor="u">Username</label>
            <input id="u" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="p">Password</label>
            <input id="p" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-brick text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Checking credentials..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
