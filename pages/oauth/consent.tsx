import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function Consent() {
  const router = useRouter();
  const [message, setMessage] = useState('SSOの認証を確認中...');
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
      // 🔍 調査1：Supabaseが動く前に、ブラウザの金庫（LocalStorage）を直接覗き見する
      const rawStorage = window.localStorage.getItem('sb-ulhqafbstiqyhbodvpny-auth-token');
      console.log("🔍 ① Consent到着直後のLocalStorage:", rawStorage ? "🔑 鍵あり！" : "🗑️ 空っぽ...");

      // 🔍 調査2：Supabaseにセッションを確認させる
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("🔍 ② getSession()の結果:", sessionData.session ? "🟢 セッションあり" : "🔴 セッションなし", sessionError);

      // 🔍 調査3：getSession()の直後にLocalStorageが消えていないか確認
      const rawStorageAfter = window.localStorage.getItem('sb-ulhqafbstiqyhbodvpny-auth-token');
      console.log("🔍 ③ getSession後のLocalStorage:", rawStorageAfter ? "🔑 鍵あり！" : "🗑️ 空っぽ...");

      if (!sessionData.session) {
        console.log("🚨 セッションがないためログイン画面へ飛ばします");
        const next = `/oauth/consent?authorization_id=${authorizationId}`;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      // 認証成功時の処理
      const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (error || !details) {
        setMessage(`Error: ${error?.message ?? 'invalid request'}`);
        return;
      }

      if (!('authorization_id' in details)) {
        window.location.href = (details as any).redirect_url;
        return;
      }

      const { data, error: approveError } = await supabase.auth.oauth.approveAuthorization(authorizationId);
      if (approveError || !data) {
        setMessage(`Error: ${approveError?.message ?? 'approval failed'}`);
        return;
      }

      console.log("✅ SSO成功！TapInへ戻ります！");
      window.location.href = data.redirect_url;
    })();
  }, [router.isReady]);

  return <p style={{ fontFamily: 'sans-serif', margin: '80px auto', textAlign: 'center' }}>{message}</p>;
}