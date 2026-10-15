import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Logout() {
  const router = useRouter();
  const [message, setMessage] = useState('Hubのログアウト処理中...');
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;

    const performLogout = async () => {
      try {
        await supabase.auth.signOut();
        setMessage('Hubのログアウト成功！TapInへ戻ります...');

        setTimeout(() => {
          
          Object.keys(window.localStorage).forEach((key) => {
            if (key.startsWith('sb-')) {
              window.localStorage.removeItem(key);
            }
          });
          window.sessionStorage.clear();

          const returnTo = router.query.return_to as string;
          if (returnTo) {
            window.location.href = returnTo;
          } else {
            router.replace('/login');
          }

        }, 1500);

      } catch (err) {
        console.error('Unexpected error:', err);
        setMessage('予期せぬエラーが発生しました。');
      }
    };

    performLogout();
  }, [router.isReady]);

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ lineHeight: '1.5' }}>{message}</h2>
    </main>
  );
}