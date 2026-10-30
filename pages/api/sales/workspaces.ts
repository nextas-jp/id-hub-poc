import type NextApiRequest from 'next';
import type NextApiResponse from 'next';
import { createClient } from '@supabase/supabase-js';

// T_01_1 TEST

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  //MEMO !!! careful
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  // TODO: Add protection layer to check logged-in sales staff and their role...
  // if (true) {
  //   return res.status(401).json({ error: 'unauthorized access' });
  // }

  // params validation
  const workspaceName = String(req.body?.workspaceName ?? '').trim();
  const ownerEmail = String(req.body?.ownerEmail ?? '').trim().toLowerCase();

  if (!workspaceName || !ownerEmail) {
    return res.status(400).json({ error: 'workspaceName and ownerEmail are required' });
  }

  // Magic link generation
  // MEMO: If the email doesn't exist yet in the auth.users table, this directly add the user
  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: ownerEmail,
    options: { redirectTo: `${process.env.HUB_URL}/welcome` },
  });

  if (linkError || !link) {
    return res.status(500).json({ error: linkError?.message ?? 'unknown system error' });
  }

  // Workspace registration
  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from('workspaces')
    .insert({
      name: workspaceName,
      owner_email: ownerEmail,
      owner_user_id: link.user?.id ?? null,
    })
    .select()
    .single();

  if (workspaceError) {
    return res.status(500).json({ error: workspaceError?.message ?? 'unknown system error' });
  }

  return res.status(201).json({
    workspaceId: workspace.id,
    loginUrl: link.properties.action_link
  });
}