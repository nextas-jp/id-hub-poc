import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    // ▼▼▼ 追加：ミドルウェアから弾かれた場合のエラーメッセージ処理 ▼▼▼
    if (router.query.error === 'banned_or_unauthorized') {
      setError('このアカウントは凍結されているか、アクセス権がありません。');
      // 残存キャッシュを確実に消去
      supabase.auth.signOut();
    }
    // ▲▲▲ ここまで追加 ▲▲▲

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 戻り先URLを取得（なければ '/' になる）
        const next = typeof router.query.next === 'string' ? router.query.next : '/';
        router.push(next.startsWith('/') && !next.startsWith('//') ? next : '/');
      } else {
        console.log("③ 【失敗】セッションが見つかりません。フォームで待機します。");
      }
    };

    checkSession();
  }, [router.isReady, router.query]);

  // TODO: FormEvent deprecated....
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      let displayMessage = authError.message;

      if (authError.message === 'User is banned') {
        displayMessage = 'このアカウントは利用規約違反等のため凍結されています。管理者にお問い合わせください。';
      } else if (authError.message === 'Invalid login credentials') {
        displayMessage = 'メールアドレスまたはパスワードが間違っています。';
      }

      setError(displayMessage);
      return;
    }

    // ▼▼▼ ここから修正 ▼▼▼
    const next = typeof router.query.next === 'string' ? router.query.next : '/';
    
    // router.push(...) を削除し、強制的に画面を移動させてサーバー（ミドルウェア）にCookieを認識させる
    window.location.href = next.startsWith('/') && !next.startsWith('//') ? next : '/';
    // ▲▲▲ ここまで修正 ▲▲▲
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>Hub login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log in</button>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      </form>
    </main>
  );
}