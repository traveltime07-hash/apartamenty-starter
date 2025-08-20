import Link from "next/link";
import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <nav style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"12px 20px", background:"#0f172a", borderBottom:"1px solid #1f2937"
    }}>
      <Link href="/" style={{fontWeight:700, fontSize:18, color:"#fff", textDecoration:"none"}}>
        Apartamenty<span style={{color:"#10b981"}}>SaaS</span>
      </Link>
      <div style={{display:"flex", gap:12}}>
        <Link href="/kalendarz" className="btn">Podgląd</Link>
        {user ? (
          <>
            <Link href="/dashboard" className="btn">Panel</Link>
            <Link href="/auth/logout" className="btn">Wyloguj</Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn acc">Zaloguj</Link>
            <Link href="/auth/register" className="btn">Rejestracja</Link>
          </>
        )}
      </div>
    </nav>
  );
}
