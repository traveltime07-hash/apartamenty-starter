import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [status, setStatus] = useState('Sprawdzam połączenie z API...');

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setStatus(d.message)).catch(() => setStatus('Błąd API'));
  }, []);

  return (
    <div className="container">
      <h1>Panel</h1>
      <div className="card">
        <p><strong>Status API:</strong> {status}</p>
        <p>Po konfiguracji Supabase będziemy mogli pobierać dane (obiekty, pokoje, rezerwacje).</p>
      </div>
      <div className="card" style={{marginTop:16}}>
        <h3>Przykładowy kalendarz (statyczny podgląd)</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
          {Array.from({length:30}, (_,i)=>i+1).map(d=>(
            <div key={d} style={{padding:8, textAlign:'center', border:'1px solid #334155', borderRadius:8, background: (d%5===0)?'#ef4444':'#10b981'}}>{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
