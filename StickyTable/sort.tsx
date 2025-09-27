import { useCallback } from 'react';
import { DownFill } from 'antd-mobile-icons';
import type { SortType } from './hooks';

interface Props {
  sort: SortType;
  setSort: (sort: SortType) => void;
}

const getAfterSort = (sort: SortType) => {
  if (sort === 'asc') return 'desc';
  if (sort === 'desc') return undefined;
  return 'asc';
};

const Sort = (props: Props) => {
  const { sort, setSort } = props;

  const onClick = useCallback(() => {
    const newSort = getAfterSort(sort);

    setSort(newSort);
  }, [setSort, sort]);

  return (
    <div className="table-sort" onClick={onClick}>
      <DownFill className={sort === 'desc' ? 'active' : ''} />
      <DownFill className={sort === 'asc' ? 'active' : ''} />
    </div>
  );
};

export default Sort;
