'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MagneticButton from './MagneticButton';

export interface ColumnProps<T> {
  title: string;
  dataIndex: keyof T;
  key: string;
  render?: (value: any, record: T) => React.ReactNode;
}

interface SharedTableProps<T> {
  columns: ColumnProps<T>[];
  dataSource: T[];
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  actionsLabel?: string;
  rowSelection?: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  };
}

export default function SharedTable<T extends { id: string }>({
  columns,
  dataSource,
  onEdit,
  onDelete,
  actionsLabel = 'Actions',
  rowSelection,
}: SharedTableProps<T>) {
  const { t } = useTranslation();
  const effectiveActionsLabel = actionsLabel || t('common.actions');
  const isAllSelected = dataSource.length > 0 && rowSelection?.selectedRowKeys.length === dataSource.length;
  
  const handleSelectAll = (checked: boolean) => {
    if (!rowSelection) return;
    if (checked) {
      const keys = dataSource.map(d => d.id);
      rowSelection.onChange(keys, dataSource);
    } else {
      rowSelection.onChange([], []);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!rowSelection) return;
    let newKeys = [...rowSelection.selectedRowKeys];
    if (checked) {
      newKeys.push(id);
    } else {
      newKeys = newKeys.filter(k => k !== id);
    }
    const newRows = dataSource.filter(d => newKeys.includes(d.id));
    rowSelection.onChange(newKeys, newRows);
  };

  return (
    <div className="-mx-2 sm:-mx-6 overflow-hidden">
      <div className="w-full overflow-x-auto py-2 px-1">
        <table className="w-full text-left border-collapse table-auto group/table">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {rowSelection && (
              <th className="px-3 py-2.5 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-xs font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium"
              >
                {col.title}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-3 py-2.5 text-xs font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium text-right">
                {effectiveActionsLabel}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record) => {
            const isSelected = rowSelection?.selectedRowKeys.includes(record.id) || false;
            return (
              <tr
                key={record.id}
                className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-accent)]/[0.02] hover:!opacity-100 group/row transition-all duration-200 group-hover/table:opacity-50 ${
                  isSelected ? 'bg-[var(--color-accent)]/[0.015]' : ''
                }`}
              >
                {rowSelection && (
                  <td className="px-3 py-2.5 w-12">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(record.id, e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-xs font-medium text-[var(--color-fg)]">
                    {col.render ? col.render(record[col.dataIndex], record) : (record[col.dataIndex] as any)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-2.5 text-right text-xs">
                    <div className="opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1.5 justify-end">
                      {onEdit && (
                        <MagneticButton range={30}>
                          <button
                            onClick={() => onEdit(record)}
                            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all duration-150 cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>
                        </MagneticButton>
                      )}
                      {onDelete && (
                        <MagneticButton range={30}>
                          <button
                            onClick={() => onDelete(record)}
                            className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-all duration-150 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </MagneticButton>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
          {dataSource.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (rowSelection ? 1 : 0) + ((onEdit || onDelete) ? 1 : 0)}
                className="px-3 py-8 text-center text-xs text-[var(--color-muted-fg)] font-mono"
              >
                {t('common.noData')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
}
