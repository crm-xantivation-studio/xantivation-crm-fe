import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function FacebookIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M13.5 8H15V5.5H12.75C10.68 5.5 9.5 6.88 9.5 8.85V10.5H7.5V13H9.5V19H12.5V13H14.75L15.25 10.5H12.5V9C12.5 8.4 12.8 8 13.5 8Z"
        fill="white"
      />
    </svg>
  );
}

export function TelegramIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="12" fill="#2AABEE" />
      <path
        d="M17.8 7.2L5.8 11.8C5.0 12.1 5.0 12.6 5.6 12.8L8.7 13.8L15.8 9.3C16.1 9.1 16.4 9.3 16.2 9.5L10.4 14.7L10.2 17.8C10.5 17.8 10.7 17.6 10.9 17.4L12.5 15.9L15.8 18.3C16.4 18.6 16.8 18.5 17.0 17.7L19.1 7.8C19.3 6.9 18.7 6.5 17.8 7.2Z"
        fill="white"
      />
    </svg>
  );
}

export function ZaloIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#0068FF" />
      <g transform="matrix(0.8 0 0 0.8 2.4 2.4)">
        <path
          d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"
          fill="white"
        />
      </g>
    </svg>
  );
}

export function WhatsAppIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.5 14.6C17.2 14.45 15.75 13.75 15.5 13.65C15.25 13.55 15.05 13.5 14.85 13.8C14.65 14.1 14.1 14.75 13.9 14.95C13.75 15.15 13.55 15.2 13.25 15.05C12.95 14.9 12 14.6 10.85 13.55C9.95 12.75 9.35 11.75 9.2 11.45C9.05 11.15 9.2 11 9.35 10.85C9.5 10.7 9.65 10.5 9.8 10.35C9.95 10.2 10 10.1 10.1 9.9C10.2 9.7 10.15 9.55 10.1 9.4C10.05 9.25 9.5 7.9 9.25 7.35C9 6.8 8.75 6.9 8.6 6.9C8.45 6.9 8.25 6.9 8.05 6.9C7.85 6.9 7.55 6.95 7.3 7.25C7.05 7.55 6.35 8.2 6.35 9.55C6.35 10.9 7.35 12.2 7.5 12.4C7.65 12.6 9.45 15.4 12.2 16.6C14.95 17.8 14.95 17.4 15.45 17.35C15.95 17.3 17.05 16.7 17.3 16C17.55 15.3 17.55 14.7 17.5 14.6Z"
        fill="white"
      />
    </svg>
  );
}

export function InstagramIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <defs>
        <radialGradient id="ig-grad" cx="20%" cy="100%" r="120%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
      <circle cx="15.8" cy="8.2" r="0.8" fill="white" />
    </svg>
  );
}

export function EmailIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#EA4335" />
      <path
        d="M5 8.5L12 13.5L19 8.5M5 16.5H19V7.5H5V16.5Z"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WebIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-emerald-500 ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function ChannelLogo({ channel, size = 16, className = '' }: { channel?: string; size?: number; className?: string }) {
  const ch = (channel || '').toLowerCase();
  if (ch.includes('telegram')) return <TelegramIcon size={size} className={className} />;
  if (ch.includes('facebook') || ch.includes('messenger')) return <FacebookIcon size={size} className={className} />;
  if (ch.includes('zalo')) return <ZaloIcon size={size} className={className} />;
  if (ch.includes('instagram')) return <InstagramIcon size={size} className={className} />;
  if (ch.includes('whatsapp')) return <WhatsAppIcon size={size} className={className} />;
  if (ch.includes('email') || ch.includes('mail')) return <EmailIcon size={size} className={className} />;
  return <WebIcon size={size} className={className} />;
}
