import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { passcode } = req.body || {};
    const configuredPasscode = process.env.ADMIN_PASSCODE;

    if (!passcode) {
      return res.status(400).json({ error: "Passcode is required" });
    }

    if (passcode === configuredPasscode) {
      return res.status(200).json({
        success: true,
        message: "Admin authentication successful",
        authenticatedAt: new Date().toISOString(),
      });
    }

    return res
      .status(401)
      .json({ success: false, error: "Invalid admin passcode" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
