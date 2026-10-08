'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Tag, Spin, Tooltip, message as antMessage, Dropdown } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  User,
  Bot,
  UserCheck,
  Paperclip,
  Smile,
  Zap,
  MessageSquare,
  Globe,
  Sparkles
} from 'lucide-react';
import { useConversationMessages } from '@/hooks/api/useConversationMessages';
import { useAIStatus, useToggleAIMode } from '@/hooks/api/useConversation';

import { FacebookIcon, TelegramIcon, ZaloIcon, WhatsAppIcon, InstagramIcon, EmailIcon, WebIcon } from '@/components/icons/SocialIcons';

interface NativeChatWindowProps {
  conversation: any;
  onRefresh?: () => void;
}

export default function NativeChatWindow({ conversation, onRefresh }: NativeChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = conversation?.id || null;
  const { messages, isLoading, sendMessage, isSending } = useConversationMessages(conversationId);
  const { data: aiStatusRes } = useAIStatus(conversationId);
  const toggleAIMutation = useToggleAIMode(conversationId);

  const aiMode = aiStatusRes?.data?.aiMode !== false;

  const handleToggleAI = async () => {
    if (!conversationId) return;
    try {
      const res = await toggleAIMutation.mutateAsync();
      const newMode = res?.data?.aiMode;
      if (newMode) {
        antMessage.success('Đã khôi phục Hermes AI tự động trả lời 24/7!');
      } else {
        antMessage.info('Đã chuyển sang chế độ Sale nhận tư vấn (Tắt AI ngầm)!');
      }
    } catch (e) {
      antMessage.error('Không thể cập nhật trạng thái AI');
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;
    const textToSend = inputText;
    setInputText('');
    try {
      await sendMessage(textToSend);
      if (onRefresh) onRefresh();
    } catch (err) {
      antMessage.error('Không thể gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine channel icon badge (SCRUM-61 & SCRUM-62)
  const getChannelBadge = (channelType?: string) => {
    const type = channelType?.toLowerCase() || '';
    if (type.includes('telegram')) return <Tag color="blue" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><TelegramIcon size={12} /> Telegram</Tag>;
    if (type.includes('facebook') || type.includes('messenger')) return <Tag color="geekblue" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><FacebookIcon size={12} /> Facebook</Tag>;
    if (type.includes('zalo')) return <Tag color="blue" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><ZaloIcon size={12} /> Zalo OA</Tag>;
    if (type.includes('whatsapp')) return <Tag color="green" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><WhatsAppIcon size={12} /> WhatsApp</Tag>;
    if (type.includes('instagram')) return <Tag color="magenta" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><InstagramIcon size={12} /> Instagram</Tag>;
    if (type.includes('email') || type.includes('mail')) return <Tag color="orange" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><EmailIcon size={12} /> Email</Tag>;
    return <Tag color="default" className="rounded-full px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5"><WebIcon size={12} /> Web Widget</Tag>;
  };

  // Quick canned response options
  const cannedItems = [
    { key: '1', label: '/chao - Chao anh/chi, em co the ho tro gi?', onClick: () => setInputText('Dạ chào anh/chị, em có thể hỗ trợ thông tin gì cho mình ạ?') },
    { key: '2', label: '/baogia - Gui bang bao gia CRM Cloud', onClick: () => setInputText('Dạ em xin gửi bảng giá chi tiết các gói CRM Cloud ạ!') },
    { key: '3', label: '/camon - Cam on anh/chi da lien he', onClick: () => setInputText('Cảm ơn anh/chị đã liên hệ với Xantivation Studio ạ!') },
  ];

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-muted-fg)] p-8 space-y-3">
        <MessageSquare size={36} className="stroke-1 text-[var(--color-muted-fg)]/40" />
        <p className="text-xs">Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn tin.</p>
      </div>
    );
  }

  const contactName = conversation?.contact?.name || conversation?.meta?.sender?.name || 'Khách hàng';
  const contactEmail = conversation?.contact?.email || conversation?.meta?.sender?.email;
  const contactPhone = conversation?.contact?.phoneNumber || conversation?.meta?.sender?.phone_number;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--color-bg)]">
      {/* Header Bar - Borderless & Spacious */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]/40 flex justify-between items-center bg-[var(--color-surface)]/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {contactName[0]?.toUpperCase() || 'K'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[var(--color-bg)] rounded-full" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--color-fg)]">
                {contactName}
              </h3>
              {getChannelBadge(conversation.channel_type || conversation.meta?.channel || conversation.inbox?.channel_type)}
            </div>
            <span className="text-[11px] text-[var(--color-muted-fg)]">
              {contactEmail || contactPhone || `ID: #${conversation.id}`}
            </span>
          </div>
        </div>

        {/* Action Controls & Handover Switches */}
        <div className="flex items-center gap-2.5">
          {aiMode ? (
            <Button
              size="small"
              onClick={handleToggleAI}
              loading={toggleAIMutation.isPending}
              icon={<UserCheck size={14} className="text-amber-500" />}
              className="rounded-xl text-xs bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20 cursor-pointer"
            >
              [Nhận Tư Vấn] (Tắt AI)
            </Button>
          ) : (
            <Button
              size="small"
              onClick={handleToggleAI}
              loading={toggleAIMutation.isPending}
              icon={<Sparkles size={14} className="text-indigo-500" />}
              className="rounded-xl text-xs bg-indigo-500/10 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/20 cursor-pointer"
            >
              [Bật Lại AI Assistance]
            </Button>
          )}

          <Tag color="cyan" className="rounded-full px-3 py-1 font-mono uppercase text-[10px] font-bold">
            {conversation.status || 'Open'}
          </Tag>
        </div>
      </div>

      {/* Message Thread Container - Spacious & Animated */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Spin description="Đang tải lịch sử tin nhắn..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--color-muted-fg)]">
            Chưa có tin nhắn nào trong hội thoại này.
          </div>
        ) : (
          messages.map((msg: any, idx: number) => {
            const isOutgoing = msg.messageType === 'outgoing' || msg.message_type === 1 || msg.sender?.type === 'user' || msg.sender?.type === 'agent_bot';
            const isSystem = msg.messageType === 'activity' || msg.message_type === 2;

            if (isSystem) {
              return (
                <div key={msg.id || idx} className="text-center my-3">
                  <span className="text-[10px] text-[var(--color-muted-fg)] bg-[var(--color-surface)]/50 px-3 py-1 rounded-full border border-[var(--color-border)]/40">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!isOutgoing && (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/50 flex items-center justify-center text-[10px] font-bold text-[var(--color-muted-fg)] shrink-0 mb-1">
                      {conversation.contact?.name?.[0] || 'K'}
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-[5px] text-xs leading-relaxed shadow-sm break-words ${
                      isOutgoing
                        ? 'bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 text-white rounded-br-none'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)]/40 text-[var(--color-fg)] rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isOutgoing && (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-500 shrink-0 mb-1">
                      {aiMode ? <Bot size={14} /> : <User size={14} />}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[var(--color-muted-fg)] mt-1 px-1 font-mono">
                  {msg.createdAt ? new Date(msg.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar - Clean, Modern & Spacious */}
      <div className="p-4 border-t border-[var(--color-border)]/40 bg-[var(--color-surface)]/20 shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: cannedItems }} placement="top" trigger={['click']}>
            <Button size="small" icon={<Zap size={13} className="text-amber-500" />} className="rounded-xl text-xs cursor-pointer">
              Mẫu Trả Lời Nhanh (/code)
            </Button>
          </Dropdown>
          <Tooltip title="Đính kèm tài liệu/ảnh">
            <Button size="small" icon={<Paperclip size={13} />} className="rounded-xl text-xs cursor-pointer" />
          </Tooltip>
        </div>

        <div className="flex items-end gap-3 bg-[var(--color-surface)]/60 border border-[var(--color-border)]/60 rounded-[5px] p-2 focus-within:border-[var(--color-accent)] transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập nội dung tin nhắn tư vấn (Ấn Enter để gửi, Shift+Enter để xuống dòng)..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none text-xs text-[var(--color-fg)] p-2 min-h-[44px] max-h-[120px]"
            rows={2}
          />
          <Button
            type="primary"
            onClick={handleSend}
            loading={isSending}
            disabled={!inputText.trim()}
            icon={<Send size={14} />}
            className="rounded-xl bg-[var(--color-accent)] hover:opacity-90 cursor-pointer h-9 px-4 shrink-0"
          >
            Gửi Tin
          </Button>
        </div>
      </div>
    </div>
  );
}
