"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Payslip = {
  id: string;
  target_month: string;
  file_path: string;
  created_at: string;
};

export default function MyPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayslips() {
      // ① フロントエンドが「誰がログインしているか」を認識できているか確認
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('現在のセッション:', sessionData.session);

      if (sessionData.session) {
        console.log('ログイン中のUID:', sessionData.session.user.id);
      } else {
        console.log('⚠️ セッションがありません（未ログイン扱いになっています）');
      }

      // ② データの取得結果とエラーの詳細を確認
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('target_month', { ascending: false });

      console.log('取得したデータ:', data);
      if (error) console.error('エラー詳細:', error);

      if (data) {
        setPayslips(data);
      }
      setLoading(false);
    }

    fetchPayslips();
  }, []);

  // PDFを安全に開くための署名付きURL（一時URL）を発行する処理
  const handleViewPdf = async (filePath: string) => {
    console.log('取得を試みるファイルパス:', filePath);

    const { data, error } = await supabase
      .storage
      .from('payslips')
      .createSignedUrl(filePath, 60);

    if (error) {
      console.error('Storageエラー詳細:', error);
      alert(`エラー: ${error.message}\nコンソールを確認してください。`);
      return;
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>読み込み中...</div>;
  }

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>過去の給与明細</h1>

      {payslips.length === 0 ? (
        <p style={{ color: '#666' }}>給与明細データがありません。</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {payslips.map((slip) => (
            <div
              key={slip.id}
              style={{
                border: '1px solid #ddd',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  {slip.target_month}分 給与明細
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  発行日: {new Date(slip.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleViewPdf(slip.file_path)}
                style={{
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: "16px"
                }}
              >
                PDFを閲覧
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}