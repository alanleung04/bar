import { Table } from '@tanstack/react-table';
import './index.less';

interface Props {
  isExpanded?: boolean;
  onClick?: (params: unknown) => void;
  style?: React.CSSProperties;
}

const ExpandIcon = (props: Props) => {
  const { isExpanded, onClick, style } = props;

  return (
    <div className="expand-button" onClick={onClick} style={style}>
      <div className={!isExpanded ? 'plus-icon' : 'minus-icon'} />
    </div>
  );
};

export default ExpandIcon;

//判断是否全部展开
export const getIsAllExpanded = <T,>(table: Table<T>) => {
  if (!table) return;
  return table.getExpandedRowModel?.().rows?.length === table.getRowModel().flatRows.length;
};
