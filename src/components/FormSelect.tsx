'use client';

import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

interface FormSelectProps extends SelectProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function FormSelect({
  label,
  required = false,
  error,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] font-medium flex items-center">
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>
      <Select
        className={`w-full h-11 text-xs rounded-xl ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-[10px] font-mono mt-0.5">{error}</p>}
    </div>
  );
}
