import { useState } from 'react';

export interface IColumnSelection {
  selectedColumn: string | null;
  setSelectedColumn: (columnId: string | null) => void;
  handleColumnClick: (columnId: string, force?: boolean) => void;
}

export function useColumnSelection(): IColumnSelection {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const handleColumnClick = (columnId: string, force = false) => {
    // if (columnId === 'auto_index') {
    //   return;
    // }
    if (force) {
      console.log('force', columnId);
      setSelectedColumn(columnId);
    } else {
      setSelectedColumn(selectedColumn === columnId ? null : columnId);
    }
  };

  return {
    selectedColumn,
    setSelectedColumn,
    handleColumnClick
  };
}
