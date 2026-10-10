'use client';

import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

export interface FormSelectProps extends SelectProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export function FormSelect({
  label,
  required = false,
  error,
  className = '',
  containerClassName = '',
  status,
  ...props
}: FormSelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] font-medium flex items-center justify-between">
        <span className="flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </span>
      </label>
      <Select
        status={error ? 'error' : status}
        className={`w-full h-11 text-xs rounded-xl transition-all ${
          error ? 'border-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-[10px] font-mono mt-0.5 leading-tight flex items-center gap-1 animate-fadeIn">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
