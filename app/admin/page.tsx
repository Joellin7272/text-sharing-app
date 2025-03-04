'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { TextContent } from '../../types';

interface Text {
  id: string;
  content: string;
  createdAt: number;
  status: 'published' | 'draft';
}

export default function AdminPage() {
  const [content, setContent] = useState('');
  const [texts, setTexts] = useState<Text[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 設置分享URL
    const getNetworkUrl = () => {
      const hostname = window.location.hostname;
      const port = window.location.port;
      // 如果是localhost，使用本機IP
      const host = hostname === 'localhost' ? '172.20.10.7' : hostname;
      return `http://${host}${port ? `:${port}` : ''}/view`;
    };
    
    setShareUrl(getNetworkUrl());

    // 監聽文本內容變化
    const unsubscribe = onSnapshot(collection(db, 'texts'), (snapshot) => {
      const textsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Text[];
      
      // 按創建時間排序，最新的在前面
      setTexts(textsData.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!content.trim()) {
      toast.error("請輸入內容");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'texts'), {
        content: content.trim(),
        createdAt: Date.now(),
        status
      });
      setContent('');
      toast.success(status === 'published' ? "發布成功！" : "已保存為草稿");
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("發生錯誤，請重試");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'texts', id));
      toast.success("刪除成功");
    } catch (error) {
      console.error("Error deleting text:", error);
      toast.error("刪除失敗，請重試");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateDoc(doc(db, 'texts', id), {
        status: 'published'
      });
      toast.success("發布成功");
    } catch (error) {
      console.error("Error publishing text:", error);
      toast.error("發布失敗，請重試");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">管理員控制台</h1>
        
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">QR碼</h2>
          <div className="flex flex-col items-center gap-4">
            <QRCodeSVG value={shareUrl} size={200} />
            <p className="text-sm text-gray-600">掃描QR碼查看內容</p>
            <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">添加新文本</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="在此輸入文本內容..."
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              立即發布
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              保存草稿
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">已發布的文本</h2>
          <div className="space-y-4">
            {texts.filter(text => text.status === 'published').map((text) => (
              <div key={text.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <p className="text-gray-800 mb-3">{text.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(text.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(text.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">草稿箱</h2>
          <div className="space-y-4">
            {texts.filter(text => text.status === 'draft').map((text) => (
              <div key={text.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <p className="text-gray-800 mb-3">{text.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(text.createdAt).toLocaleString()}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handlePublish(text.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      發布
                    </button>
                    <button
                      onClick={() => handleDelete(text.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
} 