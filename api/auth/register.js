import { createAuthRow, getAuthRow, recordEvent, sendJson, setupUri } from "../_lib/db.js";
import { randomBase32Secret } from "../_lib/totp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId } = req.body ?? {};
    if (!deviceId) return sendJson(res, 400, { ok: false, message: "Missing device id." });

    const existing = await getAuthRow();
    if (existing?.device_id && existing.device_id !== deviceId) {
      await recordEvent("blocked-register", deviceId);
      return sendJson(res, 403, { ok: false, locked: true, message: "NiIM is already locked to another device." });
    }

    const auth = existing ?? (await createAuthRow(deviceId, randomBase32Secret()));
    if (!existing) await recordEvent("registered", deviceId);

    return sendJson(res, 200, {
      ok: true,
      secret: auth.secret,
      setupUri: setupUri(auth.secret),
    });
  } catch (error) {
    return sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
