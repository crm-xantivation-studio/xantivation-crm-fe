'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs } from 'antd';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Share2,
  FileText,
  Settings,
  Bot,
} from 'lucide-react';

import StudioTab from '@/components/content/StudioTab';
import ManagePostsTab from '@/components/content/ManagePostsTab';
import CommentSettingsTab from '@/components/content/CommentSettingsTab';
import AutoConfigTab from '@/components/content/AutoConfigTab';
import ReviewApproveModal from '@/components/content/ReviewApproveModal';
import RegenerateModal from '@/components/content/RegenerateModal';

function SocialPostsContent() {
  const [activeTab, setActiveTab] = useState('studio');
  const [reviewPost, setReviewPost] = useState<any | null>(null);
  const [regeneratePost, setRegeneratePost] = useState<any | null>(null);

  // Deep-link routing
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('id');
  const deepLinkAction = searchParams.get('action');

  useEffect(() => {
    if (deepLinkId && deepLinkAction === 'review') {
      setActiveTab('manage');
    }
  }, [deepLinkId, deepLinkAction]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            Quản Lý Bài Viết & Tự Động Đăng Tin
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">
            Khởi tạo nội dung truyền thông bằng AI Engine, quản lý lịch đăng đa kênh và thiết lập quy tắc phản hồi bình luận tự động.
          </p>
        </div>
      </div>

      {/* Main Single Page Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-content-tabs"
        items={[
          {
            key: 'studio',
            label: (
              <span className="flex items-center gap-2 text-xs font-medium px-2 py-1">
                <Sparkles size={14} className="text-amber-500" />
                AI Content Studio
              </span>
            ),
            children: <StudioTab onPostCreated={() => setActiveTab('manage')} />,
          },
          {
            key: 'manage',
            label: (
              <span className="flex items-center gap-2 text-xs font-medium px-2 py-1">
                <FileText size={14} className="text-blue-500" />
                Danh Sách & Lịch Đăng
              </span>
            ),
            children: (
              <ManagePostsTab
                onOpenReview={(post) => setReviewPost(post)}
                onOpenRegenerate={(post) => setRegeneratePost(post)}
                deepLinkPostId={deepLinkAction === 'review' ? deepLinkId : null}
              />
            ),
          },
          {
            key: 'settings',
            forceRender: true,
            label: (
              <span className="flex items-center gap-2 text-xs font-medium px-2 py-1">
                <Settings size={14} className="text-purple-500" />
                Cấu Hình Phản Hồi Bình Luận
              </span>
            ),
            children: <CommentSettingsTab />,
          },
          {
            key: 'auto-config',
            label: (
              <span className="flex items-center gap-2 text-xs font-medium px-2 py-1">
                <Bot size={14} className="text-emerald-500" />
                Cấu Hình Tự Động (Auto Post)
              </span>
            ),
            children: <AutoConfigTab />,
          },
        ]}
      />

      {/* Modals */}
      <ReviewApproveModal
        post={reviewPost}
        onClose={() => setReviewPost(null)}
        onRegenerate={(post) => {
          setReviewPost(null);
          setRegeneratePost(post);
        }}
      />
      <RegenerateModal
        post={regeneratePost}
        onClose={() => setRegeneratePost(null)}
      />
    </motion.div>
  );
}

export default function SocialPostsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[var(--color-muted-fg)]">Đang tải trang quản lý bài viết...</div>}>
      <SocialPostsContent />
    </Suspense>
  );
}
