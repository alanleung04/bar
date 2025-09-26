import { useState } from 'react';
import { SortingState } from '@tanstack/react-table';

export function useSorting() {
  const [sorting, setSorting] = useState<SortingState>([]);

  return {
    sorting,
    setSorting
  };
}
