import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function UpdatePassword() {
  const [haslo, setHaslo] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Supabase po linku z maila ustawia session z tokenem
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setMsg("Brak sesji resetu. Otwórz link z e-maila jeszcze raz.");
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("Aktualizuję hasło...");
    const { error } = await supabase.auth.updateUser({ password: haslo });
    if (error) return setMsg("Błąd: " + error.message);
    setMsg("Hasło zmienione. Przekierowanie do logowania...");
    setTimeout(()=>router.push("/auth/login"), 1200);
  };

  return (
    <div className="container" style={{maxWidth:520}}>
      <h1>Ustaw nowe hasło</h1>
      <div className="card">
        <form onSubmit={onSubmit} className="grid">
          <div>
            <label>Nowe hasło</label>
            <input value={haslo} onChange={e=>setHaslo(e.target.value)} type="password" required/>
          </div>
          <button className="btn acc" type="submit">Zapisz</button>
          <div style={{color:"#9ca3af"}}>{msg}</div>
        </form>
      </div>
    </div>
  );
}
