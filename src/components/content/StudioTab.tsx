'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Select, Tag, DatePicker, message } from 'antd';
import { Sparkles, Send, Calendar, FileText } from 'lucide-react';
import {
  useCreateSocialPost,
  usePublishSocialPost,
  useGenerateSocialPostContent,
} from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

interface StudioTabProps {
  onPostCreated?: () => void;
}

export default function StudioTab({ onPostCreated }: StudioTabProps) {
  const createPostMutation = useCreateSocialPost();
  const publishPostMutation = usePublishSocialPost();
  const generateMutation = useGenerateSocialPostContent();

  const [promptInput, setPromptInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('facebook_post');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<any>(null);

  // Handler: Generate Content with AI
  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      message.warning('Vui lòng nhập câu lệnh Prompt cho AI');
      return;
    }
    try {
      const res = await generateMutation.mutateAsync(promptInput);
      setGeneratedTitle(res.title || 'Bài viết truyền thông Xantivation CRM');
      setGeneratedContent(res.content || '');
      setGeneratedHashtags(res.hashtags || []);
      message.success('Đã khởi tạo nội dung thành công từ AI Engine');
    } catch (err: any) {
      message.error(err.message || 'Khởi tạo nội dung thất bại');
    }
  };

  // Handler: Save Post / Publish
  const handleSavePost = async (publishImmediately = false) => {
    if (!generatedContent.trim()) {
      message.warning('Chưa có nội dung bài viết để lưu');
      return;
    }
    try {
      const fullText = generatedHashtags.length > 0
        ? `${generatedContent}\n\n${generatedHashtags.join(' ')}`
        : generatedContent;

      const payload: any = {
        title: generatedTitle || 'Bài viết truyền thông',
        content: fullText,
        platform: selectedChannel,
        channelName:
          selectedChannel === 'facebook_post'
            ? 'Xantivation Content Hub'
            : selectedChannel === 'facebook_reels'
            ? 'Xantivation Reels'
            : 'Telegram Support Channel',
        status: publishImmediately ? 'published' : scheduleDate ? 'scheduled' : 'draft',
        origin: 'manual',
        scheduledAt: scheduleDate ? scheduleDate.toISOString() : undefined,
      };

      const created = await createPostMutation.mutateAsync(payload);
      if (publishImmediately && created?.id) {
        await publishPostMutation.mutateAsync(created.id);
        message.success('Đã đăng bài thành công lên Facebook Page');
      } else {
        message.success(scheduleDate ? 'Đã lên lịch đăng bài thành công' : 'Đã lưu bản nháp bài viết');
      }

      // Reset Form
      setGeneratedTitle('');
      setGeneratedContent('');
      setGeneratedHashtags([]);
      setPromptInput('');
      setScheduleDate(null);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất bản bài viết');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
      {/* Left Form: Prompt & Channel selection */}
      <Card className="lg:col-span-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1.5">
              Chọn Kênh Xuất Bản Bài Viết
            </label>
            <Select
              value={selectedChannel}
              onChange={setSelectedChannel}
              className="w-full text-xs rounded-xl"
              options={[
                { value: 'facebook_post', label: 'Facebook Page — Xantivation Content Hub' },
                { value: 'facebook_reels', label: 'Facebook Page — Xantivation Reels' },
                { value: 'telegram', label: 'Telegram — Channel Tin Tức' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1.5 flex items-center justify-between">
              <span>Câu Lệnh Prompt Cho Hermes AI</span>
              <span className="text-[11px] text-[var(--color-muted-fg)]">
                Ví dụ: Giới thiệu tính năng CRM Cloud
              </span>
            </label>
            <TextArea
              rows={4}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Hãy soạn 1 bài viết giới thiệu tính năng CRM Cloud kèm hashtag và đăng lên Facebook Page Content Hub..."
              className="rounded-xl text-xs font-sans p-3"
            />
          </div>

          <Button
            type="primary"
            icon={<Sparkles size={14} />}
            loading={generateMutation.isPending}
            onClick={handleGenerate}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 text-xs font-medium"
          >
            Khởi Tạo Nội Dung Với AI Engine
          </Button>
        </div>
      </Card>

      {/* Right Form: Preview Card & Publishing Controls */}
      <Card className="lg:col-span-6 rounded-2xl shadow-sm border border-[var(--color-border)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <span className="text-xs font-semibold text-[var(--color-fg)] flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-500" />
              Xem Trước Bài Viết (Preview)
            </span>
            <Tag color="blue" className="text-[11px] font-mono">
              {selectedChannel}
            </Tag>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--color-muted-fg)] mb-1">
              Tiêu Đề Bài Viết
            </label>
            <Input
              value={generatedTitle}
              onChange={(e) => setGeneratedTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--color-muted-fg)] mb-1">
              Nội Dung Chi Tiết
            </label>
            <TextArea
              rows={5}
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              placeholder="Nội dung bài viết sẽ hiển thị ở đây sau khi sinh..."
              className="rounded-xl text-xs font-sans p-3"
            />
          </div>

          {generatedHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {generatedHashtags.map((tag, idx) => (
                <Tag key={idx} color="geekblue" className="text-[11px] font-mono rounded-lg">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-muted-fg)] mb-1">
                Lên Lịch Đăng (Tùy chọn)
              </label>
              <DatePicker
                showTime
                value={scheduleDate}
                onChange={(date) => setScheduleDate(date)}
                placeholder="Chọn ngày & giờ đăng..."
                className="w-full rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="primary"
                icon={<Send size={14} />}
                loading={createPostMutation.isPending || publishPostMutation.isPending}
                onClick={() => handleSavePost(true)}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 h-10 text-xs font-medium"
              >
                Đăng Ngay Lên Facebook
              </Button>
              <Button
                icon={<Calendar size={14} />}
                loading={createPostMutation.isPending}
                onClick={() => handleSavePost(false)}
                className="flex-1 rounded-xl h-10 text-xs font-medium"
              >
                {scheduleDate ? 'Lên Lịch Đăng' : 'Lưu Bản Nháp'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
