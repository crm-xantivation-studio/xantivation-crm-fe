'use client';

import React from 'react';
import { useTheme } from './Providers';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
import { Sun, Moon, Bell, Search, LogOut, User, ShieldCheck } from 'lucide-react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

const flagIcons: Record<string, React.ReactNode> = {
  vi: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#c93728" />
      <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15" />
      <path fill="#ff5" d="M18.008 16.366L21.257 14.006 17.241 14.006 16 10.186 14.759 14.006 10.743 14.006 13.992 16.366 12.751 20.186 16 17.825 19.249 20.186 18.008 16.366z" />
    </svg>
  ),
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff" />
      <path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842" />
      <path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842" />
      <path fill="#a62842" d="M2 11.385H31V13.231H2z" />
      <path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z" />
      <path fill="#a62842" d="M1 18.769H31V20.615H1z" />
      <path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842" />
      <path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842" />
      <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e" />
    </svg>
  ),
  zh: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#db362f" />
      <path fill="#ff0" d="M7.958 10.152L7.19 7.786 6.421 10.152 3.934 10.152 5.946 11.614 5.177 13.979 7.19 12.517 9.202 13.979 8.433 11.614 10.446 10.152 7.958 10.152z" />
    </svg>
  ),
  ja: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff" />
      <circle cx="16" cy="16" r="6" fill="#ae232f" />
    </svg>
  ),
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'System Admin';
  const userEmail = user?.email || 'admin@xantivation.com';
  const userRole = user?.role ? user.role.replace('_', ' ') : 'ADMIN';

  const currentLang = i18n.language || 'vi';

  const langMenu: MenuProps['items'] = [
    {
      key: 'vi',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          {flagIcons.vi}
          <span className="text-xs font-medium">Tiếng Việt (VI)</span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('vi'),
    },
    {
      key: 'en',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          {flagIcons.en}
          <span className="text-xs font-medium">English (EN)</span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('en'),
    },
    {
      key: 'zh',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          {flagIcons.zh}
          <span className="text-xs font-medium">Chinese (中文)</span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('zh'),
    },
    {
      key: 'ja',
      label: (
        <div className="flex items-center gap-2 py-0.5">
          {flagIcons.ja}
          <span className="text-xs font-medium">Japanese (日本語)</span>
        </div>
      ),
      onClick: () => i18n.changeLanguage('ja'),
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile-info',
      label: (
        <div className="py-1 px-1">
          <p className="font-bold text-xs text-[var(--color-fg)] leading-tight">{userName}</p>
          <p className="text-[10px] font-mono text-[var(--color-muted-fg)] truncate max-w-[180px]">{userEmail}</p>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded mt-1">
            <ShieldCheck size={9} /> {userRole}
          </span>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'theme-toggle',
      label: (
        <div className="flex items-center justify-between py-1 text-xs font-semibold text-[var(--color-fg)]">
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
          </span>
        </div>
      ),
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      key: 'profile',
      label: <Link href="/settings">{t('header.myProfile', 'Hồ sơ cá nhân')}</Link>,
      icon: <User size={14} />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('header.logout', 'Đăng xuất'),
      icon: <LogOut size={14} />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-16 mt-4 mr-4 ml-4 lg:ml-2 rounded-lg bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] px-5 flex items-center justify-between sticky top-4 z-40 shadow-xs transition-colors duration-300">
      {/* Search Bar - Layout 3 Integrated Command Center */}
      <div className="relative w-80 max-w-xs group">
        <span className="absolute left-3 top-2.5 text-[var(--color-muted-fg)] group-hover:text-[var(--color-fg)] transition-colors pointer-events-none">
          <Search size={15} />
        </span>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder', 'Tìm kiếm... (Ctrl+K)')}
          className="w-full bg-[var(--color-surface)]/70 border border-transparent rounded-full py-1.5 pl-9 pr-10 text-xs font-sans text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-bg)] transition-all duration-200"
        />
        <span className="absolute right-3 top-2 text-[10px] font-mono text-[var(--color-muted-fg)] bg-[var(--color-bg)] border border-[var(--color-border)] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
          ⌘K
        </span>
      </div>

      {/* Utilities & User Profile Panel */}
      <div className="flex items-center gap-3">
        {/* Language Selector with SVG Flags */}
        <Dropdown menu={{ items: langMenu }} trigger={['click']}>
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-fg)] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono">
            {flagIcons[currentLang] || flagIcons.vi}
            <span className="uppercase text-[11px] font-bold text-[var(--color-fg)]">{currentLang}</span>
          </button>
        </Dropdown>

        {/* Ghost Notifications Icon */}
        <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all relative cursor-pointer">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* Hairline Separator */}
        <div className="w-[1px] h-4 bg-[var(--color-border)] opacity-60 mx-0.5" />

        {/* User Profile Avatar & Dropdown */}
        <Dropdown menu={{ items: userMenu }} trigger={['click']}>
          <div className="flex items-center gap-2.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-all">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block leading-tight pr-1">
              <p className="text-xs font-bold text-[var(--color-fg)] truncate max-w-[120px]">{userName}</p>
              <span className="text-[9px] font-mono text-[var(--color-accent)] font-semibold">
                {userRole}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
