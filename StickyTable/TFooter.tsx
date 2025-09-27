import { flexRender, Table } from '@tanstack/react-table';
import { getCommonPinningClass, getCommonPinningStyles } from './utils';

/**
 * @description 表格底部配置
 * @param show 是否显示
 * @param colSpanColumnObj 合并列配置
 * @param hiddenColumns 隐藏列配置
 * @param totalData 总计数据
 */
export interface FooterConfig<T> {
  show?: boolean;
  colSpanColumnObj?: {
    [key in keyof T]?: number;
  };
  hiddenColumns?: Array<keyof T>;
}

interface Props<T> extends FooterConfig<T> {
  table: Table<T>;
}

const TFoot = <T,>(props: Props<T>) => {
  const { table, colSpanColumnObj, hiddenColumns } = props;

  // 默认渲染方式
  return (
    <tfoot>
      {table.getFooterGroups().map(footerGroup => {
        // 获取所有可见的header（过滤后的）
        const visibleHeaders = footerGroup.headers.filter(
          ({ id }) => !hiddenColumns?.includes(id as keyof T)
        );

        // 在可见的左固定列中找到最后一个
        const visibleLeftPinnedHeaders = visibleHeaders.filter(
          header => header.column.getIsPinned() === 'left'
        );

        const lastVisibleLeftPinnedId =
          visibleLeftPinnedHeaders.length > 0
            ? visibleLeftPinnedHeaders[visibleLeftPinnedHeaders.length - 1].column.id
            : null;

        return (
          <tr key={footerGroup.id}>
            {visibleHeaders.map(header => {
              // 基于可见列判断是否为最后一个左固定列
              const isLastVisibleLeftPinned =
                header.column.getIsPinned() === 'left' &&
                header.column.id === lastVisibleLeftPinnedId;

              // 如果有colSpan的列是左固定的，也应该被标记为最后一个
              const hasColSpan = colSpanColumnObj?.[header.column.id as keyof T];
              const isLastLeftPinned =
                (hasColSpan && header.column.getIsPinned() === 'left') || isLastVisibleLeftPinned;

              const pinnedClass = isLastLeftPinned ? 'last-left-pinned-column' : '';

              return (
                <th
                  key={header.id}
                  style={{ ...getCommonPinningStyles(header.column) }}
                  className={pinnedClass}
                  colSpan={colSpanColumnObj?.[header.column.id as keyof T] ?? undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              );
            })}
          </tr>
        );
      })}
    </tfoot>
  );
};
export default TFoot;
