import { flexRender, Header, Table, HeaderGroup } from '@tanstack/react-table';
import { IColumnCopy } from '../hooks/useColumnCopy';
import { IColumnSelection } from '../hooks/useColumnSelection';
import { Button, Dropdown, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { ReactNode, useRef } from 'react';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { VirtualItem } from '@tanstack/react-virtual';

function VirtualHeader(props: {
  table: Table<any>;
  columnCopy: IColumnCopy;
  columnSelection: IColumnSelection;
  headerGroup: HeaderGroup<any>;
  headerIconRender?: (header: Header<any, any>) => ReactNode;
  size?: 'small' | 'middle' | 'large';
  virtualColumns: VirtualItem[];
  onColumnResize: (accessorKey: string, newWidth: number) => void;
  columnWidths: Record<string, number>;
  enableColumnResize?: boolean;
  onResizeStart?: (colKey: string, startX: number, startWidth: number) => void;
}) {
  const {
    columnCopy,
    columnSelection,
    headerGroup,
    headerIconRender,
    size,
    virtualColumns,
    onColumnResize,
    columnWidths,
    enableColumnResize,
    onResizeStart
  } = props;
  const { selectedColumn, handleColumnClick } = columnSelection;
  const { copySelectedColumn, copyCell, copyRow, copyAllTable } = columnCopy;
  const resizeActiveRef = useRef(false);

  // 拖拽分隔线
  const startResize = (e: React.MouseEvent, accessorKey: string, startWidth: number) => {
    e.stopPropagation();
    const startX = e.clientX;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      onColumnResize(accessorKey, startWidth + delta);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {virtualColumns.map(virtualColumn => {
        const header = headerGroup.headers[virtualColumn.index];
        if (!header) return null;
        const accessorKey = header.column.id;
        return (
          <th
            key={header.id}
            data-col-key={accessorKey}
            onClick={e => {
              if (resizeActiveRef.current) {
                resizeActiveRef.current = false;
                return;
              }
              handleColumnClick(header.id);
            }}
            className={`table-th table-th-${size} ${
              selectedColumn === header.id ? 'selected-column' : ''
            }`}
            style={{
              width: virtualColumn.size,
              position: 'absolute',
              left: 0,
              transform: `translateX(${virtualColumn.start}px)`
            }}
          >
            <div
              className="flex items-center table-th-content group"
              style={{
                width: virtualColumn.size,
                minWidth: virtualColumn.size,
                position: 'relative'
              }}
            >
              <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                <Tooltip title={header.column.columnDef.header?.toString()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Tooltip>
              </div>
              {/* 拖拽分隔线 */}
              {enableColumnResize && (
                <div
                  className="resize-handle absolute right-0 top-0 h-full w-2 cursor-col-resize z-[2]"
                  onMouseDown={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizeActiveRef.current = true;
                    onResizeStart &&
                      onResizeStart(
                        accessorKey,
                        e.clientX,
                        columnWidths[accessorKey] ?? (accessorKey === 'auto_index' ? 80 : 190)
                      );
                  }}
                />
              )}
              <div className="ml-md relative h-[28px] flex items-center">
                <div
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  className="border border-solid border-gray-200 absolute top-[22px] left-[-12px] translate-x-[-100%] p-[2px] hidden group-hover:block shadow-sm"
                >
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items:
                        header.id === 'auto_index'
                          ? [
                              {
                                label: '复制表格',
                                key: 'copy-table-with-header',
                                onClick: () => copyAllTable(true)
                              },
                              {
                                label: '复制表格(仅数据)',
                                key: 'copy-table-data',
                                onClick: () => copyAllTable(false)
                              },
                              {
                                label: '复制表格(仅列名)',
                                key: 'copy-table-column-name',
                                onClick: () => copyAllTable(true, true)
                              }
                            ]
                          : [
                              {
                                label: '整列复制',
                                key: 'copy',
                                onClick: () => copySelectedColumn(header)
                              },
                              {
                                label: '整列复制(仅列名)',
                                key: 'copy-column-name',
                                onClick: () => copySelectedColumn(header, true)
                              },
                              {
                                label: '整列复制(仅数据)',
                                key: 'copy-column-data',
                                onClick: () => copySelectedColumn()
                              }
                            ]
                    }}
                    onOpenChange={open => {
                      if (open) {
                        handleColumnClick(header.id, true);
                      }
                    }}
                  >
                    <Button
                      className="w-[14px] h-[14px] text-[12px] leading-none"
                      icon={<CopyOutlined className="w-[12px] h-[12px]" />}
                      type="text"
                      size="small"
                    />
                  </Dropdown>
                </div>

                {headerIconRender?.(header)}
                {header.id !== 'auto_index' && (
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      header.column.getToggleSortingHandler()?.(e);
                    }}
                    className="flex flex-col"
                  >
                    <CaretUpOutlined
                      className={`${
                        header.column.getIsSorted() === 'asc' ? 'text-blue-500' : 'text-gray-300'
                      }`}
                    />
                    <CaretDownOutlined
                      className={`${
                        header.column.getIsSorted() === 'desc' ? 'text-blue-500' : 'text-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </th>
        );
      })}
    </>
  );
}

export function CommonTableHeader(props: {
  table: Table<any>;
  columnCopy: IColumnCopy;
  columnSelection: IColumnSelection;
  headerIconRender?: (header: Header<any, any>) => ReactNode;
  size?: 'small' | 'middle' | 'large';
  virtualScroll?: boolean;
  virtualColumns?: VirtualItem[];
  onColumnResize: (accessorKey: string, newWidth: number) => void;
  columnWidths: Record<string, number>;
  enableColumnResize?: boolean;
  onResizeStart?: (colKey: string, startX: number, startWidth: number) => void;
}) {
  const {
    table,
    columnCopy,
    columnSelection,
    headerIconRender,
    size = 'middle',
    virtualScroll = false,
    virtualColumns,
    onColumnResize,
    columnWidths,
    enableColumnResize,
    onResizeStart
  } = props;

  const { selectedColumn, handleColumnClick } = columnSelection;
  const { copySelectedColumn, copyCell, copyRow, copyAllTable } = columnCopy;

  // 拖拽分隔线
  const startResize = (e: React.MouseEvent, accessorKey: string, startWidth: number) => {
    e.stopPropagation();
    const startX = e.clientX;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      onColumnResize(accessorKey, startWidth + delta);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} style={virtualScroll ? { height: 44 } : {}}>
          {virtualScroll && virtualColumns ? (
            <VirtualHeader
              table={table}
              columnCopy={columnCopy}
              columnSelection={columnSelection}
              headerGroup={headerGroup}
              headerIconRender={headerIconRender}
              size={size}
              virtualColumns={virtualColumns}
              onColumnResize={onColumnResize}
              columnWidths={columnWidths}
              enableColumnResize={enableColumnResize}
              onResizeStart={onResizeStart}
            />
          ) : (
            headerGroup.headers.map(header => {
              const accessorKey = header.column.id;
              return (
                <th
                  key={header.id}
                  data-col-key={accessorKey}
                  onClick={e => {
                    handleColumnClick(header.id);
                  }}
                  className={`table-th table-th-${size} ${
                    selectedColumn === header.id ? 'selected-column' : ''
                  }`}
                  style={{
                    width: header.column.columnDef.size,
                    minWidth: header.column.columnDef.size
                  }}
                >
                  <div
                    className="flex items-center table-th-content group"
                    style={{ position: 'relative' }}
                  >
                    <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      <Tooltip title={header.column.columnDef.header?.toString()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Tooltip>
                    </div>
                    {/* 拖拽分隔线 */}
                    {enableColumnResize && (
                      <div
                        className="resize-handle absolute right-0 top-0 h-full w-2 cursor-col-resize z-[2]"
                        onMouseDown={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          onResizeStart &&
                            onResizeStart(
                              accessorKey,
                              e.clientX,
                              columnWidths[accessorKey] ?? (accessorKey === 'auto_index' ? 80 : 190)
                            );
                        }}
                      />
                    )}
                    <div className="ml-md relative h-[28px] flex items-center">
                      <div
                        onClick={e => {
                          e.stopPropagation();
                        }}
                        className="border border-solid border-gray-200 absolute top-[22px] left-[-12px] translate-x-[-100%] bg-white p-[2px] hidden group-hover:block shadow-sm"
                      >
                        <Dropdown
                          trigger={['click']}
                          menu={{
                            items:
                              header.id === 'auto_index'
                                ? [
                                    {
                                      label: '复制表格',
                                      key: 'copy-table-with-header',
                                      onClick: () => copyAllTable(true)
                                    },
                                    {
                                      label: '复制表格(仅数据)',
                                      key: 'copy-table-data',
                                      onClick: () => copyAllTable(false)
                                    },
                                    {
                                      label: '复制表格(仅列名)',
                                      key: 'copy-table-column-name',
                                      onClick: () => copyAllTable(true, true)
                                    }
                                  ]
                                : [
                                    {
                                      label: '整列复制',
                                      key: 'copy',
                                      onClick: () => copySelectedColumn(header)
                                    },
                                    {
                                      label: '整列复制(仅列名)',
                                      key: 'copy-column-name',
                                      onClick: () => copySelectedColumn(header, true)
                                    },
                                    {
                                      label: '整列复制(仅数据)',
                                      key: 'copy-column-data',
                                      onClick: () => copySelectedColumn()
                                    }
                                  ]
                          }}
                          onOpenChange={open => {
                            if (open) {
                              handleColumnClick(header.id, true);
                            }
                          }}
                        >
                          <Button
                            className="w-[14px] h-[14px] text-[12px] leading-none"
                            icon={<CopyOutlined className="w-[12px] h-[12px]" />}
                            type="text"
                            size="small"
                          />
                        </Dropdown>
                      </div>

                      {headerIconRender?.(header)}
                      {header.id !== 'auto_index' && (
                        <div
                          onClick={e => {
                            e.stopPropagation();
                            header.column.getToggleSortingHandler()?.(e);
                          }}
                          className="flex flex-col"
                        >
                          <CaretUpOutlined
                            className={`${
                              header.column.getIsSorted() === 'asc'
                                ? 'text-blue-500'
                                : 'text-gray-300'
                            }`}
                          />
                          <CaretDownOutlined
                            className={`${
                              header.column.getIsSorted() === 'desc'
                                ? 'text-blue-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              );
            })
          )}
        </tr>
      ))}
    </>
  );
}
