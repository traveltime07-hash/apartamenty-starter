import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage("❌ Błędne dane logowania");
    else setMessage("✅ Zalogowano pomyślnie!");
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage("❌ Rejestracja nieudana: " + error.message);
    else setMessage("✅ Sprawdź e-mail, aby potwierdzić konto.");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f3f4f6"
    }}>
      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,.1)",
        width: "100%",
        maxWidth: 400
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Logowanie / Rejestracja</h2>
        
        <form>
          <label>Email</label>
          <input
            type="email"
            placeholder="Wpisz email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />

          <label>Hasło</label>
          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 20 }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Zaloguj się
          </button>

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Zarejestruj się
          </button>
        </form>

        {message && <p style={{ marginTop: 16, textAlign: "center" }}>{message}</p>}
      </div>
    </div>
  );
}
