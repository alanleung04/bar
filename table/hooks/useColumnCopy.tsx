import { useEffect } from 'react';
import { Cell, Header, Row, Table } from '@tanstack/react-table';
import { copyToClipboard } from '@components/utils/clipboard';

const delimiter = '\t';
const newLine = '\n';

const handleValue = (value: string) => {
  return typeof value === 'string' && [delimiter, newLine].some(item => value.includes(item))
    ? `"${value}"`
    : value;
};

// 统一的获取单元格值的方法，解决虚拟列表中cell.getValue()返回undefined的问题
// 这是因为虚拟列表中，cell.getValue()在处理复杂列名（包含空格，如 count(distinct a.uid)）时，getValue() 方法可能无法正确解析
const getCellValue = (cell: Cell<any, any>): string => {
  if (!cell) return '';

  // 首先尝试使用getValue()
  let cellValue = cell.getValue();

  // 如果getValue()返回undefined，使用备用的数据获取方式
  if (cellValue === undefined || cellValue === null) {
    const { accessorKey } = cell.column.columnDef as any;
    cellValue = cell.row.original[accessorKey];
  }

  // 确保cellValue不为undefined，并转换为字符串
  return cellValue !== undefined && cellValue !== null ? String(cellValue) : '';
};

export interface IColumnCopy {
  copySelectedColumn: (header?: Header<any, any>, headerOnly?: boolean) => void;
  copyCell: (cell: Cell<any, any>) => void;
  copyRow: (row: Row<any>, withHeader?: boolean) => void;
  copyAllTable: (withHeader?: boolean, headerOnly?: boolean) => void;
}

export function useColumnCopy(selectedColumn: string | null, table: Table<any>): IColumnCopy {
  const getRows = () => table.getRowModel().rows;
  // 复制列数据
  const copySelectedColumn = (header?: Header<any, any>, headerOnly = false) => {
    if (!selectedColumn) return;

    let columnData = '';
    if (header) {
      columnData = header.column.columnDef.header?.toString() ?? '';
      if (headerOnly) {
        copyToClipboard(columnData);
        return;
      }
    }
    columnData = [
      columnData,
      ...getRows().map(row => {
        const cell = row.getAllCells().find(cell => cell.column.id === selectedColumn);
        const { accessorKey } = cell?.column.columnDef as any;
        const content = cell?.row.original[accessorKey] ?? '';
        return content;
      })
    ]
      .filter(Boolean)
      .join('\n');

    copyToClipboard(columnData);
  };

  // 复制单元格数据
  const copyCell = (cell: Cell<any, any>) => {
    if (!cell) return;

    const cellData = getCellValue(cell);
    copyToClipboard(cellData);
  };

  // 整行复制
  const copyRow = (row: Row<any>, withHeader = false) => {
    const data: string[] = [];
    if (withHeader) {
      data.push(
        row
          .getVisibleCells()
          .filter(cell => cell.column.id !== 'auto_index')
          .map(cell => cell.column.columnDef.header?.toString() ?? '')
          .join('\t')
      );
    }
    const delimiter = '\t';
    const rowData = row
      .getVisibleCells()
      .filter(cell => cell.column.id !== 'auto_index')
      .map(cell => handleValue(getCellValue(cell)))
      .join(delimiter);
    data.push(rowData);
    copyToClipboard(data.join('\n'));
  };

  // 全表格复制
  const copyAllTable = (withHeader = false, headerOnly = false) => {
    const data: string[] = [];
    if (withHeader) {
      data.push(
        table
          .getAllColumns()
          .filter(column => column.id !== 'auto_index')
          .map(column => column.columnDef.header?.toString() ?? '')
          .join('\t')
      );

      if (headerOnly) {
        copyToClipboard(data.join('\n'));
        return;
      }
    }
    const rowData = table
      .getRowModel()
      .rows.map(row =>
        row
          .getVisibleCells()
          .filter(cell => cell.column.id !== 'auto_index')
          .map(cell => handleValue(getCellValue(cell)))
          .join(delimiter)
      )
      .join(newLine);
    data.push(rowData);
    copyToClipboard(data.join('\n'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = window.getSelection();
      if (selection?.type === 'Range') {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedColumn) {
        e.preventDefault();
        copySelectedColumn();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedColumn]);

  return {
    copySelectedColumn,
    copyCell,
    copyRow,
    copyAllTable
  };
}
