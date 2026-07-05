import { getAuthRow, sendJson } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId } = req.body ?? {};
    const auth = await getAuthRow();
    const registered = Boolean(auth?.device_id);
    return sendJson(res, 200, {
      registered,
      thisDevice: registered && auth.device_id === deviceId,
    });
  } catch (error) {
    return sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
