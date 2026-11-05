"use client";

import { useState } from 'react';

export default function createTest() {
  const [email, setEmail] = useState<any>('');
  const [inviteUrl, setInviteUrl] = useState<any>('');

  async function submit() {
    const response = await fetch('/api/sales/invites/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        workspaceId: '028d41ee-b961-4e95-bded-273729714fc1',
        email: email
      }),
    });

    if (!response.ok) {
      alert('Failed to create invite.');
      return;
    }

    const data = await response.json();
    setInviteUrl(data.inviteUrl);
    console.log('Invite URL:', data.inviteUrl);
  }

  return (
    <main className="max-w-[600px] my-10 mx-auto font-sans px-5">
      <div>
        <h1>Invite a user to your Workspace</h1>
        <fieldset>
          <label>email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="border border-gray-300 rounded px-2 py-1 w-full" />
        </fieldset>
        <button
          onClick={submit}
          className="bg-[#0070f3] text-white py-2 px-4 rounded font-bold mt-4 hover:bg-blue-700 transition-colors"
        >Accept</button>
      </div>
      <p className='mt-2'>Invite created! Invite URL: <a href={inviteUrl} target='_blank'>{inviteUrl}</a></p>
    </main>
  );
}