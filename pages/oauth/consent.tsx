import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function Consent() {
  const router = useRouter();
  const [message, setMessage] = useState('Processing...');
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;

    const authorizationId = router.query.authorization_id as string | undefined;
    if (!authorizationId) {
      setMessage('Error: missing authorization_id');
      return;
    }

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const next = `/oauth/consent?authorization_id=${authorizationId}`;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      const { data: details, error } =
        await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (error || !details) {
        setMessage(`Error: ${error?.message ?? 'invalid request'}`);
        return;
      }

      if (!('authorization_id' in details)) {
        window.location.href = (details as any).redirect_url;
        return;
      }

      const { data, error: approveError } =
        await supabase.auth.oauth.approveAuthorization(authorizationId);
      if (approveError || !data) {
        setMessage(`Error: ${approveError?.message ?? 'approval failed'}`);
        return;
      }

      // MEMO: Back to the app (TapIn's Supabase) with the authorization code
      window.location.href = data.redirect_url;
    })();
  }, [router.isReady]);

  return <p style={{ fontFamily: 'sans-serif', margin: '80px auto', textAlign: 'center' }}>{message}</p>;
}