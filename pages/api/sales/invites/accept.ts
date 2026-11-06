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
  console.log('here is the token:', token);
  
  const token_hash = createHash('sha256').update(String(token)).digest('hex');

  // ensure only one request can win (atomic opearation)
  const { data: invite, error } = await supabaseAdmin.from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', token_hash)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('id, email, workspace_id')
    .maybeSingle();

  if (!invite || error) return res.status(410).json({ error: error?.message ?? 'invalid or expired request' });

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: invite.email,
    // options: { redirectTo: `${process.env.HUB_URL}/welcome` }, //MEMO: no need here because button action
  });

  if (linkError){
    return res.status(500).json({ error: linkError.message });
  }

  // after generateLink succeeds, update invites tablee with
  await supabaseAdmin.from('invites').update({ accepted_by: link.user.id }).eq('id', invite.id);


  console.log(link.properties.verification_type, link.properties.hashed_token?.slice(0, 8));

  return res.status(201).json({
    tokenHash: link.properties.hashed_token,
    type: link.properties.verification_type,
    inviteId: invite.id
  });
}