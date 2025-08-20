// pages/api/admin/set-password.js
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/set-password
 * Body: { user_id: string, new_password: string }
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
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return res.status(500).json({ error: "Brak konfiguracji Supabase na serwerze" });
    }

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
