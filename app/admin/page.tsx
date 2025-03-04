'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, Timestamp, orderBy, query } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { TextContent } from '../../types';

export default function AdminPage() {
  const [content, setContent] = useState('');
  const [texts, setTexts] = useState<TextContent[]>([]);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // 設置分享URL
    const getNetworkUrl = () => {
      return `${window.location.origin}/view`;
    };
    
    setShareUrl(getNetworkUrl());

    // 監聽文本內容變化
    const q = query(collection(db, 'texts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const textList = snapshot.docs.map(doc => ({
        id: doc.id,
        content: doc.data().content,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      }));
      setTexts(textList);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const maxRetries = 3;
    let retryCount = 0;

    const addTextWithRetry = async (): Promise<boolean> => {
      try {
        await addDoc(collection(db, 'texts'), {
          content,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return true;
      } catch (error) {
        console.error('Error adding document (attempt ${retryCount + 1}): ', error);
        return false;
      }
    };

    while (retryCount < maxRetries) {
      const success = await addTextWithRetry();
      if (success) {
        setContent('');
        toast.success('文本已添加！');
        return;
      }
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒後重試
      }
    }

    toast.error('添加失敗，請重試');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">文本管理系統</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">QR碼</h2>
        <div className="flex flex-col items-center gap-4">
          <QRCodeSVG value={shareUrl} size={200} />
          <p className="text-sm text-gray-600">掃描QR碼查看內容</p>
          <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            添加新文本
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="在此輸入文本內容..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          添加
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">已添加的文本</h2>
        <div className="space-y-4">
          {texts.map((text) => (
            <div key={text.id} className="p-4 bg-white shadow rounded-lg">
              <p className="whitespace-pre-wrap">{text.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                添加時間：{text.createdAt.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
} 