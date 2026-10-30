"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Welcome() {
  const [status, setStatus] = useState('Checking authentication...');

  //TODO: In the real thing, protect this page from unauthenticated access, redirect somewhere elese

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setStatus('Authentication failed. Please use your magic link.');
        return;
      }

      // Welcome message
      setStatus(`Welcome ${user.email}! Authentication successful.`);
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