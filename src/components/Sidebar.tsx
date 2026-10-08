'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, UserPlus, Building2, TrendingUp, FileText,
  Handshake, FileSignature, CreditCard, MessageSquare, BrainCircuit,
  BarChart3, Settings, Share2, ChevronLeft, ChevronRight, ChevronDown,
  Sun, Moon, Bell, Search, LogOut, User as UserIcon, ShieldCheck
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: { name: string; path: string }[];
}

const flagIcons: Record<string, React.ReactNode> = {
  vi: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#c93728" />
      <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15" />
      <path fill="#ff5" d="M18.008 16.366L21.257 14.006 17.241 14.006 16 10.186 14.759 14.006 10.743 14.006 13.992 16.366 12.751 20.186 16 17.825 19.249 20.186 18.008 16.366z" />
    </svg>
  ),
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#db362f" />
      <path fill="#ff0" d="M7.958 10.152L7.19 7.786 6.421 10.152 3.934 10.152 5.946 11.614 5.177 13.979 7.19 12.517 9.202 13.979 8.433 11.614 10.446 10.152 7.958 10.152z" />
    </svg>
  ),
  ja: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff" />
      <circle cx="16" cy="16" r="6" fill="#ae232f" />
    </svg>
  ),
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'System Admin';
  const userEmail = user?.email || 'admin@xantivation.com';
  const userRole = user?.role ? user.role.replace('_', ' ') : 'ADMIN';
  const currentLang = i18n.language || 'vi';
  const isDraggingRef = useRef(false);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/messaging': true,
    '/customers': true,
    '/reports': false,
    '/ai-hub': false,
  });

  const coreSalesItems: SidebarItem[] = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.leads'), path: '/leads', icon: UserPlus },
    { name: t('sidebar.customers'), path: '/customers', icon: Building2 },
    { name: t('sidebar.opportunities'), path: '/opportunities', icon: TrendingUp },
    { name: t('sidebar.quotations'), path: '/quotations', icon: FileText },
    { name: t('sidebar.deals'), path: '/deals', icon: Handshake },
    { name: t('sidebar.contracts'), path: '/contracts', icon: FileSignature },
    { name: t('sidebar.payments'), path: '/payments', icon: CreditCard },
  ];

  const toolItems: SidebarItem[] = [
    {
      name: t('sidebar.messaging'), path: '/messaging', icon: MessageSquare,
      children: [
        { name: t('sidebar.messagingConversations'), path: '/messaging/conversations' },
        { name: t('sidebar.messagingInboxes'), path: '/messaging/inboxes' },
        { name: t('sidebar.messagingAgentBots'), path: '/messaging/agent-bots' },
        { name: t('sidebar.messagingCannedResponses'), path: '/messaging/canned-responses' },
        { name: t('sidebar.messagingTeams'), path: '/messaging/teams' },
        { name: t('sidebar.messagingConfiguration'), path: '/messaging/configuration' },
      ],
    },
    {
      name: t('sidebar.content'), path: '/content', icon: Share2,
      children: [
        { name: t('sidebar.contentPosts'), path: '/content/posts' },
        { name: 'Agent Canvas', path: '/content/posts/canvas' },
      ],
    },
    {
      name: t('sidebar.aiHub'), path: '/ai-hub', icon: BrainCircuit,
      children: [
        { name: 'AI Chat Console', path: '/ai-hub' },
        { name: 'Dashboard', path: '/ai-hub/dashboard' },
        { name: 'Workflow Monitor', path: '/ai-hub/workflow-monitor' },
        { name: 'Configuration', path: '/ai-hub/configuration' },
      ],
    },
    {
      name: t('sidebar.reports'), path: '/reports', icon: BarChart3,
      children: [
        { name: t('sidebar.reportsOverview'), path: '/reports' },
        { name: t('sidebar.reportsPipeline'), path: '/reports/pipeline' },
        { name: t('sidebar.reportsPayment'), path: '/reports/payment' },
        { name: t('sidebar.reportsForecast'), path: '/reports/sales-forecast' },
      ],
    },
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    if (!pathname) return;
    const allItems = [...coreSalesItems, ...toolItems];
    allItems.forEach((item) => {
      if (item.children && pathname.startsWith(item.path)) {
        setOpenMenus((prev) => ({ ...prev, [item.path]: true }));
      }
    });

    // Auto collapse for secondary sidebars
    if (pathname.startsWith('/messaging/configuration') || pathname.startsWith('/settings')) {
      setCollapsed(true);
    }
  }, [pathname]);

  const toggleSubmenu = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const logoSrc = theme === 'dark' ? '/White_Logo.png' : '/Black_Logo.png';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getIsActive = (itemPath: string) => {
    if (!pathname) return false;
    if (itemPath === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/';
    if (itemPath === '/ai-hub') return pathname === '/ai-hub' || pathname === '/ai-hub/';
    return pathname.startsWith(itemPath);
  };

  const langMenu: MenuProps['items'] = [
    { key: 'vi', label: <div className="flex items-center gap-2 py-0.5">{flagIcons.vi} <span className="text-xs font-medium">Tiếng Việt</span></div>, onClick: () => i18n.changeLanguage('vi') },
    { key: 'en', label: <div className="flex items-center gap-2 py-0.5">{flagIcons.en} <span className="text-xs font-medium">English</span></div>, onClick: () => i18n.changeLanguage('en') },
    { key: 'zh', label: <div className="flex items-center gap-2 py-0.5">{flagIcons.zh} <span className="text-xs font-medium">Chinese</span></div>, onClick: () => i18n.changeLanguage('zh') },
    { key: 'ja', label: <div className="flex items-center gap-2 py-0.5">{flagIcons.ja} <span className="text-xs font-medium">Japanese</span></div>, onClick: () => i18n.changeLanguage('ja') },
  ];

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile-info',
      label: (
        <div className="py-1 px-1">
          <p className="font-bold text-xs text-[var(--color-fg)] leading-tight">{userName}</p>
          <p className="text-[10px] font-mono text-[var(--color-muted-fg)] truncate max-w-[180px]">{userEmail}</p>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'profile', label: <Link href="/settings">Hồ sơ cá nhân</Link>, icon: <UserIcon size={14} /> },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogOut size={14} />, danger: true, onClick: handleLogout },
  ];

  const renderNavList = (items: SidebarItem[]) => (
    <div className="space-y-1">
      {items.map((item, iIdx) => {
        const isActive = getIsActive(item.path);
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.path] ?? false;

        const childMenuItems: MenuProps['items'] = hasChildren ? item.children?.map((sub, sIdx) => ({
          key: sub.path || sIdx,
          label: <Link href={sub.path} className="font-semibold text-[11px] py-1 px-1 block text-[var(--color-fg)]">{sub.name}</Link>,
        })) : [];

        const itemContent = (
          <div className="block relative">
            <motion.div
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`flex items-center rounded-md text-[11px] font-semibold transition-all duration-200 w-full py-1.5 relative z-10 ${collapsed ? 'justify-center px-0' : 'px-3'} ${isActive && !hasChildren ? 'az-sidebar-active' : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]'}`}
            >
              <Link
                href={item.path}
                onClick={() => { if (hasChildren && !collapsed && !isOpen) setOpenMenus((prev) => ({ ...prev, [item.path]: true })); }}
                className={`flex items-center flex-1 min-w-0 ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={15} style={{ color: isActive ? 'var(--color-accent)' : undefined }} className={`shrink-0 ${isActive ? '!text-[var(--color-accent)]' : 'text-[var(--color-muted-fg)] group-hover/item:text-[var(--color-fg)]'}`} />
                <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0 pointer-events-none hidden' : 'max-w-[150px] opacity-100 ml-2.5'}`}>{item.name}</span>
              </Link>

              {hasChildren && !collapsed && (
                <button onClick={(e) => toggleSubmenu(item.path, e)} className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors cursor-pointer ml-auto shrink-0">
                  <ChevronDown size={14} className={`transition-transform duration-200 text-[var(--color-muted-fg)] ${isOpen ? 'rotate-180 text-[var(--color-fg)]' : ''}`} />
                </button>
              )}
              {isActive && !hasChildren && !collapsed && <span className="ml-auto w-1 h-1 rounded-full bg-[var(--color-accent)] shrink-0" />}
            </motion.div>
          </div>
        );

        return (
          <div key={iIdx} className="space-y-0.5 relative group/item">
            {collapsed ? (
              hasChildren ? (
                <Dropdown menu={{ items: childMenuItems }} placement="rightTop" trigger={['hover']}>
                  <div className="w-full cursor-pointer">{itemContent}</div>
                </Dropdown>
              ) : (
                <Tooltip title={item.name} placement="right">
                  <div className="w-full cursor-pointer">{itemContent}</div>
                </Tooltip>
              )
            ) : itemContent}

            {hasChildren && !collapsed && (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="ml-6 pl-2.5 border-l border-[var(--color-border)]/60 space-y-0.5 overflow-hidden"
                  >
                    {item.children?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.path;
                      return (
                        <Link key={sIdx} href={sub.path} className={`block py-1 px-2.5 rounded-md text-[10px] font-medium transition-colors duration-150 ${isSubActive ? 'text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/20' : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]/50'}`}>
                          {sub.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {collapsed && (
          <motion.button
            drag="y"
            dragConstraints={{ top: -400, bottom: 400 }}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 0.95, cursor: 'grabbing' }}
            onDragStart={() => {
              isDraggingRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingRef.current = false;
              }, 100);
            }}
            onClick={() => {
              if (!isDraggingRef.current) {
                setCollapsed(false);
              }
            }}
            className="az-glass-handle fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col justify-center items-center gap-1.5 rounded-r-xl py-6 px-1.5 text-[var(--color-fg)] cursor-grab transition-colors"
            title="Drag vertically or Click to Expand"
          >
            <div className="w-[1.5px] h-2.5 rounded-full bg-[var(--color-fg)]/40" />
            <ChevronRight size={16} strokeWidth={1.5} />
            <div className="w-[1.5px] h-2.5 rounded-full bg-[var(--color-fg)]/40" />
          </motion.button>
        )}
      </AnimatePresence>

      <aside className={`h-screen transition-all duration-300 ease-in-out z-40 relative shrink-0 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}`}>
        <div className="w-64 h-full flex flex-col bg-transparent">
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-5 pb-2 sidebar-scroll">
            {/* Header Section */}
            <div className="flex items-center transition-all duration-300 mb-6 px-5">
              <div className="flex items-center gap-3 w-full">
                <img src={logoSrc} alt="Logo" className="h-7 w-7 object-contain shrink-0 filter dark:invert-0" />
                <div className="flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap max-w-[160px] opacity-100">
                  <span className="text-[15px] font-bold font-sans text-[var(--color-fg)] tracking-tight">XANTIVATION CRM</span>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2 px-3">
              {renderNavList(coreSalesItems)}
              <div className="h-[1px] w-full bg-[var(--color-border)] my-4 opacity-50" />
              {renderNavList(toolItems)}
            </nav>
          </div>

          {/* Footer Section: Utilities & Profile */}
          <div className="mt-auto px-3 pb-4 shrink-0 bg-transparent border-t border-[var(--color-border)]/50 pt-3 flex flex-col gap-3">
            {/* Utility Icons */}
            <div className="flex items-center justify-start gap-1.5 py-1">
              <Dropdown menu={{ items: langMenu }} trigger={['click']} placement="topLeft">
                <button className="p-2 rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-fg)] transition-all cursor-pointer flex items-center justify-center w-9 h-9">
                  {flagIcons[currentLang] || flagIcons.vi}
                </button>
              </Dropdown>

              <button className="p-2 rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all relative cursor-pointer w-9 h-9 flex items-center justify-center">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </button>

              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer w-9 h-9 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>

            {/* User Profile & Collapse Toggle */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="topLeft">
                <div className="flex items-center gap-2.5 cursor-pointer py-1.5 px-1.5 rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all flex-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[13px] font-bold font-mono shadow-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight pr-1 overflow-hidden flex-1">
                    <p className="text-[11px] font-bold text-[var(--color-fg)] truncate">{userName}</p>
                    <span className="text-[9px] font-mono text-[var(--color-muted-fg)] truncate block">
                      {userRole}
                    </span>
                  </div>
                </div>
              </Dropdown>

              <button
                onClick={() => setCollapsed(true)}
                className="w-8 h-8 rounded-xl border border-transparent hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-accent)] flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
