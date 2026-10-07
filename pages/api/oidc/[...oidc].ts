import { Provider, Configuration } from 'oidc-provider';

// TapIn等の接続元アプリ（Client）の登録
const configuration: Configuration = {
  clients: [
    {
      client_id: 'tapin_client_poc',
      client_secret: 'tapin_secret_poc',
      grant_types: ['authorization_code'],
      redirect_uris: ['https://fekeduatixasksmycobq.supabase.co/auth/v1/callback'], // TapIn（Supabase）側のコールバックURL
      response_types: ['code'],
    },
  ],
  
  // 【検証目的②】同意画面（Consent Screen）の強制スキップ設定
  // ユーザーに「許可しますか？」を出さず、自動的に全権限を付与してFirst-Party Appとして振る舞わせる
  loadExistingGrant: async (ctx) => {
    const grant = new ctx.oidc.provider.Grant({
      clientId: ctx.oidc.client?.clientId as string,
      accountId: ctx.oidc.session?.accountId as string,
    });
    grant.addOIDCScope('openid email profile');
    await grant.save();
    return grant;
  },

  // ログイン画面のルーティング
  interactions: {
    url(ctx, interaction) {
      // Hub側の自作ログイン画面（/login）へリダイレクトさせる
      return `/login?uid=${interaction.uid}`;
    },
  },

  features: {
    // 開発用のダミー画面をOFFにし、本番に近い挙動にする
    devInteractions: { enabled: false },
  },

  // PoC用のダミー暗号鍵（JWKS）。本番では必ず環境変数から動的に読み込むこと
  jwks: {
    keys: [
      {
        kty: 'RSA',
        n: 'jwk_dummy_n_value_please_generate_a_real_rsa_key_for_production',
        e: 'AQAB',
        d: 'dummy_d',
        p: 'dummy_p',
        q: 'dummy_q',
        dp: 'dummy_dp',
        dq: 'dummy_dq',
        qi: 'dummy_qi'
      }
    ]
  }
};

// 発行元URL（ローカル環境用）
const ISSUER_URL = 'http://localhost:3000/api/oidc';
let oidc: Provider;

export default function handler(req: any, res: any) {
  if (!oidc) {
    oidc = new Provider(ISSUER_URL, configuration);
  }
  
  // ▼▼ ここがNext.jsで動かすための最重要ハック ▼▼
  // oidc-providerが元のURL（/api/oidc）を見失わないように退避させます
  if (!req.originalUrl) {
    req.originalUrl = req.url;
  }
  
  // oidc-provider内部のルーティング用にパスを削る
  req.url = req.url?.replace(/^\/api\/oidc/, '') || '/';
  // ▲▲▲▲
  
  return oidc.callback()(req, res);
}