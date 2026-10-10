'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Input, Button, Tag, Space, Divider, message, Tabs, Segmented } from 'antd';
import {
  FileText,
  CheckCircle,
  Send,
  RefreshCw,
  Trash2,
  Sparkles,
  Hash,
  Share2,
  Copy,
  Clock,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';
import { WYSIWYGToolbar } from './WYSIWYGToolbar';
import { SocialPostMockup } from './SocialPostMockup';
import { FacebookIcon, TelegramIcon, LinkedInIcon, ZaloIcon } from '@/components/icons/SocialIcons';

const { TextArea } = Input;

export interface GeneratedPostData {
  postId?: string;
  title: string;
  content: string;
  hashtags?: string[];
  platform?: string;
  durationMs?: number;
  copywritingFramework?: string;
  visualPrompt?: string;
  targetAudience?: string;
  estimatedReadingTime?: string;
}

interface ExecutionResultDrawerProps {
  open: boolean;
  onClose: () => void;
  postData: GeneratedPostData | null;
  onApprove: (action: 'approve' | 'approve_and_publish', edits?: { title: string; content: string }) => Promise<void>;
  onRegenerate: (feedback: string) => Promise<void>;
  onDiscard?: () => Promise<void>;
  isLoading?: boolean;
}

export function ExecutionResultDrawer({
  open,
  onClose,
  postData,
  onApprove,
  onRegenerate,
  onDiscard,
  isLoading = false,
}: ExecutionResultDrawerProps) {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    if (postData) {
      setEditedTitle(postData.title || '');
      setEditedContent(postData.content || '');
      setFeedback('');
      const norm = (postData.platform || 'facebook').toLowerCase();
      if (norm.includes('telegram')) setSelectedPlatform('telegram');
      else if (norm.includes('linkedin')) setSelectedPlatform('linkedin');
      else if (norm.includes('zalo')) setSelectedPlatform('zalo');
      else setSelectedPlatform('facebook');
    }
  }, [postData]);

  if (!postData) return null;

  const handleCopy = () => {
    const fullText = `${editedTitle}\n\n${editedContent}\n\n${(postData.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    message.success('Đã sao chép nội dung bài viết vào Clipboard');
  };

  const handleInsertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const target = textAreaRef.current?.resizableTextArea?.textArea || textAreaRef.current;
    if (!target) {
      setEditedContent((prev) => prev + prefix + defaultText + suffix);
      return;
    }

    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const selected = editedContent.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;

    const updated = editedContent.substring(0, start) + replacement + editedContent.substring(end);
    setEditedContent(updated);

    setTimeout(() => {
      target.focus();
      const cursorTarget = start + prefix.length + (selected ? selected.length : defaultText.length);
      target.setSelectionRange(cursorTarget, cursorTarget);
    }, 50);
  };

  const handleApproveAction = async (action: 'approve' | 'approve_and_publish') => {
    try {
      setIsSubmitting(true);
      await onApprove(action, {
        title: editedTitle,
        content: editedContent,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateAction = async () => {
    try {
      setIsSubmitting(true);
      await onRegenerate(feedback);
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;
  const charCount = editedContent.length;
  const estimatedReadTimeSec = Math.max(10, Math.ceil((wordCount / 200) * 60));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={viewMode === 'split' ? 880 : 640}
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>WYSIWYG Content Studio & Live Mockup</span>
          </div>
          <div className="flex items-center gap-2">
            <Segmented
              value={viewMode}
              onChange={(val: any) => setViewMode(val)}
              options={[
                { value: 'split', icon: <Columns size={13} />, label: 'Song Song' },
                { value: 'editor', icon: <Edit3 size={13} />, label: 'Soạn Thảo' },
                { value: 'preview', icon: <Eye size={13} />, label: 'Mockup' },
              ]}
              size="small"
              className="bg-neutral-900 border border-neutral-800 text-xs"
            />
            <Button
              size="small"
              icon={<Copy size={12} />}
              onClick={handleCopy}
              className="rounded-lg text-xs"
            >
              Sao Chép
            </Button>
          </div>
        </div>
      }
      className="execution-result-drawer"
    >
      <div className="space-y-4 text-xs pb-12">
        {/* Post Metadata Summary */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-900/70 border border-neutral-800 p-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="purple" className="rounded-md font-semibold">
              Hermes AI
            </Tag>
            <Tag color="cyan" className="rounded-md font-semibold">
              {postData.copywritingFramework ? `${postData.copywritingFramework} Framework` : 'PAS Framework'}
            </Tag>
            <Tag color="blue" className="rounded-md font-semibold">
              {postData.platform || 'Facebook Post'}
            </Tag>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-neutral-300 flex items-center gap-1">
              <FileText size={12} />
              <span>{wordCount} từ ({charCount} ký tự)</span>
            </span>
            <span className="text-neutral-400 flex items-center gap-1">
              <Clock size={12} />
              <span>~{estimatedReadTimeSec}s đọc</span>
            </span>
            {postData.durationMs && (
              <span className="text-emerald-400 font-bold">
                ⚡ {(postData.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Visual Prompt Suggestion (if available) */}
        {postData.visualPrompt && (
          <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/30 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 text-[11px]">
              <Sparkles size={12} />
              <span>Gợi ý Visual / Infographic cho Designer:</span>
            </div>
            <p className="text-neutral-300 text-xs italic leading-relaxed">{postData.visualPrompt}</p>
          </div>
        )}

        {/* Main Grid: Split View or Single View */}
        <div
          className={`grid gap-4 ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Left Column: Rich WYSIWYG Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className="space-y-3.5 bg-neutral-900/30 p-3 rounded-2xl border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-200 flex items-center gap-1.5">
                  <Edit3 size={14} className="text-indigo-400" />
                  <span>Trình Soạn Thảo WYSIWYG</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {wordCount} từ
                </span>
              </div>

              {/* Title Input */}
              <div>
                <label className="block mb-1 font-semibold text-neutral-400 text-[11px]">
                  Tiêu đề bài viết:
                </label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hoặc Headline hook..."
                  className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 font-bold rounded-xl text-xs"
                />
              </div>

              {/* Formatting Toolbar */}
              <WYSIWYGToolbar onInsert={handleInsertFormatting} />

              {/* Content TextArea */}
              <div>
                <TextArea
                  ref={textAreaRef}
                  rows={13}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết..."
                  className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 rounded-xl font-sans leading-relaxed text-xs p-3 focus:!border-indigo-500"
                />
              </div>

              {/* Hashtags */}
              {postData.hashtags && postData.hashtags.length > 0 && (
                <div>
                  <label className="flex items-center gap-1 mb-1 font-semibold text-neutral-400 text-[11px]">
                    <Hash size={12} />
                    Hashtags gợi ý:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {postData.hashtags.map((tag, idx) => (
                      <Tag
                        key={idx}
                        onClick={() => {
                          const tagStr = tag.startsWith('#') ? tag : `#${tag}`;
                          if (!editedContent.includes(tagStr)) {
                            setEditedContent((prev) => `${prev} ${tagStr}`);
                          }
                        }}
                        className="bg-neutral-950 border-neutral-800 text-indigo-400 rounded-lg text-xs cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Live Social Platform Mockup */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="space-y-3 bg-neutral-900/30 p-3 rounded-2xl border border-neutral-800/80">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-neutral-800/60">
                <span className="font-bold text-xs text-neutral-200 flex items-center gap-1.5">
                  <Eye size={14} className="text-emerald-400" />
                  <span>Xem Trước Mockup Thực Tế</span>
                </span>

                {/* Platform Switcher Buttons */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('facebook')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPlatform === 'facebook'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>FB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('telegram')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPlatform === 'telegram'
                        ? 'bg-cyan-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <TelegramIcon className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('linkedin')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPlatform === 'linkedin'
                        ? 'bg-sky-700 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LinkedInIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('zalo')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPlatform === 'zalo'
                        ? 'bg-blue-800 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ZaloIcon className="w-3.5 h-3.5" />
                    <span>Zalo</span>
                  </button>
                </div>
              </div>

              {/* Render Selected Social Mockup */}
              <div className="pt-2 max-h-[600px] overflow-y-auto pr-1">
                <SocialPostMockup
                  platform={selectedPlatform}
                  title={editedTitle}
                  content={editedContent}
                  hashtags={postData.hashtags}
                  visualPrompt={postData.visualPrompt}
                />
              </div>
            </div>
          )}
        </div>

        <Divider className="!border-neutral-800" />

        {/* Revision / Feedback Section */}
        <div className="rounded-xl bg-neutral-900/50 border border-neutral-800/80 p-3.5 space-y-2">
          <label className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <RefreshCw size={13} className="text-amber-400" />
            Yêu cầu Hermes viết lại với chỉnh sửa (Feedback Loop):
          </label>
          <TextArea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="VD: Nhấn mạnh tính năng AI CRM, viết ngắn hơn 20%, thêm CTA đăng ký bản dùng thử..."
            className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 rounded-xl"
          />
          <Button
            icon={<RefreshCw size={13} />}
            onClick={handleRegenerateAction}
            loading={isSubmitting || isLoading}
            disabled={!feedback.trim()}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700 rounded-xl font-semibold text-xs h-9 cursor-pointer"
          >
            Yêu Cầu Hermes Sáng Tạo Lại Theo Feedback
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="default"
            icon={<CheckCircle size={15} />}
            onClick={() => handleApproveAction('approve')}
            loading={isSubmitting || isLoading}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border-emerald-500/40 rounded-xl font-bold h-11 text-xs cursor-pointer"
          >
            Duyệt & Lưu Bản Nháp (Draft)
          </Button>

          <Button
            type="primary"
            icon={<Send size={15} />}
            onClick={() => handleApproveAction('approve_and_publish')}
            loading={isSubmitting || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold h-11 text-xs cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            Duyệt & Đăng Trực Tiếp Lên Mạng Xã Hội
          </Button>

          {onDiscard && (
            <div className="sm:col-span-2">
              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={onDiscard}
                className="w-full rounded-xl text-xs h-9 cursor-pointer"
              >
                Hủy Bỏ Bản Thảo Này
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
