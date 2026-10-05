'use client';

import React, { useEffect, useRef } from 'react';
import {
  Eye,
  Play,
  Power,
  Copy,
  Trash2,
  Maximize2,
  Shuffle,
  FolderMinus,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'node' | 'cluster' | 'canvas';
  targetId?: string;
  targetData?: any;
}

interface CanvasContextMenuProps {
  menuState: ContextMenuState;
  onClose: () => void;
  onAction: (action: string, targetId?: string, targetData?: any) => void;
}

export function CanvasContextMenu({
  menuState,
  onClose,
  onAction,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (menuState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuState.isOpen, onClose]);

  if (!menuState.isOpen) return null;

  const handleItemClick = (action: string) => {
    onAction(action, menuState.targetId, menuState.targetData);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${menuState.x}px`,
        top: `${menuState.y}px`,
      }}
      className="z-50 min-w-[210px] rounded-xl border border-neutral-700/80 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Node Context Menu */}
      {menuState.type === 'node' && (
        <div className="space-y-0.5 text-xs text-neutral-200">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 mb-1">
            Agent: {menuState.targetData?.name || menuState.targetId}
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('detail')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-indigo-500/20 hover:text-indigo-300 active:scale-98"
          >
            <Eye size={14} className="text-indigo-400" />
            <span>Xem Chi Tiết & Logs</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('run')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-98"
          >
            <Play size={14} className="text-emerald-400 fill-emerald-400/30" />
            <span>Chạy Thử Tác Vụ</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('toggleActive')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <Power size={14} className="text-amber-400" />
            <span>Bật / Tắt Hoạt Động</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('copySlug')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <Copy size={14} className="text-neutral-400" />
            <span>Sao Chép Mã Slug</span>
          </button>

          <div className="my-1 h-[1px] bg-neutral-800" />

          <button
            type="button"
            onClick={() => handleItemClick('delete')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-rose-400 transition-colors hover:bg-rose-500/20 active:scale-98"
          >
            <Trash2 size={14} />
            <span>Xóa Khỏi Canvas</span>
          </button>
        </div>
      )}

      {/* Cluster Context Menu */}
      {menuState.type === 'cluster' && (
        <div className="space-y-0.5 text-xs text-neutral-200">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 mb-1">
            Phòng Ban: {menuState.targetData?.title || menuState.targetId}
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('toggleClusterCollapse')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            {menuState.targetData?.isCollapsed ? (
              <>
                <FolderPlus size={14} className="text-purple-400" />
                <span>Mở Rộng Phòng Ban</span>
              </>
            ) : (
              <>
                <FolderMinus size={14} className="text-purple-400" />
                <span>Thu Gọn Phòng Ban</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('toggleClusterActive')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <Power size={14} className="text-amber-400" />
            <span>Bật / Tắt Cả Phòng Ban</span>
          </button>
        </div>
      )}

      {/* Canvas Empty Space Context Menu */}
      {menuState.type === 'canvas' && (
        <div className="space-y-0.5 text-xs text-neutral-200">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 mb-1">
            Canvas Workspace
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('fitView')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <Maximize2 size={14} className="text-indigo-400" />
            <span>Thu Phóng Vừa Màn Hình (1)</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('autoLayout')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <Shuffle size={14} className="text-emerald-400" />
            <span>Tự Động Sắp Xếp (Tidy Up)</span>
          </button>

          <div className="my-1 h-[1px] bg-neutral-800" />

          <button
            type="button"
            onClick={() => handleItemClick('collapseAllClusters')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <FolderMinus size={14} className="text-purple-400" />
            <span>Thu Gọn Tất Cả Phòng Ban</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('expandAllClusters')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <FolderPlus size={14} className="text-purple-400" />
            <span>Mở Rộng Tất Cả Phòng Ban</span>
          </button>

          <div className="my-1 h-[1px] bg-neutral-800" />

          <button
            type="button"
            onClick={() => handleItemClick('refresh')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-800 active:scale-98"
          >
            <RefreshCw size={14} className="text-neutral-400" />
            <span>Làm Mới Trạng Thái</span>
          </button>
        </div>
      )}
    </div>
  );
}
