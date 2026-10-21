import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Logout() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;

    const performLogout = async () => {
      // 【最重要】サーバーに通信する「前」に、強制的にHubのローカルストレージを全破壊する
      try {
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('sb-')) {
            window.localStorage.removeItem(key);
          }
        });
        window.sessionStorage.clear();
      } catch (e) {
        console.error("Storage clear error:", e);
      }

      // その上で、念のためサーバーにもログアウト要求を送る
      // （※すでにTapIn側で破棄済みの場合はエラーになるが、無視して進める）
      await supabase.auth.signOut().catch(() => {});

      // 破壊が完了したら即座にTapIn（またはログイン画面）へ送り返す
      const returnTo = router.query.return_to as string;
      if (returnTo) {
        window.location.href = returnTo;
      } else {
        const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'https://id-hub-poc.vercel.app';
        window.location.href = `${hubUrl}/logout?return_to=${encodeURIComponent(window.location.origin)}`;
        
        // ▲▲▲ ここまで変更 ▲▲▲
      }
    };

    performLogout();
  }, [router.isReady, router.query]);

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ lineHeight: '1.5' }}>安全にログアウトしています...</h2>
    </main>
  );
}