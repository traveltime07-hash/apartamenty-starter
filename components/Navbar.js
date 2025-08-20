// components/Navbar.js
import Link from "next/link";
import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let unsub;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUser(u);

      if (u) {
        const { data: flag } = await supabase.rpc("is_current_user_admin");
        setIsAdmin(!!flag);
      } else {
        setIsAdmin(false);
      }

      const sub = supabase.auth.onAuthStateChange(async (_, session) => {
        const uu = session?.user || null;
        setUser(uu);
        if (uu) {
          const { data: flag2 } = await supabase.rpc("is_current_user_admin");
          setIsAdmin(!!flag2);
        } else {
          setIsAdmin(false);
        }
      });
      unsub = sub?.data?.subscription?.unsubscribe;
    })();
    return () => unsub?.();
  }, []);

  return (
    <nav style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"12px 20px", background:"#0f172a", borderBottom:"1px solid #1f2937"
    }}>
      <Link href="/" style={{fontWeight:700, fontSize:18, color:"#fff", textDecoration:"none"}}>
        Apartamenty<span style={{color:"#10b981"}}>SaaS</span>
      </Link>
      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        <Link href="/kalendarz" className="btn">Podgląd</Link>
        {user && <Link href="/dashboard" className="btn">Panel</Link>}
        {isAdmin && <Link href="/admin" className="btn">Admin</Link>}
        {!user ? (
          <>
            <Link href="/auth/login" className="btn acc">Zaloguj</Link>
            <Link href="/auth/register" className="btn">Rejestracja</Link>
          </>
        ) : (
          <Link href="/auth/logout" className="btn">Wyloguj</Link>
        )}
      </div>
    </nav>
  );
}
