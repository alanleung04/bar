import { Cell, flexRender, Table } from '@tanstack/react-table';
import { IColumnCopy } from '../hooks/useColumnCopy';
import { IColumnSelection } from '../hooks/useColumnSelection';
import { Button, Dropdown, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './cell.less';
import { useMemo } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';
import { useThemeService } from '@components/hooks/themeService';

// 颜色配置
const getThemeColors = (theme: string) => ({
  background: theme === 'dark' ? '#333' : '#fff',
  color: theme === 'dark' ? '#fff' : '#262626',
  borderColor: theme === 'dark' ? '#444' : '#e5e7eb'
});

export function CommonTableCell(props: {
  table: Table<any>;
  virtualRow?: number;
  columnCopy: IColumnCopy;
  columnSelection: IColumnSelection;
  filterValue: string;
  size?: 'small' | 'middle' | 'large';
  virtualStyle?: React.CSSProperties;
  virtualScroll?: boolean;
  virtualColumns?: VirtualItem[];
}) {
  const {
    table,
    columnCopy,
    columnSelection,
    filterValue,
    size = 'middle',
    virtualRow,
    virtualStyle,
    virtualScroll = false,
    virtualColumns
  } = props;
  const { selectedColumn } = columnSelection;
  const { copyCell, copyRow } = columnCopy;
  const rows =
    virtualRow !== undefined ? [table.getRowModel().rows[virtualRow]] : table.getRowModel().rows;

  const setWidthStyle = useMemo(() => {
    if (!virtualScroll) return false;
    return true;
  }, [virtualScroll]);

  const cellTooltipRender = (cell: Cell<any, any>) => {
    const { accessorKey } = cell.column.columnDef as any;
    if (cell.column.id === 'auto_index') {
      return (
        <div className="flex flex-col w-full">
          {Object.keys(cell.row.original).map(key => {
            return (
              <div key={key} className="flex w-full mb-[2px]">
                <div className="font-bold break-words w-[100px] flex-shrink-0 text-left">
                  {key}:{' '}
                </div>
                <div className="ml-md flex-1 whitespace-pre-wrap break-all break-words">
                  {cell.row.original[key]}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <div className="font-bold">{cell.column.columnDef.header?.toString()}</div>
        <div className="mt-sm whitespace-pre-wrap break-all break-words">
          {cell.row.original[accessorKey]}
        </div>
      </div>
    );
  };

  const renderCell = (cell: Cell<any, any>) => {
    const { accessorKey } = cell.column.columnDef as any;
    if (cell.column.id === 'auto_index') {
      return flexRender(cell.column.columnDef.cell, cell.getContext());
    }
    const value = cell.row.original[accessorKey];
    return filterValue && typeof value === 'string' ? (
      <span
        dangerouslySetInnerHTML={{
          __html:
            value.replace(
              new RegExp(filterValue, 'gi'),
              match => `<span style="color: red">${match}</span>`
            ) ?? ''
        }}
      />
    ) : (
      value
    );
  };

  const themeService = useThemeService();

  return (
    <>
      {rows.map(row => (
        <tr key={row?.id} className={`table-tr table-tr-${size}`} style={virtualStyle}>
          {virtualScroll && virtualColumns
            ? virtualColumns.map(virtualColumn => {
                const cell = row?.getVisibleCells()[virtualColumn.index];
                if (!cell) return null;
                return (
                  <td
                    key={cell.id}
                    className={`table-td table-td-${size} overflow-hidden group ${
                      [cell.column.id, 'auto_index'].some(id => selectedColumn === id) &&
                      cell.column.id !== 'auto_index'
                        ? 'selected-column'
                        : ''
                    } flex items-center`}
                    style={{
                      height: 49,
                      width: virtualColumn.size,
                      position: 'absolute',
                      left: 0,
                      transform: `translateX(${virtualColumn.start}px)`
                    }}
                  >
                    <Tooltip
                      overlayInnerStyle={
                        cell.column.id === 'auto_index'
                          ? {
                              width: '300px',
                              maxHeight: '500px',
                              overflow: 'auto'
                            }
                          : {}
                      }
                      overlayClassName="cell-tooltip"
                      destroyTooltipOnHide
                      mouseEnterDelay={0.5}
                      trigger={['click']}
                      title={cellTooltipRender(cell)}
                    >
                      <div
                        className={`table-td-content whitespace-pre-wrap overflow-auto ${
                          cell.column.id === 'auto_index' ? 'auto-index' : 'normal'
                        }`}
                        style={{
                          width: virtualColumn.size,
                          minWidth: virtualColumn.size,
                          maxHeight: 49
                        }}
                      >
                        {renderCell(cell)}
                      </div>
                    </Tooltip>

                    {cell.column.id !== 'auto_index' && (
                      <div
                        className="absolute top-0 right-0 p-[2px] hidden group-hover:block shadow-sm border border-solid border-gray-200"
                      >
                        <Button
                          className="w-[14px] h-[14px] text-[12px] leading-none"
                          icon={<CopyOutlined className="w-[12px] h-[12px]" />}
                          style={getThemeColors(themeService.theme)}
                          type="text"
                          size="small"
                          onClick={() => copyCell(cell)}
                        />
                      </div>
                    )}
                    {cell.column.id === 'auto_index' && (
                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: [
                            {
                              label: '整行复制',
                              key: 'copy',
                              onClick: () => copyRow(row)
                            },
                            {
                              label: '整行复制(含表头)',
                              key: 'copy-with-header',
                              onClick: () => copyRow(row, true)
                            }
                          ]
                        }}
                      >
                        <div className="absolute top-0 right-0 bg-white p-[2px] hidden group-hover:block shadow-sm border border-solid border-gray-200">
                          <Button
                            className="w-[14px] h-[14px] text-[12px] leading-none"
                            icon={<CopyOutlined className="w-[12px] h-[12px]" />}
                            style={getThemeColors(themeService.theme)}
                            type="text"
                            size="small"
                          />
                        </div>
                      </Dropdown>
                    )}
                  </td>
                );
              })
            : row?.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className={`relative table-td table-td-${size} overflow-auto group ${
                    [cell.column.id, 'auto_index'].some(id => selectedColumn === id) &&
                    cell.column.id !== 'auto_index'
                      ? 'selected-column'
                      : ''
                  }`}
                  style={{
                    height: 49
                  }}
                >
                  <Tooltip
                    overlayInnerStyle={
                      cell.column.id === 'auto_index'
                        ? {
                            width: '300px',
                            maxHeight: '500px',
                            overflow: 'auto'
                          }
                        : {}
                    }
                    overlayClassName="cell-tooltip"
                    destroyTooltipOnHide
                    mouseEnterDelay={0.5}
                    trigger={['click']}
                    title={cellTooltipRender(cell)}
                  >
                    <div
                      className={`table-td-content whitespace-pre-wrap overflow-auto ${
                        cell.column.id === 'auto_index' ? 'auto-index' : 'normal'
                      }`}
                      style={
                        setWidthStyle
                          ? {
                              width: cell.column.columnDef.size ?? 0,
                              minWidth: cell.column.columnDef.size ?? 0,
                              maxHeight: 49
                            }
                          : {}
                      }
                    >
                      {renderCell(cell)}
                    </div>
                  </Tooltip>

                  {cell.column.id !== 'auto_index' && (
                    <div className="absolute top-0 right-0 bg-white p-[2px] hidden group-hover:block shadow-sm border border-solid border-gray-200">
                      <Button
                        className="w-[14px] h-[14px] text-[12px] leading-none"
                        style={getThemeColors(themeService.theme)}
                        icon={<CopyOutlined className="w-[12px] h-[12px]" style={{ color: themeService.theme === 'dark' ? '#262626' : '#fff' }} />}
                        type="text"
                        size="small"
                        onClick={() => copyCell(cell)}
                      />
                    </div>
                  )}
                  {cell.column.id === 'auto_index' && (
                    <>
                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: [
                            {
                              label: '整行复制',
                              key: 'copy',
                              onClick: () => copyRow(row)
                            },
                            {
                              label: '整行复制(含表头)',
                              key: 'copy-with-header',
                              onClick: () => copyRow(row, true)
                            }
                          ]
                        }}
                      >
                        <div className="absolute top-0 right-0 bg-white p-[2px] hidden group-hover:block shadow-sm border border-solid border-gray-200">
                          <Button
                            className="w-[14px] h-[14px] text-[12px] leading-none"
                            icon={<CopyOutlined className="w-[12px] h-[12px]" />}
                            style={getThemeColors(themeService.theme)}
                            type="text"
                            size="small"
                          />
                        </div>
                      </Dropdown>
                    </>
                  )}
                </td>
              ))}
        </tr>
      ))}
    </>
  );
}
