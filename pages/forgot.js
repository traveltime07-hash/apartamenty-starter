// pages/auth/forgot.js
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("Wysyłam link resetu…");

    // ZAWSZE kierujemy na produkcję (Vercel)
    const redirect = "https://apartamenty-starter.vercel.app/auth/update-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirect,
    });
    if (error) setMsg("❌ " + error.message);
    else setMsg("✅ Sprawdź skrzynkę – wysłałem link do zmiany hasła.");

    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1>Reset hasła</h1>
      <div className="card">
        <form onSubmit={handleSend} className="grid" style={{ gap: 10 }}>
          <div>
            <label>E-mail konta</label>
            <input
              type="email"
              placeholder="twoj@mail.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button className="btn acc" type="submit" disabled={loading}>
            {loading ? "Pracuję…" : "Wyślij link resetu"}
          </button>
          {msg && (
            <div
              style={{
                marginTop: 6,
                color: msg.startsWith("❌") ? "#ef4444" : "#10b981",
              }}
            >
              {msg}
            </div>
          )}
        </form>
      </div>
      <p style={{ marginTop: 12 }}>
        <Link href="/auth/login">← Wróć do logowania</Link>
      </p>
    </div>
  );
}
