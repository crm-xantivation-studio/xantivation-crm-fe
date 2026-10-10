'use client';

import React from 'react';
import {
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  MoreHorizontal,
  Check,
  Eye,
  Sparkles,
  ExternalLink,
  Repeat2,
  BadgeCheck,
} from 'lucide-react';
import { FacebookIcon, TelegramIcon, LinkedInIcon, ZaloIcon } from '@/components/icons/SocialIcons';

export interface SocialPostMockupProps {
  platform: 'facebook' | 'telegram' | 'linkedin' | 'zalo' | string;
  title?: string;
  content: string;
  hashtags?: string[];
  visualPrompt?: string;
  mediaUrl?: string;
  brandName?: string;
}

// Formatter to render formatted text with styled hashtags and links
function renderFormattedContent(text: string, platform: string) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Highlight hashtags in platform primary color
        const words = line.split(/(\s+)/);
        const hashtagColor =
          platform === 'facebook'
            ? 'text-blue-500 font-semibold'
            : platform === 'linkedin'
            ? 'text-sky-600 font-semibold dark:text-sky-400'
            : platform === 'telegram'
            ? 'text-cyan-400 font-semibold'
            : 'text-blue-600 font-semibold';

        return (
          <p key={idx} className="break-words">
            {words.map((word, wIdx) => {
              if (word.startsWith('#') && word.length > 1) {
                return (
                  <span key={wIdx} className={`${hashtagColor} hover:underline cursor-pointer`}>
                    {word}
                  </span>
                );
              }
              if (word.startsWith('http://') || word.startsWith('https://')) {
                return (
                  <a
                    key={wIdx}
                    href={word}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {word}
                  </a>
                );
              }
              if (word.startsWith('**') && word.endsWith('**') && word.length > 4) {
                return <strong key={wIdx} className="font-bold text-white">{word.slice(2, -2)}</strong>;
              }
              if (word.startsWith('*') && word.endsWith('*') && word.length > 2) {
                return <em key={wIdx} className="italic text-neutral-200">{word.slice(1, -1)}</em>;
              }
              return word;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function SocialPostMockup({
  platform,
  title,
  content,
  hashtags = [],
  visualPrompt,
  mediaUrl,
  brandName = 'Xantivation Studio',
}: SocialPostMockupProps) {
  const normPlatform = platform.toLowerCase();

  // 1. Facebook Feed Mockup
  if (normPlatform.includes('facebook') || normPlatform === 'fb') {
    return (
      <div className="bg-[#242526] text-[#E4E6EB] rounded-xl border border-neutral-800 shadow-xl overflow-hidden max-w-lg mx-auto font-sans">
        {/* Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-neutral-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-blue-500/30">
              XS
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold text-sm text-white">
                <span>{brandName}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px]">
                  ✓
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#B0B3B8]">
                <span>Vừa xong</span>
                <span>·</span>
                <Globe size={11} className="text-[#B0B3B8]" />
              </div>
            </div>
          </div>
          <button className="text-[#B0B3B8] hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 text-xs sm:text-[13px] text-[#E4E6EB]">
          {title && (
            <h3 className="font-bold text-sm sm:text-base text-white mb-2 leading-snug">
              {title}
            </h3>
          )}
          {renderFormattedContent(content, 'facebook')}

          {hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-blue-400 font-medium">
              {hashtags.map((h, i) => (
                <span key={i} className="hover:underline cursor-pointer">
                  {h.startsWith('#') ? h : `#${h}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visual Media Card */}
        {visualPrompt && (
          <div className="border-t border-b border-neutral-800 bg-neutral-900/80 p-4 text-center relative group">
            <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-neutral-900 flex flex-col items-center justify-center p-4 border border-indigo-500/20">
              <Sparkles size={24} className="text-indigo-400 mb-2 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-300 mb-1">
                Visual Art Preview Suggestion
              </span>
              <p className="text-[11px] text-neutral-400 max-w-sm italic">
                "{visualPrompt}"
              </p>
            </div>
          </div>
        )}

        {/* Engagement Counters */}
        <div className="px-3.5 py-2 flex items-center justify-between text-xs text-[#B0B3B8] border-b border-neutral-800/60">
          <div className="flex items-center gap-1.5">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">👍</span>
              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white">❤️</span>
            </span>
            <span>48</span>
          </div>
          <div className="flex items-center gap-3">
            <span>12 bình luận</span>
            <span>5 chia sẻ</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-[#B0B3B8]">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-800/80 hover:text-white transition-colors cursor-pointer">
            <ThumbsUp size={15} />
            <span>Thích</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-800/80 hover:text-white transition-colors cursor-pointer">
            <MessageCircle size={15} />
            <span>Bình luận</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-neutral-800/80 hover:text-white transition-colors cursor-pointer">
            <Share2 size={15} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Telegram Message Mockup
  if (normPlatform.includes('telegram')) {
    return (
      <div className="bg-[#0e1621] text-[#f5f5f5] rounded-xl border border-neutral-800 shadow-xl overflow-hidden max-w-lg mx-auto font-sans">
        {/* Telegram Chat Header */}
        <div className="bg-[#17212b] p-3 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              XA
            </div>
            <div>
              <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span>Xantivation AI Community</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">1,420 subscribers</span>
            </div>
          </div>
          <div className="text-neutral-400 text-xs flex items-center gap-2">
            <TelegramIcon className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Telegram Message Bubble */}
        <div className="p-4 bg-[#0e1621]">
          <div className="bg-[#182533] border border-cyan-900/30 rounded-2xl rounded-tl-xs p-3.5 space-y-2.5 shadow-md relative">
            <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between">
              <span>{brandName} [Broadcast]</span>
            </div>

            {title && (
              <h3 className="font-bold text-sm text-white border-b border-neutral-700/50 pb-1.5">
                {title}
              </h3>
            )}

            <div className="text-xs text-neutral-200 leading-relaxed font-sans">
              {renderFormattedContent(content, 'telegram')}
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px] text-cyan-400 font-mono pt-1">
                {hashtags.map((h, i) => (
                  <span key={i}>{h.startsWith('#') ? h : `#${h}`}</span>
                ))}
              </div>
            )}

            {visualPrompt && (
              <div className="mt-2 rounded-xl bg-[#242f3d] p-3 border border-cyan-500/20 text-center">
                <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-1">📷 Media Preview</span>
                <p className="text-[11px] text-neutral-300 italic">{visualPrompt}</p>
              </div>
            )}

            {/* Bubble Footer */}
            <div className="flex items-center justify-end gap-2 pt-1 text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Eye size={11} /> 1.2K
              </span>
              <span>16:45</span>
              <Check size={11} className="text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. LinkedIn Feed Mockup
  if (normPlatform.includes('linkedin')) {
    return (
      <div className="bg-[#1b1f23] text-neutral-200 rounded-xl border border-neutral-800 shadow-xl overflow-hidden max-w-lg mx-auto font-sans">
        {/* Header */}
        <div className="p-3.5 flex items-start justify-between border-b border-neutral-800/60">
          <div className="flex items-start gap-2.5">
            <div className="w-11 h-11 rounded-lg bg-sky-800 flex items-center justify-center text-white font-bold text-sm ring-1 ring-sky-500/40">
              XS
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold text-xs text-white">
                <span>{brandName}</span>
                <span className="text-[10px] text-neutral-400 font-normal">· 1st</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                AI Solutions & CRM Automation for Global Enterprises
              </p>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                <span>1d · Edited · </span>
                <Globe size={10} />
              </div>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-white p-1">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 text-xs text-neutral-100 space-y-2">
          {title && (
            <h3 className="font-bold text-sm text-white mb-1">
              {title}
            </h3>
          )}
          {renderFormattedContent(content, 'linkedin')}

          {hashtags.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5 text-xs text-sky-400 font-medium">
              {hashtags.map((h, i) => (
                <span key={i} className="hover:underline cursor-pointer">
                  {h.startsWith('#') ? h : `#${h}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {visualPrompt && (
          <div className="border-t border-b border-neutral-800 bg-neutral-900/90 p-4 text-center">
            <div className="rounded-lg bg-sky-950/30 border border-sky-500/20 p-4">
              <span className="text-xs font-semibold text-sky-300 block mb-1">Infographic / Slide Carousel Proposal</span>
              <p className="text-xs text-neutral-300 italic">{visualPrompt}</p>
            </div>
          </div>
        )}

        {/* Engagement Bar */}
        <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800/60">
          <span>👏 💡 ❤️ 64 reactions</span>
          <span>18 comments · 4 reposts</span>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-1 flex items-center justify-around text-xs text-neutral-300 font-medium">
          <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <ThumbsUp size={14} />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <MessageCircle size={14} />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <Repeat2 size={14} />
            <span>Repost</span>
          </button>
          <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Fallback / Zalo OA Mockup
  return (
    <div className="bg-[#18181b] text-neutral-100 rounded-xl border border-neutral-800 shadow-xl overflow-hidden max-w-lg mx-auto font-sans p-4 space-y-3">
      <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
        <ZaloIcon className="w-6 h-6 text-blue-500" />
        <div>
          <h4 className="font-bold text-xs text-white">{brandName} (Zalo Official Account)</h4>
          <span className="text-[10px] text-neutral-400 font-mono">Xác thực doanh nghiệp · Đăng tự động</span>
        </div>
      </div>

      {title && <h3 className="font-bold text-sm text-white">{title}</h3>}
      <div className="text-xs leading-relaxed text-neutral-200">
        {renderFormattedContent(content, 'zalo')}
      </div>

      {visualPrompt && (
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
          <span className="text-[10px] font-mono text-blue-400 block mb-1">Banner Zalo Article</span>
          <p className="text-xs text-neutral-300 italic">{visualPrompt}</p>
        </div>
      )}
    </div>
  );
}
