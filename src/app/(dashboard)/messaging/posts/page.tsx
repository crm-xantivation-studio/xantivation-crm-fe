'use client';

import React, { useState } from 'react';
import { Tabs, Card, Button, Input, Select, Tag, Table, Switch, Form, DatePicker, message, Modal, Tooltip } from 'antd';
import {
  Sparkles,
  Send,
  Calendar,
  Share2,
  Trash2,
  ExternalLink,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useSocialPosts,
  useCreateSocialPost,
  usePublishSocialPost,
  useGenerateSocialPostContent,
  useDeleteSocialPost,
  useRestoreSocialPost,
  useCommentSettings,
  useUpdateCommentSettings,
} from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

export default function SocialPostsPage() {
  const [activeTab, setActiveTab] = useState('studio');
  const [showArchived, setShowArchived] = useState(false);

  // React Query Hooks
  const postsQuery = useSocialPosts(showArchived);
  const createPostMutation = useCreateSocialPost();
  const publishPostMutation = usePublishSocialPost();
  const generateMutation = useGenerateSocialPostContent();
  const deletePostMutation = useDeleteSocialPost();
  const restorePostMutation = useRestoreSocialPost();
  const commentSettingsQuery = useCommentSettings();
  const updateCommentSettingsMutation = useUpdateCommentSettings();

  // Tab 1 Local States
  const [promptInput, setPromptInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('facebook_post');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<any>(null);

  // Tab 3 Form
  const [settingsForm] = Form.useForm();

  // Populate settings form
  React.useEffect(() => {
    if (commentSettingsQuery.data) {
      settingsForm.setFieldsValue({
        autoReplyEnabled: commentSettingsQuery.data.autoReplyEnabled,
        template: commentSettingsQuery.data.template,
        portfolioContactLink: commentSettingsQuery.data.portfolioContactLink,
      });
    }
  }, [commentSettingsQuery.data, settingsForm]);

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
      const fullText = `${generatedContent}\n\n${generatedHashtags.join(' ')}`;
      const payload: any = {
        title: generatedTitle || 'Bài viết truyền thông',
        content: fullText,
        platform: selectedChannel,
        channelName: selectedChannel === 'facebook_post' ? 'Xantivation Content Hub' : selectedChannel === 'facebook_reels' ? 'Xantivation Reels' : 'Telegram Support Channel',
        status: publishImmediately ? 'published' : scheduleDate ? 'scheduled' : 'draft',
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
      postsQuery.refetch();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất bản bài viết');
    }
  };

  // Handler: Save Comment Settings
  const handleSaveSettings = async (values: any) => {
    try {
      await updateCommentSettingsMutation.mutateAsync(values);
      message.success('Đã lưu cấu hình phản hồi bình luận tự động');
    } catch (err: any) {
      message.error(err.message || 'Cập nhật cấu hình thất bại');
    }
  };

  // Columns for Tab 2 Table
  const columns = [
    {
      title: 'Mã Bài Viết',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id: string) => <span className="font-mono text-xs text-[var(--color-muted-fg)]">#{id.slice(0, 8)}</span>,
    },
    {
      title: 'Tiêu Đề & Nội Dung',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="font-medium text-xs text-[var(--color-fg)]">{record.title}</div>
          <div className="text-[11px] text-[var(--color-muted-fg)] line-clamp-2">{record.content}</div>
        </div>
      ),
    },
    {
      title: 'Kênh Xuất Bản',
      dataIndex: 'channelName',
      key: 'channelName',
      width: 180,
      render: (val: string, record: any) => (
        <Tag color={record.platform === 'facebook_post' ? 'orange' : record.platform === 'facebook_reels' ? 'purple' : 'blue'} className="text-[11px] font-medium">
          {val || record.platform}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        if (status === 'published') return <Tag color="success" className="flex items-center gap-1 w-fit text-[11px]"><CheckCircle size={12} /> Đã Đăng</Tag>;
        if (status === 'scheduled') return <Tag color="processing" className="flex items-center gap-1 w-fit text-[11px]"><Clock size={12} /> Chờ Đăng</Tag>;
        if (status === 'archived') return <Tag color="warning" className="flex items-center gap-1 w-fit text-[11px]"><Archive size={12} /> Lưu Trữ (Xoá Mềm)</Tag>;
        if (status === 'failed') return <Tag color="error" className="flex items-center gap-1 w-fit text-[11px]"><AlertCircle size={12} /> Lỗi Đăng</Tag>;
        return <Tag color="default" className="text-[11px]">Bản Nháp</Tag>;
      },
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (val: string, record: any) => (
        <span className="text-[11px] text-[var(--color-muted-fg)] font-mono">
          {new Date(record.publishedAt || record.scheduledAt || val).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 140,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          {record.status === 'archived' ? (
            <Tooltip title="Khôi phục bài viết">
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} className="text-indigo-500" />}
                loading={restorePostMutation.isPending}
                onClick={async () => {
                  await restorePostMutation.mutateAsync(record.id);
                  message.success('Đã khôi phục bài viết thành công');
                }}
              />
            </Tooltip>
          ) : (
            <>
              {record.status !== 'published' && (
                <Tooltip title="Đăng ngay lên Facebook">
                  <Button
                    type="text"
                    size="small"
                    icon={<Send size={14} className="text-emerald-500" />}
                    loading={publishPostMutation.isPending}
                    onClick={() => publishPostMutation.mutateAsync(record.id)}
                  />
                </Tooltip>
              )}
              {record.externalPostId && (
                <Tooltip title="Xem bài viết trên Facebook">
                  <Button
                    type="text"
                    size="small"
                    icon={<ExternalLink size={14} className="text-blue-500" />}
                    onClick={() => window.open(`https://facebook.com/${record.externalPostId}`, '_blank')}
                  />
                </Tooltip>
              )}
              <Tooltip title="Đưa vào lưu trữ (Xoá mềm - tự xoá sau 30 ngày)">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận đưa vào lưu trữ (Xoá mềm)',
                      content: 'Bài viết sẽ được đưa vào mục Lưu Trữ và tự động xoá vĩnh viễn sau 30 ngày nếu không khôi phục.',
                      okText: 'Đưa Vào Lưu Trữ',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => {
                        await deletePostMutation.mutateAsync(record.id);
                        message.success('Đã chuyển bài viết vào mục lưu trữ');
                      },
                    });
                  }}
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

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
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-fg)] flex items-center gap-2">
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
            children: (
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
                        <span className="text-[11px] text-[var(--color-muted-fg)]">Ví dụ: Giới thiệu tính năng CRM Cloud</span>
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
            ),
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
              <Card className="rounded-2xl shadow-sm border border-[var(--color-border)] mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[var(--color-fg)]">
                      Tất Cả Bài Viết ({postsQuery.data?.length || 0})
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="small"
                        checked={showArchived}
                        onChange={(checked) => setShowArchived(checked)}
                      />
                      <span className="text-xs text-[var(--color-muted-fg)]">
                        Hiển thị bài lưu trữ (Xoá mềm)
                      </span>
                    </div>
                  </div>
                  <Button
                    size="small"
                    icon={<RefreshCw size={12} />}
                    onClick={() => postsQuery.refetch()}
                    className="rounded-lg text-xs"
                  >
                    Làm Mới
                  </Button>
                </div>
                <Table
                  dataSource={postsQuery.data || []}
                  columns={columns}
                  rowKey="id"
                  loading={postsQuery.isLoading}
                  pagination={{ pageSize: 8 }}
                  size="small"
                  className="rounded-xl overflow-hidden text-xs"
                />
              </Card>
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
            children: (
              <Card className="rounded-2xl shadow-sm border border-[var(--color-border)] mt-2 max-w-3xl">
                <Form
                  form={settingsForm}
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  className="space-y-4"
                >
                  <Form.Item
                    name="autoReplyEnabled"
                    valuePropName="checked"
                    label={
                      <span className="font-semibold text-xs text-[var(--color-fg)]">
                        Bật Tự Động Trả Lời Bình Luận Trên Facebook
                      </span>
                    }
                  >
                    <Switch className="bg-gray-300" />
                  </Form.Item>

                  <Form.Item
                    name="template"
                    label={
                      <span className="font-semibold text-xs text-[var(--color-fg)]">
                        Mẫu Câu Trả Lời Tự Động (Template)
                      </span>
                    }
                    extra="Sử dụng từ khóa {contact_link} để gán liên kết Form Contact tự động."
                  >
                    <TextArea
                      rows={4}
                      placeholder="Cảm ơn bạn đã quan tâm. Bạn có thể gửi thông tin yêu cầu tư vấn trực tiếp qua liên kết sau: {contact_link}"
                      className="rounded-xl text-xs p-3 font-sans"
                    />
                  </Form.Item>

                  <Form.Item
                    name="portfolioContactLink"
                    label={
                      <span className="font-semibold text-xs text-[var(--color-fg)] flex items-center gap-1.5">
                        <LinkIcon size={14} className="text-indigo-500" />
                        Đường Dẫn Form Liên Hệ (Portfolio Contact Form Link)
                      </span>
                    }
                  >
                    <Input
                      placeholder="https://xantivation.com/contact"
                      className="rounded-xl text-xs font-mono"
                    />
                  </Form.Item>

                  <div className="pt-3 border-t border-[var(--color-border)]">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateCommentSettingsMutation.isPending}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 px-6 text-xs font-medium"
                    >
                      Lưu Cấu Hình
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </motion.div>
  );
}
