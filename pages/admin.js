// pages/admin.js
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function RequireAuth({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  if (!ready) return <div className="container"><div className="card">Ładowanie...</div></div>;
  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Musisz być zalogowany, aby zobaczyć panel administratora.</p>
        <a className="btn acc" href="/auth/login">Zaloguj się</a>
      </div>
    </div>
  );

  return children(user);
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // {user_id,email,created_at,role,subscription_until}
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("Sprawdzam uprawnienia...");
    // 1) sprawdź, czy bieżący user jest adminem
    const { data: adminFlag, error: errFlag } = await supabase.rpc("is_current_user_admin");
    if (errFlag) {
      setMsg("Błąd: " + errFlag.message);
      setLoading(false);
      return;
    }
    setIsAdmin(!!adminFlag);

    if (!adminFlag) {
      setMsg("Brak uprawnień administratora.");
      setRows([]);
      setLoading(false);
      return;
    }

    setMsg("Ładuję listę użytkowników...");
    // 2) pobierz listę użytkowników (email z auth.users przez SECURITY DEFINER)
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      setMsg("Błąd pobierania: " + error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setMsg("");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateSubscription = async (userId, newDate) => {
    setMsg("Zapisuję subskrypcję...");
    const { error } = await supabase.rpc("admin_update_subscription", {
      target_user: userId,
      until: newDate || null,
    });
    if (error) {
      setMsg("Błąd zapisu: " + error.message);
    } else {
      setMsg("Zapisano.");
      // odśwież wiersz lokalnie
      setRows((prev) => prev.map(r => r.user_id === userId ? { ...r, subscription_until: newDate || null } : r));
    }
  };

  const sendResetEmail = async (email) => {
    setMsg("Wysyłam link do resetu hasła...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/auth/update-password"
    });
    if (error) setMsg("Błąd: " + error.message);
    else setMsg("Wysłano link resetu hasła.");
  };

  return (
    <RequireAuth>
      {(user) => (
        <div className="container">
          <h1>Panel administratora</h1>

          <div className="card" style={{ marginBottom: 16 }}>
            <p><b>Twoje konto:</b> {user.email}</p>
            <p><b>Status admina:</b> {isAdmin ? "TAK" : "NIE"}</p>
            <div style={{ color: "#9ca3af" }}>{loading ? "Ładowanie..." : (msg || "Gotowe")}</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={load}>Odśwież</button>
              <a className="btn" href="/dashboard" style={{ marginLeft: 8 }}>⟵ Wróć do panelu</a>
            </div>
          </div>

          {!isAdmin ? (
            <div className="card">
              <p>To nie jest konto administratora. Aby nadać uprawnienia, uruchom w SQL:</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>
{`insert into public.admins (user_id)
select id from auth.users where email = '${user.email}';`}
              </pre>
            </div>
          ) : (
            <div className="card">
              <h3>Użytkownicy</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ borderBottom: "1px solid #334155", padding: 8 }}>Email</th>
                      <th style={{ borderBottom: "1px solid #334155", padding: 8 }}>Założone</th>
                      <th style={{ borderBottom: "1px solid #334155", padding: 8 }}>Rola</th>
                      <th style={{ borderBottom: "1px solid #334155", padding: 8 }}>Subskrypcja do</th>
                      <th style={{ borderBottom: "1px solid #334155", padding: 8 }}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.user_id}>
                        <td style={{ borderBottom: "1px solid #1f2937", padding: 8 }}>{r.email}</td>
                        <td style={{ borderBottom: "1px solid #1f2937", padding: 8 }}>
                          {new Date(r.created_at).toLocaleString("pl-PL")}
                        </td>
                        <td style={{ borderBottom: "1px solid #1f2937", padding: 8 }}>
                          <span className="badge">{r.role || "user"}</span>
                        </td>
                        <td style={{ borderBottom: "1px solid #1f2937", padding: 8 }}>
                          <input
                            type="date"
                            value={r.subscription_until || ""}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              setRows(prev => prev.map(x => x.user_id === r.user_id ? { ...x, subscription_until: val } : x));
                            }}
                          />
                        </td>
                        <td style={{ borderBottom: "1px solid #1f2937", padding: 8, display:"flex", gap:8 }}>
                          <button className="btn acc" onClick={() => updateSubscription(r.user_id, r.subscription_until)}>
                            Zapisz
                          </button>
                          <button className="btn" onClick={() => sendResetEmail(r.email)}>
                            Wyślij reset hasła
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && !loading && (
                      <tr><td colSpan={5} style={{ padding: 12, color: "#9ca3af" }}>Brak użytkowników.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </RequireAuth>
  );
}
