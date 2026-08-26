import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { action, transactionId, status, userId, userName, passcode } =
    req.body || {};
  const configuredPasscode =
    process.env.ADMIN_PASSCODE ||
    process.env.VITE_ADMIN_PASSCODE ||
    "bunkeradmin";

  if (!passcode || passcode !== configuredPasscode) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: Invalid passcode" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({
      success: true,
      warning: "Processed without Supabase service key",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (action === "update_status" && transactionId && status) {
      const { error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", transactionId);

      if (error) throw error;
      return res
        .status(200)
        .json({ success: true, message: "Transaction status updated" });
    }

    if (action === "delete_transaction" && transactionId) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;
      return res
        .status(200)
        .json({ success: true, message: "Transaction deleted" });
    }

    if (action === "add_user" && userName) {
      const { data, error } = await supabase
        .from("users")
        .insert({ name: userName.trim() })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (action === "delete_user" && userId) {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) throw error;
      return res.status(200).json({ success: true, message: "User deleted" });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
