import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  Header
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';
import './table.less';
import { Button } from 'antd';
import { useSorting } from './hooks/useSorting';
import { useColumnSelection } from './hooks/useColumnSelection';
import { useColumnCopy } from './hooks/useColumnCopy';
import { CommonTableHeader } from './components/header';
import { CommonTableCell } from './components/cell';
import { getTextWidth } from '@components/bi/utils';
import { useColumnResize } from '@components/hooks/useColumnResize';
import { theme } from 'antd';
import { useThemeService } from '@components/hooks/themeService';

interface TableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: string;
    size?: number;
  }[];
  pageSize?: number;
  size?: 'small' | 'middle';
  className?: string;
  showPagination?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  headerIconRender?: (header: Header<any, any>) => React.ReactNode;
  virtualScroll?: boolean;
  tableHeight?: number;
  // 列宽动态调整开发，打开才能进行宽度调整，默认false
  enableColumnResize?: boolean;
  // 列宽支持动态传入
  columnWidths?: Record<string, number>;
  // 列宽支持动态调整
  onColumnWidthsChange?: (accessorKey: string, newWidth: number) => void;
}

const useTableThemeVars = () => {
  const themeService = useThemeService();
  const { token } = theme.useToken();
  
  // 根据主题设置滚动条颜色
  const scrollbarColors = themeService.theme === 'dark' 
    ? {
        track: '#2a2a2a',
        thumb: '#555555',
        thumbHover: '#777777'
      }
    : {
        track: '#f5f5f5',
        thumb: '#d9d9d9',
        thumbHover: '#bfbfbf'
      };

  return {
    '--table-header-bg': token.colorBgContainer,
    '--table-header-color': token.colorText,
    '--table-body-color': token.colorText,
    '--table-body-bg': themeService.theme === 'dark' ? '#232323' : token.colorBgBase,
    '--table-border-color': token.colorBorderSecondary,
    '--table-row-hover-bg': themeService.theme === 'dark' ? '#424242' : token.colorFillSecondary,
    '--table-selected-bg': themeService.theme === 'dark' ? '#424242' : token.colorFillSecondary,
    '--table-pagination-bg': token.colorBgContainer,
    '--table-primary-color': token.colorPrimary,
    '--table-primary-color-alpha': `${token.colorPrimary}33`,
    '--table-input-bg': token.colorBgContainer,
    '--table-input-color': token.colorText,
    '--table-scrollbar-track': scrollbarColors.track,
    '--table-scrollbar-thumb': scrollbarColors.thumb,
    '--table-scrollbar-thumb-hover': scrollbarColors.thumbHover,
  } as React.CSSProperties;
}

