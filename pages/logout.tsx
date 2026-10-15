import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Logout() {
  const router = useRouter();
  const [message, setMessage] = useState('Logging out...');
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;

    const performLogout = async () => {
      try {
        // 1. 【追加】Supabaseがローカルストレージから現在のセッションを認識するのを待つ
        await supabase.auth.getSession();

        // 2. Hub側のセッションを破棄（サーバー側へのトークン無効化リクエスト）
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Hub logout error:', error);

        // 3. 【追加のフェイルセーフ】
        // ブラウザの仕様によるタイミング問題でデータが残るのを完全に防ぐため、
        // 関連するSupabaseの認証キー（sb-...-auth-token）を強制的に消去する
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            window.localStorage.removeItem(key);
          }
        });
      } catch (err) {
        console.error('Unexpected error during logout:', err);
      } finally {
        // 4. ログアウト処理が完了（または失敗）しても、必ずTapInへ送り返す
        const returnTo = router.query.return_to as string;
        if (returnTo) {
          window.location.href = returnTo;
        } else {
          router.replace('/login');
        }
      }
    };

    performLogout();
  }, [router.isReady]);

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>{message}</h2>
    </main>
  );
}