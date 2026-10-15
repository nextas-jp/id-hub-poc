import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Logout() {
  const router = useRouter();
  const [message, setMessage] = useState('Logging out...');
  // ReactのStrict Mode（開発環境）でuseEffectが2回実行されるのを防ぐためのフラグ
  const started = useRef(false);

  useEffect(() => {
    // routerの準備ができていない、または既に処理開始済みの場合はスキップ
    if (!router.isReady || started.current) return;
    started.current = true;

    const performLogout = async () => {
      // 1. Hub側のセッションを破棄（大元の鍵を捨てる）
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Hub logout error:', error);
        setMessage('Error: ログアウトに失敗しました');
        return;
      }

      // 2. TapInから渡された戻り先URL（return_to）を取得
      const returnTo = router.query.return_to as string;

      // 3. 戻り先があればTapInへ、なければHubのログイン画面へリダイレクト
      if (returnTo) {
        // 別ドメイン（Hub -> TapIn）への遷移になるため、router.pushではなくwindow.locationを使います
        window.location.href = returnTo;
      } else {
        router.replace('/login');
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