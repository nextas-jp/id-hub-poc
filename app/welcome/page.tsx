"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Welcome() {
  const [status, setStatus] = useState<string>('Checking authentication...');

  //TODO: In the real thing, protect this page from unauthenticated access, redirect somewhere else

  useEffect(() => {
    const checkAuthentication = async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get('access_token');
      const refresh_token = hash.get('refresh_token')

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token }); //MEMO: create session with the tokens in the address bar
        window.history.replaceState(null, '', window.location.pathname); //MEMO: address bar cleanup
      }

      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data) {
        setStatus('Authentication failed. Please use your magic link.');
        return;
      }

      const email = data?.user.email ?? "Guest";
      setStatus(`Welcome ${email}! Authentication successful.`);
    };

    checkAuthentication();
  }, []);

  return (
    <div>
      <h1>WELCOME TEST</h1>
      <p>{status}</p>
    </div>
  );
}