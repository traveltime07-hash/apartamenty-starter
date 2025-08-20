import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Reset() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("Wysyłam link do resetu...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/auth/update-password"
    });
    if (error) return setMsg("Błąd: " + error.message);
    setMsg("Sprawdź e-mail — wysłaliśmy link do zmiany hasła.");
  };

  return (
    <div className="container" style={{maxWidth:520}}>
      <h1>Reset hasła</h1>
      <div className="card">
        <form onSubmit={onSubmit} className="grid">
          <div>
            <label>E-mail</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
          </div>
          <button className="btn acc" type="submit">Wyślij link</button>
          <div style={{color:"#9ca3af"}}>{msg}</div>
        </form>
      </div>
    </div>
  );
}
