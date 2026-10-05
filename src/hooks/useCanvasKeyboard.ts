'use client';

import { useEffect, useCallback } from 'react';

interface UseCanvasKeyboardProps {
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onDeleteSelected?: () => void;
  onSelectAll?: () => void;
  onAutoLayout?: () => void;
}

export function useCanvasKeyboard({
  onFitView,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDeleteSelected,
  onSelectAll,
  onAutoLayout,
}: UseCanvasKeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore shortcut if user is currently typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // '1' -> Fit view
      if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onFitView?.();
        return;
      }

      // '0' -> Reset zoom
      if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onResetZoom?.();
        return;
      }

      // '+' or '=' -> Zoom In
      if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onZoomIn?.();
        return;
      }

      // '-' or '_' -> Zoom Out
      if ((e.key === '-' || e.key === '_') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onZoomOut?.();
        return;
      }

      // Delete or Backspace -> Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteSelected?.();
        return;
      }

      // Ctrl+A / Cmd+A -> Select All
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        onSelectAll?.();
        return;
      }

      // Shift+Alt+T -> Auto Layout / Tidy up
      if (e.shiftKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        onAutoLayout?.();
        return;
      }
    },
    [
      onFitView,
      onZoomIn,
      onZoomOut,
      onResetZoom,
      onDeleteSelected,
      onSelectAll,
      onAutoLayout,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
