'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { TextContent } from '../../types';

export default function ViewPage() {
  const [texts, setTexts] = useState<TextContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('Starting to fetch texts...');
      const q = query(collection(db, 'texts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('Received snapshot:', snapshot.size, 'documents');
          const textList = snapshot.docs.map(doc => ({
            id: doc.id,
            content: doc.data().content,
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }));
          setTexts(textList);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firebase error:', err);
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
    } catch (error) {
      console.error('Failed to copy: ', error);
      toast.error('複製失敗，請重試');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">可用的文本</h1>
      
      <div className="space-y-4">
        {texts.map((text) => (
          <div key={text.id} className="p-4 bg-white shadow rounded-lg">
            <p className="whitespace-pre-wrap mb-4">{text.content}</p>
            <button
              onClick={() => copyToClipboard(text.content)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              複製文本
            </button>
            <p className="text-sm text-gray-500 mt-2">
              更新時間：{text.updatedAt.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {texts.length === 0 && (
        <p className="text-center text-gray-500">目前沒有可用的文本</p>
      )}
      
      <Toaster position="bottom-right" />
    </div>
  );
} 