import { createAuthRow, getAuthRow, json, recordEvent, setupUri } from "./_supabase.mjs";
import { randomBase32Secret } from "./_totp.mjs";

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId } = await req.json();
    if (!deviceId) return json(400, { ok: false, message: "Missing device id." });

    const existing = await getAuthRow();
    if (existing?.device_id && existing.device_id !== deviceId) {
      await recordEvent("blocked-register", deviceId);
      return json(403, { ok: false, locked: true, message: "NiIM is already locked to another device." });
    }

    const auth = existing ?? (await createAuthRow(deviceId, randomBase32Secret()));
    if (!existing) await recordEvent("registered", deviceId);

    return json(200, {
      ok: true,
      secret: auth.secret,
      setupUri: setupUri(auth.secret),
    });
  } catch (error) {
    return json(500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
