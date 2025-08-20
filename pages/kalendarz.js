import { useEffect, useMemo, useState } from "react";
const LS_KEY = "demo_bookings_v2";
const ROOMS = [
  { id: "room-3", name: "Apartament 3" },
  { id: "room-9", name: "Apartament 9" },
  { id: "room-14", name: "Apartament 14" },
];
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }

export default function PublicCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [store, setStore] = useState({});
  useEffect(() => { try { const raw = localStorage.getItem(LS_KEY); if (raw) setStore(JSON.parse(raw)); } catch {} }, []);
  const days = useMemo(() => Array.from({length:daysInMonth(year,month)},(_,i)=>i+1), [year,month]);
  const busy = (d) => !!store?.[roomId]?.[`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`]?.busy;

  const prevMonth = () => setMonth(m=> (m===0?(setYear(y=>y-1),11):m-1));
  const nextMonth = () => setMonth(m=> (m===11?(setYear(y=>y+1),0):m+1));
  const monthLabel = new Date(year, month, 1).toLocaleString("pl-PL",{month:"long",year:"numeric"});

  return (
    <div className="container">
      <h1>Kalendarz — widok publiczny</h1>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr 1fr" }}>
          <div>
            <label>Wybierz apartament</label>
            <select value={roomId} onChange={(e)=>setRoomId(e.target.value)}>
              {ROOMS.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label>Miesiąc</label>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" onClick={prevMonth}>← Poprzedni</button>
              <button className="btn" onClick={nextMonth}>Następny →</button>
            </div>
          </div>
          <div>
            <label>Aktualny widok</label>
            <div className="badge">{monthLabel}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
          {days.map(d=>(
            <div key={d} style={{
              padding:12, textAlign:"center",
              border:"1px solid #334155", borderRadius:8,
              background: busy(d) ? "#ef4444" : "#10b981", fontWeight:600
            }}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <p style={{ color:"#9ca3af", marginTop:12 }}>Kolory: zielony = wolny, czerwony = zajęty.</p>
    </div>
  );
}
