'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Text {
  id: string;
  content: string;
  createdAt: number;
  status: string;
}

export default function ViewPage() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 簡化查詢，只按時間排序
      const q = query(
        collection(db, 'texts'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const textsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Text[];
          console.log('Fetched texts:', textsData); // 添加日誌
          setTexts(textsData);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore error:', err); // 添加錯誤日誌
          setError('載入數據時發生錯誤');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Setup error:', err);
      setError('設置連接時發生錯誤');
      setLoading(false);
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼板！');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('複製失敗，請重試');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">智慧資訊分享站</h1>
          <p className="text-lg text-gray-600">即時獲取最新資訊，一鍵複製輕鬆分享</p>
        </div>

        {texts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>暫無資訊</p>
          </div>
        ) : (
          <div className="space-y-6">
            {texts.map((text) => (
              <div
                key={text.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="text-gray-800 text-lg flex-grow">{text.content}</p>
                  <button
                    onClick={() => copyToClipboard(text.content)}
                    className="flex-shrink-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    複製
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {new Date(text.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 