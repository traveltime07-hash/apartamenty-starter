// pages/adminv3.js
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/** Prosty wrapper wymagający zalogowania */
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
  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <p>Musisz być zalogowany, aby zobaczyć panel administratora.</p>
          <a href="/auth/login" className="btn acc">Zaloguj się</a>
        </div>
      </div>
    );
  }
  return children(user);
}

export default function AdminV3Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState([]); // {user_id,email,created_at,role,subscription_until}
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase().trim();
    return rows.filter(r =>
      (r.email || "").toLowerCase().includes(s) ||
      (r.role || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const load = async () => {
    setLoading(true);
    setMsg("Sprawdzam uprawnienia...");
    const { data: isAdminFlag, error: flagErr } = await supabase.rpc("is_current_user_admin");
    if (flagErr) {
      setMsg("Błąd: " + flagErr.message);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(!!isAdminFlag);
    if (!isAdminFlag) {
      setMsg("Brak uprawnień administratora.");
      setRows([]);
      setLoading(false);
      return;
    }

    setMsg("Ładuję listę użytkowników...");
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      setMsg("Błąd pobierania: " + error.message);
      setRows([]);
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
    if (error) setMsg("Błąd zapisu: " + error.message);
    else {
      setRows(prev => prev.map(r => r.user_id === userId ? { ...r, subscription_until: newDate || null } : r));
      setMsg("Zapisano.");
    }
  };

  const sendResetEmail = async (email) => {
    setMsg("Wysyłam link do resetu hasła...");
    const redirect = "https://apartamenty-starter.vercel.app/auth/update-password";
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect });
    if (error) setMsg("Błąd: " + error.message);
    else setMsg("Wysłano link resetu hasła.");
  };

  // >>> ZMIANA HASŁA bez maila (endpoint serwerowy)
  const changePassword = async (userId) => {
    const pwd = prompt("Podaj nowe hasło (min. 6 znaków):");
    if (pwd == null) return;
    if (pwd.length < 6) { alert("Hasło musi mieć co najmniej 6 znaków."); return; }

    try {
      setMsg("Ustawiam nowe hasło...");
      const res = await fetch("/api/admin/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_password: pwd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Błąd serwera");
      setMsg("Hasło zmienione.");
    } catch (e) {
      setMsg("Błąd: " + e.message);
    }
  };

  return (
    <RequireAuth>
      {(me) => (
        <div className="container">
          <div className="card" style={{ marginBottom: 8, background:"#0b1327", border:"1px dashed #334155" }}>
            <b>ADMIN V3 (nowa trasa)</b> — jeśli to widzisz, jesteś na świeżej stronie.
          </div>

          <h1>Panel administratora</h1>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12 }}>
              <div><b>Twoje konto:</b><br />{me.email}</div>
              <div><b>Status admina:</b><br />{isAdmin ? "TAK" : "NIE"}</div>
              <div style={{ color:"#9ca3af" }}>{loading ? "Ładowanie..." : (msg || "Gotowe")}</div>
              <div style={{ textAlign:"right" }}>
                <button className="btn" onClick={load}>Odśwież</button>
              </div>
            </div>
          </div>

          {!isAdmin ? (
            <div className="card">
              <p>To konto nie ma uprawnień admina. Dodaj przez SQL:</p>
              <pre style={{ whiteSpace:"pre-wrap" }}>{`insert into public.admins (user_id)
select id from auth.users where email = '${me.email}';`}</pre>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
                  <h3 style={{ margin:0 }}>Użytkownicy</h3>
                  <input
                    placeholder="Szukaj po e-mail / roli"
                    value={q}
                    onChange={e=>setQ(e.target.value)}
                    style={{ padding:8, borderRadius:8, border:"1px solid #334155", minWidth:260 }}
                  />
                </div>
              </div>

              <div className="card">
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Email</th>
                        <th style={th}>Założone</th>
                        <th style={th}>Rola</th>
                        <th style={th}>Subskrypcja do</th>
                        <th style={th}>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.user_id}>
                          <td style={td}>{r.email}</td>
                          <td style={td}>{new Date(r.created_at).toLocaleString("pl-PL")}</td>
                          <td style={td}><span className="badge">{r.role || "user"}</span></td>
                          <td style={td}>
                            <input
                              type="date"
                              value={r.subscription_until || ""}
                              onChange={(e) => {
                                const val = e.target.value || null;
                                setRows(prev => prev.map(x => x.user_id === r.user_id ? { ...x, subscription_until: val } : x));
                              }}
                            />
                          </td>
                          <td style={{ ...td }}>
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                              <button className="btn acc" onClick={() => updateSubscription(r.user_id, r.subscription_until)}>Zapisz</button>
                              <button className="btn" onClick={() => sendResetEmail(r.email)}>Reset hasła</button>
                              <button className="btn" onClick={() => changePassword(r.user_id)}>Zmień hasło</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && !loading && (
                        <tr><td colSpan={5} style={{ padding:12, color:"#9ca3af" }}>Brak wyników.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </RequireAuth>
  );
}

const th = { textAlign:"left", borderBottom:"1px solid #334155", padding:8 };
const td = { borderBottom:"1px solid #1f2937", padding:8 };
