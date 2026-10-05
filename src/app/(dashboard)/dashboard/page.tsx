'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth.types';
import { Skeleton } from 'antd';
import SalesDashboard from '@/components/dashboard/SalesDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AccountantDashboard from '@/components/dashboard/AccountantDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton.Input active size="large" style={{ width: 200 }} />
          <Skeleton.Input active size="small" style={{ width: 350, marginTop: 8 }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3)
            .fill(null)
            .map((_, idx) => (
              <div key={idx} className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 h-28 flex flex-col justify-between">
                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <Skeleton.Input active size="default" style={{ width: 80 }} />
              </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 h-80">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 h-80">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  // Headings based on role
  const headings = {
    [UserRole.SALES_REP]: {
      title: t('dashboard.myDashboard'),
      subtitle: t('dashboard.myDashboardSub'),
    },
    [UserRole.SALES_MANAGER]: {
      title: t('dashboard.salesManagement'),
      subtitle: t('dashboard.salesManagementSub'),
    },
    [UserRole.ACCOUNTANT]: {
      title: t('dashboard.financial'),
      subtitle: t('dashboard.financialSub'),
    },
    [UserRole.ADMIN]: {
      title: t('dashboard.systemAdmin'),
      subtitle: t('dashboard.systemAdminSub'),
    },
  };

  const currentHeading = headings[user.role] || {
    title: t('dashboard.dashboard'),
    subtitle: t('dashboard.overallMetrics'),
  };

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.SALES_REP:
        return <SalesDashboard />;
      case UserRole.SALES_MANAGER:
        return <ManagerDashboard />;
      case UserRole.ACCOUNTANT:
        return <AccountantDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Editorial Title */}
      <div>
        <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">
          {currentHeading.title}
        </h1>
        <p className="text-xs text-[var(--color-muted-fg)]">
          {t('dashboard.welcomeBack')}, {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}. {currentHeading.subtitle}
        </p>
      </div>

      {/* Main dashboard content */}
      {renderDashboard()}
    </div>
  );
}
