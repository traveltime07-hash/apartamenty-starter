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

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
      return res.status(500).json({ error: "Brak konfiguracji Supabase na serwerze" });
    }

    // 1) Weryfikacja, że żądający to ADMIN — na podstawie jego access_token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Brak tokenu (Authorization: Bearer ...)" });

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: isAdmin, error: adminErr } = await userClient.rpc("is_current_user_admin");
    if (adminErr) return res.status(401).json({ error: "Błąd weryfikacji admina" });
    if (!isAdmin) return res.status(403).json({ error: "Brak uprawnień administratora" });

    // 2) Zmiana hasła konta docelowego przez klienta z service role
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error: updErr } = await adminClient.auth.admin.updateUserById(user_id, {
      password: new_password,
    });
    if (updErr) return res.status(400).json({ error: updErr.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
