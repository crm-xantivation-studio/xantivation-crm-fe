'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  TrendingUp,
  FileText,
  Handshake,
  FileSignature,
  CreditCard,
  MessageSquare,
  BrainCircuit,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: { name: string; path: string }[];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/customers': true,
    '/reports': false,
    '/ai-hub': false,
  });

  // Auto-expand active parent menu when pathname changes
  useEffect(() => {
    if (!pathname) return;
    const allItems = [...coreSalesItems, ...toolItems];
    allItems.forEach((item) => {
      if (item.children && pathname.startsWith(item.path)) {
        setOpenMenus((prev) => ({ ...prev, [item.path]: true }));
      }
    });
  }, [pathname]);

  const toggleSubmenu = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Section 1: Core Sales Operations
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

  // Section 2: Tools, Intelligence & Settings
  const toolItems: SidebarItem[] = [
    { name: t('sidebar.conversations'), path: '/conversations', icon: MessageSquare },
    {
      name: t('sidebar.aiHub'),
      path: '/ai-hub',
      icon: BrainCircuit,
      children: [
        { name: 'AI Chat Console', path: '/ai-hub' },
        { name: 'Dashboard', path: '/ai-hub/dashboard' },
        { name: 'Workflow Monitor', path: '/ai-hub/workflow-monitor' },
      ],
    },
    { name: t('sidebar.reports'), path: '/reports', icon: BarChart3 },
    { name: t('sidebar.settings'), path: '/settings', icon: Settings },
  ];

  const logoSrc = theme === 'dark' ? '/White_Logo.png' : '/Black_Logo.png';

  const getIsActive = (itemPath: string) => {
    if (!pathname) return false;
    if (itemPath === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/';
    }
    if (itemPath === '/ai-hub') {
      return pathname === '/ai-hub' || pathname === '/ai-hub/';
    }
    return pathname.startsWith(itemPath);
  };

  const renderNavList = (items: SidebarItem[]) => (
    <div className="space-y-1">
      {items.map((item, iIdx) => {
        const isActive = getIsActive(item.path);
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.path] ?? false;

        const childMenuItems: MenuProps['items'] = hasChildren
          ? item.children?.map((sub, sIdx) => ({
              key: sub.path || sIdx,
              label: (
                <Link href={sub.path} className="font-semibold text-xs py-1 px-1 block text-[var(--color-fg)]">
                  {sub.name}
                </Link>
              ),
            }))
          : [];

        const itemContent = (
          <div className="block relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center rounded-md text-xs font-semibold transition-all duration-200 w-full py-2 relative z-10 ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive && !hasChildren
                  ? 'az-sidebar-active'
                  : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Link
                href={item.path}
                onClick={() => {
                  if (hasChildren && !collapsed && !isOpen) {
                    setOpenMenus((prev) => ({ ...prev, [item.path]: true }));
                  }
                }}
                className={`flex items-center flex-1 min-w-0 ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? 'var(--color-accent)' : undefined }}
                  className={`shrink-0 ${isActive ? '!text-[var(--color-accent)]' : 'text-[var(--color-muted-fg)] group-hover/item:text-[var(--color-fg)]'}`}
                />
                <span
                  className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    collapsed ? 'max-w-0 opacity-0 pointer-events-none hidden' : 'max-w-[150px] opacity-100 ml-3'
                  }`}
                >
                  {item.name}
                </span>
              </Link>

              {/* Dropdown toggle arrow button */}
              {hasChildren && !collapsed && (
                <button
                  onClick={(e) => toggleSubmenu(item.path, e)}
                  className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors cursor-pointer ml-auto shrink-0"
                  title="Toggle submenu"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-[var(--color-muted-fg)] ${
                      isOpen ? 'rotate-180 text-[var(--color-fg)]' : ''
                    }`}
                  />
                </button>
              )}

              {isActive && !hasChildren && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
              )}
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
            ) : (
              itemContent
            )}

            {/* Submenu Dropdown List (Expanded Mode) */}
            {hasChildren && !collapsed && (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="ml-6 pl-2.5 border-l border-[var(--color-border)]/60 space-y-0.5 overflow-hidden"
                  >
                    {item.children?.map((sub, sIdx) => {
                      const isSubActive = pathname === sub.path;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.path}
                          className={`block py-1.5 px-2.5 rounded-md text-[11px] font-medium transition-colors duration-150 ${
                            isSubActive
                              ? 'text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/20'
                              : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]/50'
                          }`}
                        >
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
    <aside
      className={`h-[calc(100dvh-2rem)] my-4 ml-2 sticky top-4 left-0 az-sidebar transition-[width] duration-300 ease-in-out z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col justify-between h-full relative">

        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden py-4">
          {/* Header Section (Logo without background) */}
          <div className={`flex items-center transition-all duration-300 mb-4 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
            <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
              <img
                src={logoSrc}
                alt="Logo"
                className="h-6 w-6 object-contain shrink-0 filter dark:invert-0"
              />
              <div
                className={`flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  collapsed ? 'max-w-0 opacity-0 pointer-events-none hidden' : 'max-w-[160px] opacity-100'
                }`}
              >
                <span className="text-sm font-bold font-sans text-[var(--color-fg)] tracking-tight">
                  XANTIVATION CRM
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2 px-2.5">
            {renderNavList(coreSalesItems)}

            {/* Subtle Gradient Hairline Separator */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-2 opacity-70" />

            {renderNavList(toolItems)}
          </nav>
        </div>

        {/* Subtle Gradient Hairline Separator above footer */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-70" />

        {/* Collapse Toggle Footer */}
        <div className="p-2.5 flex items-center justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 px-2 rounded-md border border-[var(--color-sidebar-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] flex items-center justify-center transition-colors duration-200 cursor-pointer text-xs font-semibold gap-2"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span className="text-[11px] font-mono tracking-wider uppercase">COLLAPSE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
