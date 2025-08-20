import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("Logowanie...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: haslo
    });
    if (error) return setMsg("Błąd: " + error.message);
    setMsg("Zalogowano. Przekierowanie...");
    router.push("/dashboard");
  };

  return (
    <div className="container" style={{maxWidth:520}}>
      <h1>Logowanie</h1>
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
          <button className="btn acc" type="submit">Zaloguj</button>
          <div style={{color:"#9ca3af"}}>{msg}</div>
        </form>
      </div>
      <p style={{marginTop:12}}>
        Nie masz konta? <Link href="/auth/register">Zarejestruj się</Link><br/>
        Zapomniałeś hasła? <Link href="/auth/reset">Zresetuj hasło</Link>
      </p>
    </div>
  );
}
