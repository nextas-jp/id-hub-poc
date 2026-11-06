import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  //MEMO !!! careful
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //TODO: add security layer here to check through an APP's API KEY or something similar
  // if (true) {
  //   return res.status(401).json({ error: 'unauthorized access' });
  // }

  const { data } = await supabaseAdmin.from('invites')
    .select('workspace_id, email, used_at, accepted_by')
    .eq('id', req.query.id).maybeSingle();

  if (!data || !data.used_at) {
    return res.status(404).json({ error: 'not found' });
  }

  res.json(data);
}