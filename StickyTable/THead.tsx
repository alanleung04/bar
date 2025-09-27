import { flexRender, Table } from '@tanstack/react-table';
import { getCommonPinningClass, getCommonPinningStyles } from './utils';

interface Props<T> {
  table: Table<T>;
}

const THead = <T,>(props: Props<T>) => {
  const { table } = props;

  return (
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th
              key={header.id}
              style={{ ...getCommonPinningStyles(header.column) }}
              className={getCommonPinningClass(header.column)}
            >
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

export default THead;
