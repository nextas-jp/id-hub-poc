import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  //MEMO !!! careful
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  //TODO: add security layer here to check if it's from the sales (API key or check credentials and roles)
  // if (true) {
  //   return res.status(401).json({ error: 'unauthorized access' });
  // }

  const { workspaceId, email } = req.body;
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); //MEMO: 48 hours (check what will it be for real app) 
  
  // add invitation inside DB
  const { error } = await supabaseAdmin.from('invites')
    .insert({ workspace_id: workspaceId, email, token_hash: tokenHash, expires_at: expiresAt });

  if (error) return res.status(500).json({ error: error?.message ?? 'unknown system error' });

  return res.status(201).json({
    inviteUrl: `${process.env.HUB_URL}/invite?t=${token}`
  });
}