'use client';

import React from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] font-medium flex items-center">
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
        {hint && <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">{hint}</span>}
      </div>
      <div className="w-full">{children}</div>
      {error && (
        <p className="text-red-500 text-[10px] font-mono mt-0.5 leading-tight flex items-center gap-1 animate-fadeIn">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
