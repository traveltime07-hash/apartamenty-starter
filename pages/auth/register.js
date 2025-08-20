import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("Tworzę konto...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: haslo
    });
    if (error) return setMsg("Błąd: " + error.message);
    setMsg("Konto utworzone. Możesz się zalogować.");
    router.push("/auth/login");
  };

  return (
    <div className="container" style={{maxWidth:520}}>
      <h1>Rejestracja</h1>
      <div className="card">
        <form onSubmit={onSubmit} className="grid">
          <div>
            <label>E-mail</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
          </div>
          <div>
            <label>Hasło</label>
            <input value={haslo} onChange={e=>setHaslo(e.target.value)} type="password" required/>
          </div>
          <button className="btn acc" type="submit">Załóż konto</button>
          <div style={{color:"#9ca3af"}}>{msg}</div>
        </form>
      </div>
      <p style={{marginTop:12}}>
        Masz już konto? <Link href="/auth/login">Zaloguj się</Link>
      </p>
    </div>
  );
}
