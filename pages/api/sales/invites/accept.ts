import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  //MEMO !!! careful
  { auth: { autoRefreshToken: false, persistSession: false } }
);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const token = req.body.t;
  const token_hash = createHash('sha256').update(String(token)).digest('base64');

  // only one request win
  const { data: invite } = await supabaseAdmin.from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', token_hash)
    .select('email')
    .maybeSingle();

  if (!invite) return res.status(410).json({ error: 'invalid request' });

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: invite.email,
    // options: { redirectTo: `${process.env.HUB_URL}/welcome` }, // no need here because button action
  });

  if (linkError){
    return res.status(500).json({ error: linkError.message });
  }

  return res.status(201).json({
    tokenHash: link.properties.hashed_token 
  });
}