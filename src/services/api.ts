/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, isSupabaseConfigured } from "./supabase";
import type {
  User,
  Transaction,
  LeaderboardEntry,
  SubmitPointInput,
} from "../types";

// ==========================================
// SUPABASE READ METHODS (public, unauthenticated)
// ==========================================

export async function fetchUsers(): Promise<User[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching users from Supabase:", error);
    return [];
  }
  return data || [];
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, recipient_id, sender, points, reason, status, created_at, users(name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions from Supabase:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    recipient_id: row.recipient_id,
    sender: row.sender,
    points: row.points,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at,
    recipient_name: row.users?.name || "Unknown",
  }));
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const [users, transactions] = await Promise.all([
    fetchUsers(),
    fetchTransactions(),
  ]);

  const scoreMap = new Map<string, number>();

  users.forEach((u) => {
    scoreMap.set(u.id, 0);
  });

  transactions.forEach((tx) => {
    if (tx.status === "approved") {
      const currentScore = scoreMap.get(tx.recipient_id) || 0;
      scoreMap.set(tx.recipient_id, currentScore + Number(tx.points));
    }
  });

  const entries: LeaderboardEntry[] = users.map((u) => {
    const score = scoreMap.get(u.id) || 0;
    return {
      id: u.id,
      name: u.name,
      score,
      rank: 0,
    };
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  entries.forEach((item, index) => {
    item.rank = index + 1;
  });

  return entries;
}

export async function submitPointRequest(
  input: SubmitPointInput,
): Promise<Transaction> {
  const points = Math.round(Number(input.points));
  if (isNaN(points)) {
    throw new Error("Point value must be a valid integer");
  }
  if (!input.reason.trim()) {
    throw new Error("Reason is mandatory for social credit evaluation");
  }

  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      "Supabase is not configured. Please configure your environment variables.",
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      recipient_id: input.recipient_id,
      sender: input.sender.trim(),
      points,
      reason: input.reason.trim(),
      status: "pending",
    })
    .select("id, recipient_id, sender, points, reason, status, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to submit request: ${error.message}`);
  }
  return data;
}

// ==========================================
// ADMIN MUTATIONS (require an authenticated admin session cookie)
// ==========================================

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function callAdminAction(body: Record<string, unknown>): Promise<any> {
  const res = await fetch("/api/admin-action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send the admin session cookie
    body: JSON.stringify(body),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error || `Admin action failed (${res.status})`,
      res.status,
    );
  }

  return data;
}

export async function updateTransactionStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  await callAdminAction({
    action: "update_status",
    transactionId: id,
    status,
  });
}

export async function batchUpdateTransactionStatus(
  ids: string[],
  status: "approved" | "rejected",
): Promise<void> {
  for (const id of ids) {
    await updateTransactionStatus(id, status);
  }
}

export async function addUser(name: string): Promise<User> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Name cannot be empty");

  const data = await callAdminAction({
    action: "add_user",
    userName: cleanName,
  });
  return data.data as User;
}

export async function deleteUser(id: string): Promise<void> {
  await callAdminAction({
    action: "delete_user",
    userId: id,
  });
}
