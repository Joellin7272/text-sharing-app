'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [content, setContent] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // 生成分享URL
    const url = `${window.location.origin}/view`;
    setShareUrl(url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'texts'), {
        content,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('文字內容已更新！');
      setContent('');
    } catch (error) {
      toast.error('發生錯誤，請稍後再試');
      console.error('Error adding document: ', error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">文字分享管理系統</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">添加新文字</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 p-4 border rounded-lg mb-4"
                placeholder="請輸入要分享的文字內容..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                發布
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">分享QR碼</h2>
            <div className="flex flex-col items-center">
              <QRCodeSVG value={shareUrl} size={200} />
              <p className="mt-4 text-sm text-gray-600">掃描QR碼查看分享內容</p>
              <p className="mt-2 text-sm text-blue-500 break-all">{shareUrl}</p>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </main>
  );
} 