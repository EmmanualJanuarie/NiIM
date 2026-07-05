import { getAuthRow, recordEvent, sendJson } from "../_lib/db.js";
import { verifyTotp } from "../_lib/totp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId, code } = req.body ?? {};
    const auth = await getAuthRow();
    if (!auth?.device_id) return sendJson(res, 409, { ok: false, message: "NiIM has not been registered yet." });

    if (auth.device_id !== deviceId) {
      await recordEvent("blocked-login", deviceId);
      return sendJson(res, 403, { ok: false, locked: true, message: "This app is locked to one device only." });
    }

    if (!verifyTotp(auth.secret, code)) {
      await recordEvent("bad-code", deviceId);
      return sendJson(res, 401, { ok: false, message: "That authenticator code did not match." });
    }

    await recordEvent("login", deviceId);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
