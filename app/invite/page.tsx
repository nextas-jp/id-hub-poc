'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { supabase } from '@/lib/supabase';

function InviteInner() {
  const router = useRouter();
  const token = useSearchParams()?.get('t'); //MEMO: we'll use Suspense too to prevent a failure if issue with params
  // const [workspaceName, setWorkspaceName] = useState<any>('');

  console.log(token);
  
  async function submit() {
    const response = await fetch('/api/sales/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: token }),
    });

    console.log(response);
    
    if (!response.ok) {
      alert('This invite is invalid or expired.');
      return;
    }
  
    const { tokenHash, inviteId } = await response.json();

    console.log('tokenHash:', tokenHash);
    
    const { error } = await supabase.auth.verifyOtp({ 
      token_hash: tokenHash,
      type: 'magiclink'
    });

    if (error) {
      alert('Error');
      console.log(error.message);
      return;
    }

    // router.push('/welcome'); //MEMO: probalby  change to set a password page
    // once logged in hub, for testing, we can redirect to tapin or other service with the param invite to do T_01_6...
    window.location.href = `https://n-tapin-vercel-tau.vercel.app/auth/start?invite=${inviteId}`
  }

  return (
    <main className="max-w-[600px] my-10 mx-auto font-sans px-5">
      <div>
        <h1>You are invited to join a workspace</h1>
        <button
          onClick={submit}
          className="bg-[#0070f3] text-white py-2 px-4 rounded font-bold mt-4 hover:bg-blue-700 transition-colors"
        >Accept</button>
      </div>
    </main>
  );
}

export default function Invite() {
  return <Suspense><InviteInner /></Suspense>
}
