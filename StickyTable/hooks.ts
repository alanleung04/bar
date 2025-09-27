import { useMemo, useState } from 'react';

export type SortType = 'asc' | 'desc' | undefined;

export interface SortItem {
  [key: string]: number | Date | string | null;
}

export interface SortConfig<T extends SortItem> {
  field: keyof T;
  sort: SortType;
  sortBy?: (a: T[keyof T], b: T[keyof T]) => number;
  sortType?: 'number' | 'date' | 'string';
}

export const useTableSort = <T extends SortItem>(data: T[]) => {
  const [sortConfig, setSort] = useState<SortConfig<T>>();
  const { field, sort, sortBy, sortType = 'number' } = sortConfig ?? {};

  const compareFn = useMemo(() => {
    if (sortBy) {
      return sort === 'asc' ? sortBy : (a: T[keyof T], b: T[keyof T]) => sortBy(b, a);
    }

    if (sortType === 'number') {
      return sort === 'asc'
        ? (a: T[keyof T], b: T[keyof T]) => Number(a) - Number(b)
        : (a: T[keyof T], b: T[keyof T]) => Number(b) - Number(a);
    }

    if (sortType === 'date') {
      return sort === 'asc'
        ? (a: T[keyof T], b: T[keyof T]) =>
            !a || !b ? 0 : new Date(a).getTime() - new Date(b).getTime()
        : (a: T[keyof T], b: T[keyof T]) =>
            !a || !b ? 0 : new Date(b).getTime() - new Date(a).getTime();
    }

    // 默认按字符串排序
    return sort === 'asc'
      ? (a: T[keyof T], b: T[keyof T]) => String(a).localeCompare(String(b))
      : (a: T[keyof T], b: T[keyof T]) => String(b).localeCompare(String(a));
  }, [sort, sortBy, sortType]);

  const sortedData = useMemo(() => {
    if (!field) return data;

    const sorted = [...data];

    sorted.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      return compareFn(aValue, bValue);
    });

    return sorted;
  }, [data, field, compareFn]);

  return { sortedData, setSort, currentSortField: field, sort };
};
