// pages/dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Pokoje (na razie statycznie — później pobierzemy z bazy)
const ROOMS = [
  { id: "room-3", name: "Apartament 3" },
  { id: "room-9", name: "Apartament 9" },
  { id: "room-14", name: "Apartament 14" },
];

// ===== Helpers =====
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function ymd(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}
function monthRange(y, m) {
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const toKey = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
  return { start: toKey(start), end: toKey(end) };
}

/**
 * =========================
 *   PANEL (bez eksportu)
 * =========================
 */
function Dashboard({ user }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [roomId, setRoomId] = useState(ROOMS[0].id);

  // store: { [roomId]: { 'YYYY-MM-DD': { busy:boolean, data:object } } }
  const [store, setStore] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({
    nazwisko: "",
    telefon: "",
    kwota: "",
    zaliczka: "",
    doplata: "",
    uwagi: "",
  });

  const days = useMemo(() => {
    const n = daysInMonth(year, month);
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [year, month]);

  // ====== Load month from Supabase ======
  const loadMonth = async () => {
    if (!user) return;
    setLoading(true);
    setMsg("Ładuję dane z bazy...");
    const { start, end } = monthRange(year, month);

    const { data, error } = await supabase
      .from("bookings_demo")
      .select("room_id,date,busy,data")
      .eq("user_id", user.id)
      .eq("room_id", roomId)
      .gte("date", start)
      .lte("date", end);

    if (error) {
      setMsg("Błąd ładowania: " + error.message);
      setLoading(false);
      return;
    }

    setStore((prev) => {
      const copy = { ...prev };
      copy[roomId] = copy[roomId] ? { ...copy[roomId] } : {};
      // wyczyść zakres: nadpiszemy tym co przyszło (puste dni pozostaną undefined => wolne)
      const max = daysInMonth(year, month);
      for (let d = 1; d <= max; d++) {
        const k = ymd(year, month, d);
        if (!copy[roomId][k]) copy[roomId][k] = { busy: false, data: {} };
      }
      data.forEach((row) => {
        const k = row.date; // 'YYYY-MM-DD'
        copy[roomId][k] = {
          busy: !!row.busy,
          data: row.data || {},
        };
      });
      return copy;
    });

    setMsg("");
    setLoading(false);
  };

  useEffect(() => {
    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roomId, year, month]);

  // ===== Helpers for day state =====
  const getDayObj = (d) => {
    const k = ymd(year, month, d);
    return store?.[roomId]?.[k] || { busy: false, data: {} };
  };
  const setDayObj = (d, val) => {
    const k = ymd(year, month, d);
    setStore((prev) => {
      const copy = { ...prev };
      copy[roomId] = copy[roomId] ? { ...copy[roomId] } : {};
      copy[roomId][k] = val;
      return copy;
    });
  };

  // ===== Toggle busy (upsert/delete) =====
  const toggleBusy = async (d) => {
    if (!user) return;
    const k = ymd(year, month, d);
    const cur = getDayObj(d);
    const nextBusy = !cur.busy;

    // Optymistycznie
    setDayObj(d, { ...cur, busy: nextBusy });
    setMsg("Zapisuję...");

    // Jeżeli odznaczamy i brak danych — usuń wiersz
    if (!nextBusy && (!cur.data || Object.keys(cur.data).length === 0)) {
      const { error } = await supabase
        .from("bookings_demo")
        .delete()
        .eq("user_id", user.id)
        .eq("room_id", roomId)
        .eq("date", k);
      if (error) setMsg("Błąd zapisu: " + error.message);
      else setMsg("");
      return;
    }

    const { error } = await supabase.from("bookings_demo").upsert(
      {
        user_id: user.id,
        room_id: roomId,
        date: k,
        busy: nextBusy,
        data: cur.data || {},
      },
      { onConflict: "user_id,room_id,date" }
    );
    if (error) setMsg("Błąd zapisu: " + error.message);
    else setMsg("");
  };

  // ===== Form open/save/clear/free =====
  const openForm = (d) => {
    const cur = getDayObj(d);
    setSelectedDay(d);
    setForm({
      nazwisko: cur.data?.nazwisko || "",
      telefon: cur.data?.telefon || "",
      kwota: cur.data?.kwota || "",
      zaliczka: cur.data?.zaliczka || "",
      doplata: cur.data?.doplata || "",
      uwagi: cur.data?.uwagi || "",
    });
  };

  const saveForm = async () => {
    if (selectedDay == null || !user) return;
    const k = ymd(year, month, selectedDay);
    const next = { busy: true, data: { ...form } };

    setDayObj(selectedDay, next); // optymistycznie
    setSelectedDay(null);
    setMsg("Zapisuję...");

    const { error } = await supabase.from("bookings_demo").upsert(
      {
        user_id: user.id,
        room_id: roomId,
        date: k,
        busy: true,
        data: { ...form },
      },
      { onConflict: "user_id,room_id,date" }
    );
    if (error) setMsg("Błąd zapisu: " + error.message);
    else setMsg("");
  };

  const clearFormDay = async () => {
    if (selectedDay == null || !user) return;
    const k = ymd(year, month, selectedDay);
    const cur = getDayObj(selectedDay);
    const next = { ...cur, data: {} };

    setDayObj(selectedDay, next);
    setSelectedDay(null);
    setMsg("Zapisuję...");

    // Jeśli dzień nie jest zajęty -> usuń wiersz
    if (!cur.busy) {
      const { error } = await supabase
        .from("bookings_demo")
        .delete()
        .eq("user_id", user.id)
        .eq("room_id", roomId)
        .eq("date", k);
      if (error) setMsg("Błąd zapisu: " + error.message);
      else setMsg("");
      return;
    }

    const { error } = await supabase.from("bookings_demo").upsert(
      {
        user_id: user.id,
        room_id: roomId,
        date: k,
        busy: true,
        data: {},
      },
      { onConflict: "user_id,room_id,date" }
    );
    if (error) setMsg("Błąd zapisu: " + error.message);
    else setMsg("");
  };

  const freeDay = async () => {
    if (selectedDay == null || !user) return;
    const k = ymd(year, month, selectedDay);

    setDayObj(selectedDay, { busy: false, data: {} });
    setSelectedDay(null);
    setMsg("Zapisuję...");

    const { error } = await supabase
      .from("bookings_demo")
      .delete()
      .eq("user_id", user.id)
      .eq("room_id", roomId)
      .eq("date", k);

    if (error) setMsg("Błąd zapisu: " + error.message);
    else setMsg("");
  };

  // ===== Month nav =====
  const prevMonth = () => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };
  const nextMonth = () => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const monthLabel = new Date(year, month, 1).toLocaleString("pl-PL", {
    month: "long",
    year: "numeric",
  });

  // ===== CSV export =====
  const exportCSV = () => {
    const rows = [["pokoj","data","nazwisko","telefon","kwota","zaliczka","dopłata","uwagi","status"]];
    const map = store?.[roomId] || {};
    Object.entries(map).forEach(([dateKey, val]) => {
      if (val.busy) {
        rows.push([
          ROOMS.find(r=>r.id===roomId)?.name || roomId,
          dateKey,
          val.data?.nazwisko || "",
          val.data?.telefon || "",
          val.data?.kwota || "",
          val.data?.zaliczka || "",
          val.data?.doplata || "",
          (val.data?.uwagi || "").replace(/\n/g," "),
          "zajęty",
        ]);
      }
    });
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rezerwacje_${roomId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>Panel</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <p>
          <strong>Status:</strong>{" "}
          {loading ? "Ładowanie z bazy..." : (msg || "Połączono z bazą")}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <span className="badge"><span className="kolor k-zielony"></span>wolny</span>
          <span className="badge"><span className="kolor k-czerwony"></span>zajęty</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr auto" }}>
          <div>
            <label>Wybierz apartament</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Miesiąc</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={prevMonth}>← Poprzedni</button>
              <button className="btn" onClick={nextMonth}>Następny →</button>
            </div>
          </div>
          <div>
            <label>Aktualny widok</label>
            <div className="badge">{monthLabel}</div>
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="btn acc" onClick={exportCSV}>Eksport CSV</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Kalendarz</h3>
        <p style={{color:"#9ca3af"}}>Kliknij dzień, aby przełączyć wolny/zajęty. Kliknij „✎”, aby dodać dane klienta.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {days.map((d) => {
            const obj = getDayObj(d);
            const busy = obj.busy;
            return (
              <div key={d} style={{ display:"flex", gap:6 }}>
                <button
                  onClick={() => toggleBusy(d)}
                  style={{
                    padding: 12,
                    textAlign: "center",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    background: busy ? "#ef4444" : "#10b981",
                    cursor: "pointer",
                    fontWeight: 600,
                    width: "100%"
                  }}
                  title={busy ? "Zajęty — kliknij, by zwolnić" : "Wolny — kliknij, by zająć"}
                >
                  {d}
                </button>
                <button className="btn" onClick={() => openForm(d)} title="Edytuj dane">✎</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal — dane rezerwacji */}
      {selectedDay != null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div className="card" style={{ maxWidth: 520, width: "100%" }}>
            <h3>Dzień {ymd(year, month, selectedDay)} — {ROOMS.find(r=>r.id===roomId)?.name}</h3>
            <div className="grid" style={{ gap: 10 }}>
              <div>
                <label>Nazwisko</label>
                <input value={form.nazwisko} onChange={e=>setForm(f=>({...f,nazwisko:e.target.value}))}/>
              </div>
              <div>
                <label>Telefon</label>
                <input value={form.telefon} onChange={e=>setForm(f=>({...f,telefon:e.target.value}))}/>
              </div>
              <div>
                <label>Kwota rezerwacji</label>
                <input value={form.kwota} onChange={e=>setForm(f=>({...f,kwota:e.target.value}))}/>
              </div>
              <div>
                <label>Kwota zaliczki</label>
                <input value={form.zaliczka} onChange={e=>setForm(f=>({...f,zaliczka:e.target.value}))}/>
              </div>
              <div>
                <label>Termin dopłaty</label>
                <input placeholder="YYYY-MM-DD" value={form.doplata} onChange={e=>setForm(f=>({...f,doplata:e.target.value}))}/>
              </div>
              <div>
                <label>Uwagi / prośby</label>
                <textarea rows={4} value={form.uwagi} onChange={e=>setForm(f=>({...f,uwagi:e.target.value}))}/>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
              <button className="btn" onClick={()=>setSelectedDay(null)}>Anuluj</button>
              <button className="btn" onClick={clearFormDay}>Wyczyść dane</button>
              <button className="btn" onClick={freeDay}>Oznacz jako WOLNY</button>
              <button className="btn acc" onClick={saveForm}>Zapisz (zajęty)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * =========================
 *   WRAPPER (wymaga loginu)
 * =========================
 */
export default function DashboardWrapper() {
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

  if (!ready) {
    return (
      <div className="container">
        <div className="card">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <p>Musisz być zalogowany, aby zobaczyć panel.</p>
          <a className="btn acc" href="/auth/login">Przejdź do logowania</a>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} />;
}
