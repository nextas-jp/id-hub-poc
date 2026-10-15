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
        // 1. まず現在のセッション状態を確認
        const { data: { session } } = await supabase.auth.getSession();
        console.log('ログアウト前のHubセッション:', session);

        // 2. Hub側のセッションを破棄（サーバーへログアウト要求）
        const { error } = await supabase.auth.signOut();
        
        // ★ エラーが起きた場合は、画面に表示して「ここで止める」（リダイレクトしない）
        if (error) {
          console.error('Hub logout error:', error);
          setMessage(`エラー発生: ${error.message} (コンソールを確認してください)`);
          return; 
        }

        // 3. Supabaseの非同期処理（内部でのストレージ削除）が完了するのを少し待つ
        await new Promise(resolve => setTimeout(resolve, 500));

        // 4. 【ダメ押し】ブラウザから強制的に指定のキーを削除する
        window.localStorage.removeItem('sb-ulhqafbstiqyhbodvpny-auth-token');

        // 5. 成功のメッセージを出して、3秒待ってからリダイレクトする
        setMessage('Hubのログアウト成功！3秒後にTapInへ戻ります...');
        
        setTimeout(() => {
          const returnTo = router.query.return_to as string;
          if (returnTo) {
            window.location.href = returnTo;
          } else {
            router.replace('/login');
          }
        }, 3000);

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