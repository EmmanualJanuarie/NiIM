import { createClient } from "@supabase/supabase-js";

export function json(status, body) {
  return Response.json(body, { status });
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getUserFromAccessToken(accessToken) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) throw error;
  return data.user;
}

export async function isAuthorizedEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("niim_authorized_users")
    .select("email")
    .eq("email", String(email ?? "").toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function recordEvent(type, deviceId) {
  const supabase = getSupabase();
  await supabase.from("niim_events").insert({
    type,
    device_id: String(deviceId ?? "").slice(0, 120),
  });
}
