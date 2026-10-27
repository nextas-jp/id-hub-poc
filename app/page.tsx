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
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('target_month', { ascending: false });

      if (error) {
        console.error('明細の取得エラー:', error);
      } else if (data) {
        setPayslips(data);
      }
      setLoading(false);
    }

    fetchPayslips();
  }, []);

  // PDFを安全に開くための署名付きURL（一時URL）を発行する処理
  const handleViewPdf = async (filePath: string) => {
    const { data, error } = await supabase
      .storage
      .from('payslips')
      .createSignedUrl(filePath, 60); // 60秒間だけ有効なURLを発行

    if (error) {
      alert('ファイルの取得に失敗しました。アクセス権限がありません。');
      return;
    }

    // 発行された一時URLを別タブで開く
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
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
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
                  fontWeight: 'bold'
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