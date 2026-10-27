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
    <main className="max-w-[600px] my-10 mx-auto font-sans px-5">
      <h1 className="text-2xl font-bold mb-6">過去の給与明細</h1>

      {payslips.length === 0 ? (
        <p className="text-gray-500">給与明細データがありません。</p>
      ) : (
        <div className="grid gap-4">
          {payslips.map((slip) => (
            <div
              key={slip.id}
              className="border border-gray-300 p-4 rounded-lg shadow-sm"
            >
              <div>
                <p className="text-lg font-bold mb-1">
                  {slip.target_month}分 給与明細
                </p>
                <p className="text-xs text-gray-500">
                  発行日: {new Date(slip.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleViewPdf(slip.file_path)}
                className="bg-[#0070f3] text-white py-2 px-4 rounded font-bold mt-4 hover:bg-blue-700 transition-colors"
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