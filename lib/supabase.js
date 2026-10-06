import { createClient } from "@supabase/supabase-js";

function createStub() {
  function terminal(message) {
    return Promise.resolve({ data: null, error: { message: message ?? "Supabase not configured" } });
  }

  function stub() {
    return {
      select: stub,
      eq: stub,
      order: () => terminal(),
      insert: () => terminal(),
      upsert: () => terminal(),
      delete: () => terminal(),
      single: () => terminal(),
    };
  }

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInAnonymously: () => terminal("Supabase not configured"),
      signInWithPassword: ({ email }) =>
        terminal(`Supabase not configured (${email ?? ""}). Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.`),
      signUp: ({ email }) =>
        terminal(`Supabase not configured (${email ?? ""}). Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.`),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: stub,
  };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : createStub();
