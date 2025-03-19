'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';

interface Text {
  id: string;
  content: string;
  createdAt: number;
  status: string;
}

interface Feedback {
  id: string;
  content: string;
  createdAt: number;
}

export default function ViewPage() {
  const [activeTab, setActiveTab] = useState<'view' | 'feedback'>('view');
  const [texts, setTexts] = useState<Text[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取發布的文本
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'texts'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const textsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Text[];
          const publishedTexts = textsData.filter(text => text.status === 'published');
          setTexts(publishedTexts);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore error:', err);
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

  // 獲取回傳記錄
  useEffect(() => {
    if (activeTab === 'feedback') {
      const q = query(
        collection(db, 'feedbacks'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const feedbacksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Feedback[];
        setFeedbacks(feedbacksData);
      });

      return () => unsubscribe();
    }
  }, [activeTab]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已複製到剪貼板！');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('複製失敗，請重試');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error('請輸入回傳內容');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        content: feedbackContent.trim(),
        createdAt: Date.now()
      });
      setFeedbackContent('');
      toast.success('回傳成功！');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('回傳失敗，請重試');
    }
    setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">智慧資訊分享站</h1>
          <p className="text-lg text-gray-600">即時獲取最新資訊，一鍵複製輕鬆分享</p>
        </div>

        {/* 分頁按鈕 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'view'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            查看資訊
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            回傳資訊
          </button>
        </div>

        {/* 內容區域 */}
        {activeTab === 'view' ? (
          // 查看資訊頁面
          <div className="space-y-6">
            {texts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>暫無資訊</p>
              </div>
            ) : (
              texts.map((text) => (
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
              ))
            )}
          </div>
        ) : (
          // 回傳資訊頁面
          <div className="space-y-8">
            {/* 回傳表單 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">回傳新資訊</h2>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入您要回傳的內容..."
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '發送中...' : '發送回傳'}
              </button>
            </div>

            {/* 回傳記錄 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">回傳記錄</h2>
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">暫無回傳記錄</p>
                ) : (
                  feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-4 border border-gray-100 rounded-lg bg-gray-50"
                    >
                      <p className="text-gray-800">{feedback.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
} 