export function CommonTable<T>({
  data,
  columns,
  pageSize = 10,
  showPagination = true,
  size = 'middle',
  className = '',
  filterValue = '',
  onFilterChange,
  headerIconRender,
  virtualScroll = false,
  tableHeight = 400,
  enableColumnResize = false,
  columnWidths: propColumnWidths,
  onColumnWidthsChange
}: TableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { sorting, setSorting } = useSorting();
  const tableThemeVars = useTableThemeVars();

  // 列宽 state，key 为 accessorKey
  const [internalColumnWidths, setInternalColumnWidths] = useState(() => {
    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col.accessorKey] = col.size ?? 190;
    });
    // 序号列
    widths['auto_index'] = 80;
    return widths;
  });
  const columnWidths = propColumnWidths || internalColumnWidths;

  // 列宽调整回调
  const handleColumnResize = (accessorKey: string, newWidth: number) => {
    if (onColumnWidthsChange) {
      onColumnWidthsChange(accessorKey, Math.max(newWidth, 40));
    } else {
      setInternalColumnWidths(widths => ({ ...widths, [accessorKey]: Math.max(newWidth, 40) }));
    }
  };

  // 使用 useColumnResize hook
  const {
    resizingColKey,
    resizePreviewLeft,
    resizeColLeft,
    onResizeStart,
    renderResizeLines
  } = useColumnResize({
    tableContainerRef,
    columnWidths,
    onColumnResize: handleColumnResize,
    minColWidth: 90
  });

  // 创建包含序号列的完整列配置
  const allColumns = [
    {
      header: '序号',
      accessorKey: 'auto_index',
      size: columnWidths['auto_index'],
      cell: ({ row }) => {
        return showPagination
          ? row.index +
              1 +
              table.getState().pagination.pageSize * table.getState().pagination.pageIndex
          : row.index + 1;
      }
    },
    ...columns.map(col => {
      const text = col.header || col.accessorKey;
      let width = columnWidths[col.accessorKey] ?? col.size ?? 190;
      if (virtualScroll) {
        width = Math.ceil(Math.max(width, getTextWidth(text, '14px Arial') + 60));
        width = Math.min(width, 600); // 允许更宽
      }
      return {
        ...col,
        size: width
      };
    })
  ];

  const table = useReactTable({
    data,
    columns: allColumns.map(col => ({
      ...col,
      // 指定排序算法
      sortingFn: 'alphanumeric'
    })),
    state: {
      sorting,
      globalFilter: filterValue
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: onFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId) ?? '').toLowerCase();
      return value.includes(String(filterValue).toLowerCase());
    },
    initialState: {
      ...(showPagination ? { pagination: { pageSize } } : {})
    },
    ...(showPagination ? { getPaginationRowModel: getPaginationRowModel() } : {})
  });
  const columnSelection = useColumnSelection();
  const columnCopy = useColumnCopy(columnSelection.selectedColumn, table);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => (size === 'small' ? 39 : 49),
    overscan: 5
  });

  // 添加列虚拟器
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: allColumns.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: index => allColumns[index]?.size ?? 150,
    overscan: 2
  });

  // 获取可见列
  const virtualColumns = columnVirtualizer.getVirtualItems();

  // 计算表格总宽度 (修改现有代码)
  const totalWidth = virtualScroll
    ? columnVirtualizer.getTotalSize()
    : allColumns.reduce((sum, col) => sum + (col.size || 150), 0);

  /**
   * useVirtualizer 的 estimateSize 只在初始化和依赖变化时生效。
   * 如果 estimateSize 是一个闭包，依赖的 state（如 allColumns[index]?.size）变化后，
   * useVirtualizer 不会自动重新计算虚拟列的 size，除非让它刷新。
   */
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnWidths]);

  return (
    <div
      className={`table-wrapper table-${size} bg-white ${className}`}
      style={tableThemeVars}
    >
      <div
        ref={tableContainerRef}
        className="table-container"
        style={{
          height: virtualScroll ? tableHeight : 'auto',
          overflow: 'auto',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* 拖拽预览虚线 */}
        {enableColumnResize && renderResizeLines()}
        {virtualScroll && (
          <table
            className="styled-table sticky top-0 z-[10] bg-white"
            style={{
              width: totalWidth,
              tableLayout: 'fixed'
            }}
          >
            <colgroup>
              {virtualColumns.map(virtualColumn => (
                <col
                  key={virtualColumn.index}
                  style={{ width: allColumns[virtualColumn.index]?.size ?? 150 }}
                />
              ))}
            </colgroup>
            <thead style={{ background: '#fafafa' }}>
              <CommonTableHeader
                table={table}
                columnCopy={columnCopy}
                columnSelection={columnSelection}
                headerIconRender={headerIconRender}
                size={size}
                virtualScroll={virtualScroll}
                virtualColumns={virtualColumns}
                onColumnResize={handleColumnResize}
                columnWidths={columnWidths}
                enableColumnResize={enableColumnResize}
                onResizeStart={onResizeStart}
              />
            </thead>
          </table>
        )}
        <table
          className="styled-table relative"
          style={{
            width: totalWidth,
            tableLayout: 'fixed'
          }}
        >
          {!virtualScroll && (
            <thead
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: '#fafafa'
              }}
            >
              <CommonTableHeader
                table={table}
                columnCopy={columnCopy}
                columnSelection={columnSelection}
                headerIconRender={headerIconRender}
                size={size}
                onColumnResize={handleColumnResize}
                columnWidths={columnWidths}
                enableColumnResize={enableColumnResize}
                onResizeStart={onResizeStart}
              />
            </thead>
          )}
          <tbody style={{ position: 'relative', zIndex: 1 }}>
            {virtualScroll ? (
              rowVirtualizer.getVirtualItems().map(virtualRow => (
                <CommonTableCell
                  key={rows[virtualRow.index]?.id}
                  table={table}
                  columnCopy={columnCopy}
                  columnSelection={columnSelection}
                  filterValue={filterValue}
                  size={size}
                  virtualRow={virtualRow.index}
                  virtualScroll={virtualScroll}
                  virtualColumns={virtualColumns}
                  virtualStyle={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    width: '100%'
                  }}
                />
              ))
            ) : (
              <CommonTableCell
                table={table}
                columnCopy={columnCopy}
                columnSelection={columnSelection}
                filterValue={filterValue}
                size={size}
              />
            )}
          </tbody>
        </table>
        {virtualScroll && (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '1px' }} />
        )}
      </div>

      {showPagination && (
        <>
          <div className="pagination">
            <div className="text-xs text-gray-500 flex justify-center items-center">
              记录数: {table.getRowCount()}
              {filterValue && <>/ 筛选后: {table.getFilteredRowModel().rows.length}</>}
            </div>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              size={size}
            >
              上一页
            </Button>
            <div className="text-xs text-gray-500 flex justify-center items-center">
              当前页: {table.getState().pagination.pageIndex + 1} / 总页数: {table.getPageCount()}
            </div>
            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} size={size}>
              下一页
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
