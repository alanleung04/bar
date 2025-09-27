import { CSSProperties } from 'react';
import { Column, Row } from '@tanstack/react-table';
import { px2vw } from '@/utils/tools';

export const isLastLeftPinnedColumn = <T>(column: Column<T>) => {
  const isPinned = column.getIsPinned();
  return isPinned === 'left' && column.getIsLastColumn('left');
};

export const getCommonPinningClass = <T extends unknown>(column: Column<T>): string => {
  const _isLastLeftPinnedColumn = isLastLeftPinnedColumn(column);

  return [_isLastLeftPinnedColumn ? 'last-left-pinned-column' : ''].join(' ');
};

export const getCommonPinningStyles = <T extends unknown>(column: Column<T>): CSSProperties => {
  const isPinned = column.getIsPinned();

  const width = px2vw(column.getSize());

  const left = px2vw(column.getStart('left'));

  return {
    left: isPinned === 'left' ? left : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width,
    zIndex: isPinned ? 1 : 0
  };
};

export const getCommonCanExpandClass = <T>(row: Row<T>): string => {
  const canExpanded = row.getCanExpand();
  return `${canExpanded ? 'sticky-table-expanded-row' : ''} expand-${row.depth}`;
};
