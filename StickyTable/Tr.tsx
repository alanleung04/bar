import { flexRender, Row } from '@tanstack/react-table';
import { getCommonCanExpandClass, getCommonPinningClass, getCommonPinningStyles } from './utils';

interface Props<T> {
  row: Row<T>;
  hightlightRows?: (row: Row<T>) => boolean;
}

const Tr = <T,>(props: Props<T>) => {
  const { row, hightlightRows } = props;
  const isSummary = (row.original as T & { isSummary?: boolean }).isSummary;

  return (
    <tr key={row.id} className={hightlightRows?.(row) ? 'sticky-table-highlight-row' : ''}>
      {row.getVisibleCells().map(cell => {
        // 获取单元格的rowSpan信息
        const columnId = cell.column.id;

        const item = (row.original as any)[columnId];
        const rowSpan = typeof item === 'object' ? item.rowSpan : undefined;

        // 如果rowSpan为0，表示该单元格被合并，使用CSS隐藏而不是不渲染
        const isHidden = rowSpan === 0;

        return (
          <td
            key={cell.id}
            style={{
              ...getCommonPinningStyles(cell.column),
              ...(isSummary ? { background: '#ececec' } : {}),
              ...(isHidden ? { display: 'none' } : {})
            }}
            className={`${getCommonPinningClass(cell.column)} ${getCommonCanExpandClass(cell.row)}`}
            rowSpan={rowSpan > 1 ? rowSpan : undefined}
          >
            {isHidden ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
};

export default Tr;
