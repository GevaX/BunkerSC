import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import {
  verifySessionToken,
  getSessionTokenFromRequest,
} from "./middleware/session.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = getSessionTokenFromRequest(req);
  if (!verifySessionToken(token)) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  const {
    action,
    transactionId,
    status,
    awardedPoints,
    userId,
    userName,
    userProgram,
  } = req.body || {};

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      success: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is not set.",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (action === "fetch_transactions") {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, recipient_id, sender, points, awarded_points, reason, status, created_at, users(name, program)",
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching transactions from Supabase:", error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (data || []).map((row: any) => ({
        id: row.id,
        recipient_id: row.recipient_id,
        sender: row.sender,
        points: row.points,
        awarded_points: row.awarded_points,
        reason: row.reason,
        status: row.status,
        created_at: row.created_at,
        recipient_name: row.users?.name || "Unknown",
        recipient_program: row.users?.program || "Unknown",
      }));

      return res.status(200).json({ success: true, data: transactions });
    }

    if (action === "update_status" && transactionId && status) {
      if (
        status === "approved" &&
        (!Number.isInteger(awardedPoints) || awardedPoints === null)
      ) {
        return res.status(400).json({
          success: false,
          error: "A valid awarded point amount is required for approval.",
        });
      }

      const update =
        status === "approved"
          ? { status, awarded_points: awardedPoints }
          : { status };
      const { error } = await supabase
        .from("transactions")
        .update(update)
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
      const program = userProgram ?? "FLL";
      const { data, error } = await supabase
        .from("users")
        .insert({ name: userName.trim(), program })
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
