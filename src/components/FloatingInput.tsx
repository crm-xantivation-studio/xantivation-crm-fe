'use client';

import React, { useState } from 'react';

export interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  error?: string;
  className?: string;
}

export function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  onBlur,
  error,
  className = '',
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);

  const handleBlur = () => {
    setFocused(false);
    if (onBlur) onBlur();
  };

  const isAlwaysFloating = type === 'date' || type === 'time' || type === 'datetime-local';
  const isFloating = focused || Boolean(value) || isAlwaysFloating;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div
        className={`relative w-full group pt-3.5 pb-1 border-b transition-colors duration-300 ${
          error
            ? 'border-red-500/70'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-hover,var(--color-border))]'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            if (type === 'tel') {
              val = val.replace(/[^0-9+()\s-]/g, '');
            }
            onChange(val);
          }}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className="w-full bg-transparent py-0.5 transition-colors duration-300 outline-none text-[var(--color-fg)] text-xs sm:text-sm font-medium [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
          placeholder={placeholder || ' '}
        />
        <label
          className={`absolute left-0 transition-all duration-300 pointer-events-none ${
            isFloating
              ? `-top-0.5 text-[10px] sm:text-xs font-semibold ${
                  error ? 'text-red-500' : 'text-[var(--color-accent)]'
                }`
              : 'top-3.5 text-xs sm:text-sm text-[var(--color-muted-fg)]'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
        </label>
        {/* Bottom active highlight line */}
        <div
          className={`absolute bottom-[-1px] left-0 h-[2px] transition-all duration-300 ${
            error ? 'bg-red-500' : 'bg-[var(--color-accent)]'
          } ${focused || error ? 'w-full' : 'w-0'}`}
        ></div>
      </div>
      {error && (
        <p className="text-red-500 text-[10px] font-mono mt-1 leading-tight flex items-center gap-1 animate-fadeIn">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
