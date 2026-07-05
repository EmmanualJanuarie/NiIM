import { getUserFromAccessToken, isAuthorizedEmail, json, recordEvent } from "./_supabase.mjs";

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { ok: false, message: "Method not allowed." });
  try {
    const { accessToken } = await req.json();
    if (!accessToken) return json(400, { ok: false, message: "Missing Supabase access token." });

    const user = await getUserFromAccessToken(accessToken);
    const email = user?.email?.toLowerCase();
    if (!email) return json(401, { ok: false, message: "Supabase user does not have an email." });

    const authorized = await isAuthorizedEmail(email);
    if (!authorized) {
      await recordEvent("blocked-email-login", email);
      return json(403, { ok: false, message: "This email is not authorized for NiIM." });
    }

    await recordEvent("email-login", email);
    return json(200, { ok: true, email });
  } catch (error) {
    return json(500, { ok: false, message: error instanceof Error ? error.message : "Server error." });
  }
}
