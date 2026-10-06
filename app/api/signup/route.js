import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function badRequest(message) {
  return Response.json({ error: message }, { status: 400 });
}

function serverError(message) {
  return Response.json({ error: message }, { status: 500 });
}

export async function POST(request) {
  if (!url || !key) {
    return serverError("Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { email, password } = body ?? {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return badRequest("A valid email is required.");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return badRequest("Password must be at least 6 characters.");
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const message = error.message ?? "Failed to create account.";
    const lower = message.toLowerCase();
    if (lower.includes("already registered") || lower.includes("already exists")) {
      return Response.json({ error: "An account with this email already exists. Try signing in instead." }, { status: 409 });
    }
    if (lower.includes("rate limit")) {
      return Response.json({ error: "Too many attempts. Please wait a moment and try again." }, { status: 429 });
    }
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({ user: data.user }, { status: 201 });
}
