'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DuplicateCheckRule<T> {
  field: string;
  label: string;
  matcher: (item: T, value: string) => boolean;
  formatMessage?: (item: T, value: string) => string;
}

export interface UseDuplicateValidatorOptions<T> {
  records: T[];
  currentId?: string | number | null;
  idGetter?: (item: T) => string | number;
  rules: DuplicateCheckRule<T>[];
  debounceMs?: number;
}

export function useDuplicateValidator<T>({
  records,
  currentId,
  idGetter = (item: any) => item?.id || item?._id,
  rules,
  debounceMs = 300,
}: UseDuplicateValidatorOptions<T>) {
  const [duplicateErrors, setDuplicateErrors] = useState<Record<string, string>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkDuplicatesNow = useCallback(
    (values: Record<string, string>) => {
      const newErrors: Record<string, string> = {};

      rules.forEach((rule) => {
        const val = values[rule.field]?.trim();
        if (!val) return;

        const exists = records.find((item) => {
          if (currentId && idGetter(item) === currentId) {
            return false;
          }
          return rule.matcher(item, val);
        });

        if (exists) {
          if (rule.formatMessage) {
            newErrors[rule.field] = rule.formatMessage(exists, val);
          } else {
            const code = (exists as any).code || (exists as any).leadCode || '';
            const name =
              (exists as any).name ||
              (exists as any).companyName ||
              `${(exists as any).firstName || ''} ${(exists as any).lastName || ''}`.trim() ||
              '';
            const identifier = [name, code ? `(${code})` : ''].filter(Boolean).join(' ');
            newErrors[rule.field] = `${rule.label} "${val}" đã tồn tại${
              identifier ? ` dưới bản ghi "${identifier}"` : ''
            }`;
          }
        }
      });

      setDuplicateErrors(newErrors);
    },
    [records, currentId, idGetter, rules]
  );

  const setFieldValue = useCallback(
    (field: string, val: string) => {
      setFieldValues((prev) => {
        const next = { ...prev, [field]: val };
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          checkDuplicatesNow(next);
        }, debounceMs);
        return next;
      });
    },
    [checkDuplicatesNow, debounceMs]
  );

  const clearDuplicates = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDuplicateErrors({});
    setFieldValues({});
  }, []);

  const validateAll = useCallback(
    (values: Record<string, string>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFieldValues(values);
      checkDuplicatesNow(values);
    },
    [checkDuplicatesNow]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hasDuplicate = Object.keys(duplicateErrors).length > 0;

  return {
    duplicateErrors,
    hasDuplicate,
    setFieldValue,
    clearDuplicates,
    validateAll,
  };
}
