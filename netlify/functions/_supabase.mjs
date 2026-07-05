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

export async function getAuthRow() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("niim_auth").select("*").eq("id", "main").maybeSingle();
  if (error) throw error;
  return data;
}

export async function createAuthRow(deviceId, secret) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("niim_auth")
    .insert({ id: "main", device_id: deviceId, secret })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") return getAuthRow();
    throw error;
  }
  return data;
}

export async function recordEvent(type, deviceId) {
  const supabase = getSupabase();
  await supabase.from("niim_events").insert({
    type,
    device_id: String(deviceId ?? "").slice(0, 120),
  });
}

export function setupUri(secret) {
  return `otpauth://totp/NiIM:Emmanuel?secret=${secret}&issuer=NiIM&period=30&digits=6`;
}
