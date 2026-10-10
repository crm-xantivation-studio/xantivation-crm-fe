'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Hash,
  Link as LinkIcon,
  Smile,
  Quote,
  Sparkles,
  Heading,
} from 'lucide-react';
import { Tooltip, Popover } from 'antd';

export interface WYSIWYGToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  className?: string;
}

const COMMON_EMOJIS = [
  '🚀', '💡', '📈', '✨', '🎯', '🔥', '📌', '🤖', '💼', '✅',
  '🌟', '📢', '💬', '⚡', '📊', '🏆', '💎', '🔑', '🤝', '❤️'
];

export function WYSIWYGToolbar({ onInsert, className = '' }: WYSIWYGToolbarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  return (
    <div className={`flex items-center gap-1 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex-wrap ${className}`}>
      <Tooltip title="In đậm (Bold - **text**)">
        <button
          type="button"
          onClick={() => onInsert('**', '**', 'văn bản in đậm')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Bold size={14} />
        </button>
      </Tooltip>

      <Tooltip title="In nghiêng (Italic - *text*)">
        <button
          type="button"
          onClick={() => onInsert('*', '*', 'văn bản in nghiêng')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Italic size={14} />
        </button>
      </Tooltip>

      <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />

      <Tooltip title="Tiêu đề Hook (Headline)">
        <button
          type="button"
          onClick={() => onInsert('## 🎯 ', '\n', 'TIÊU ĐỀ THU HÚT KHÁCH HÀNG')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Heading size={14} />
        </button>
      </Tooltip>

      <Tooltip title="Danh sách gạch đầu dòng (Bullet List)">
        <button
          type="button"
          onClick={() => onInsert('• ', '', 'Lợi ích / Giá trị 1\n• Lợi ích / Giá trị 2')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <List size={14} />
        </button>
      </Tooltip>

      <Tooltip title="Danh sách đánh số (Numbered List)">
        <button
          type="button"
          onClick={() => onInsert('1. ', '', 'Bước 1\n2. Bước 2')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ListOrdered size={14} />
        </button>
      </Tooltip>

      <Tooltip title="Trích dẫn / Lời chứng thực (Quote)">
        <button
          type="button"
          onClick={() => onInsert('> 💬 "', '" - Đánh giá từ đối tác')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Quote size={14} />
        </button>
      </Tooltip>

      <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />

      <Tooltip title="Chèn Hashtag (#)">
        <button
          type="button"
          onClick={() => onInsert('#', '', 'XantivationCRM #AIBusiness')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Hash size={14} />
        </button>
      </Tooltip>

      <Tooltip title="Chèn Kêu gọi hành động (Call To Action - Link)">
        <button
          type="button"
          onClick={() => onInsert('👉 Khám phá ngay: [Đăng ký Demo](', ')')}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <LinkIcon size={14} />
        </button>
      </Tooltip>

      <Popover
        content={
          <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onInsert(emoji + ' ');
                  setEmojiOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-base hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        }
        trigger="click"
        open={emojiOpen}
        onOpenChange={setEmojiOpen}
        placement="bottom"
      >
        <Tooltip title="Chèn Emoji Marketing">
          <button
            type="button"
            className="p-1.5 rounded-lg text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Smile size={14} />
          </button>
        </Tooltip>
      </Popover>
    </div>
  );
}
