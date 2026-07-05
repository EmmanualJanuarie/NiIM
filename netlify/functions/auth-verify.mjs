import { getAuthRow, json, recordEvent } from "./_supabase.mjs";
import { verifyTotp } from "./_totp.mjs";

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId, code } = await req.json();
    const auth = await getAuthRow();
    if (!auth?.device_id) return json(409, { ok: false, message: "NiIM has not been registered yet." });

    if (auth.device_id !== deviceId) {
      await recordEvent("blocked-login", deviceId);
      return json(403, { ok: false, locked: true, message: "This app is locked to one device only." });
    }

    if (!verifyTotp(auth.secret, code)) {
      await recordEvent("bad-code", deviceId);
      return json(401, { ok: false, message: "That authenticator code did not match." });
    }

    await recordEvent("login", deviceId);
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
