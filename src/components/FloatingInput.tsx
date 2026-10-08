'use client';
import React, { useState } from 'react';

export function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  onBlur,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);

  const handleBlur = () => {
    setFocused(false);
    if (onBlur) onBlur();
  };

  const isAlwaysFloating = type === 'date' || type === 'time' || type === 'datetime-local';
  const isFloating = focused || Boolean(value) || isAlwaysFloating;

  return (
    <div className={`relative w-full group pt-3.5 pb-1 border-b border-[var(--color-border)] transition-colors duration-300 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
            ? '-top-0.5 text-[10px] sm:text-xs text-[var(--color-accent)] font-semibold'
            : 'top-3.5 text-xs sm:text-sm text-[var(--color-muted-fg)]'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
      </label>
      {/* Bottom active line */}
      <div
        className={`absolute bottom-[-1px] left-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 ${
          focused ? 'w-full' : 'w-0'
        }`}
      ></div>
    </div>
  );
}
