import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);


// // MEMO: Doing like that will get us "automatic" in "how_session_was_created", however a "manual result" isn't a flaw in itself when using supabase/ssr which use PKCE and cookies
// import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//   {
//     auth: {
//       flowType: 'implicit',
//       detectSessionInUrl: true,
//     },
//   }
// );






