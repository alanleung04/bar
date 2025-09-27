import React from 'react';
import { Row, Table } from '@tanstack/react-table';
import Tr from './Tr';

export interface BodyConfig<T> {
  hightlightRows?: (row: Row<T>) => boolean;
}

interface Props<T = {}> extends BodyConfig<T> {
  table: Table<T>;
}

const TBody = <T,>(props: Props<T>) => {
  const { table, hightlightRows } = props;

  return (
    <tbody>
      {table.getRowModel().rows.map(row => (
        <React.Fragment key={row.id}>
          <Tr row={row} hightlightRows={hightlightRows} />
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TBody;
