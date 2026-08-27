import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createSessionToken,
  buildSessionCookie,
  buildLogoutCookie,
  verifySessionToken,
  getSessionTokenFromRequest,
} from "./middleware/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: check if the current cookie is still valid
  if (req.method === "GET") {
    const token = getSessionTokenFromRequest(req);
    return res.status(200).json({ authenticated: verifySessionToken(token) });
  }

  // DELETE: log out
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", buildLogoutCookie());
    return res.status(200).json({ success: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { passcode } = req.body || {};
    const configuredPasscode = process.env.ADMIN_PASSCODE;

    if (!configuredPasscode) {
      return res
        .status(500)
        .json({ error: "Admin passcode is not configured" });
    }

    if (!passcode) {
      return res.status(400).json({ error: "Passcode is required" });
    }

    if (passcode !== configuredPasscode) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid admin passcode" });
    }

    const token = createSessionToken();
    res.setHeader("Set-Cookie", buildSessionCookie(token));

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      authenticatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
