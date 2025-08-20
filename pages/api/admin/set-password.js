// pages/api/admin/set-password.js
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/set-password
 * Body: { user_id: string, new_password: string }
 * Auth: Authorization: Bearer <admin_access_token>
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id, new_password } = req.body || {};
    if (!user_id || !new_password) {
      return res.status(400).json({ error: "Missing user_id or new_password" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: "Hasło musi mieć min. 6 znaków" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return res.status(500).json({ error: "Brak konfiguracji Supabase na serwerze" });
    }

    // 1) Zweryfikuj, że żądanie wysyła ADMIN (na podstawie jego sesji)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Brak tokenu" });
    }

    // Klient „user” z przypiętym tokenem do sprawdzenia uprawnień
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: isAdmin, error: adminErr } = await supabaseUser.rpc("is_current_user_admin");
    if (adminErr) {
      return res.status(401).json({ error: "Błąd weryfikacji admina" });
    }
    if (!isAdmin) {
      return res.status(403).json({ error: "Brak uprawnień administratora" });
    }

    // 2) Właściwa zmiana hasła (klient serwisowy)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password,
    });
    if (updErr) {
      return res.status(400).json({ error: updErr.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
