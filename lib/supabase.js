import { createClient } from "@supabase/supabase-js";

function createStub() {
  function terminal() {
    return Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
  }

  function stub() {
    return {
      select: stub,
      eq: stub,
      order: terminal,
      insert: stub,
      upsert: terminal,
      delete: stub,
      single: terminal,
    };
  }

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInAnonymously: () =>
        Promise.resolve({ data: { user: null }, error: { message: "Supabase not configured" } }),
    },
    from: stub,
  };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : createStub();
