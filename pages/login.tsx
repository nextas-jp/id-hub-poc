import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ▼▼▼ ここから追加：すでにログイン済みの場合は自動スキップする処理 ▼▼▼
  useEffect(() => {
    if (!router.isReady) return;

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
  // ▲▲▲ ここまで追加 ▲▲▲

  // TODO: FormEvent deprecated....
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    // MEMO: Go back to where we came from (the consent page), only inside this site
    const next = typeof router.query.next === 'string' ? router.query.next : '/';
    router.push(next.startsWith('/') && !next.startsWith('//') ? next : '/');
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}