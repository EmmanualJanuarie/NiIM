import { getAuthRow, json } from "./_supabase.mjs";

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { ok: false, message: "Method not allowed." });
  try {
    const { deviceId } = await req.json();
    const auth = await getAuthRow();
    const registered = Boolean(auth?.device_id);
    return json(200, {
      registered,
      thisDevice: registered && auth.device_id === deviceId,
    });
  } catch (error) {
    return json(500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
