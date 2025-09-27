import { PropsWithChildren } from 'react';
import { SortConfig, SortItem, SortType } from './hooks';
import Sort from './sort';

export type HeaderContentProps<T extends SortItem> =
  | {
      allowSort?: false;
    }
  | ({
      allowSort: true;
      setSort: (sort: SortConfig<T>) => void;
      currentSortField?: keyof T;
    } & SortConfig<T>);

const HeaderContent = <T extends SortItem>(props: PropsWithChildren<HeaderContentProps<T>>) => {
  const { allowSort, children } = props;

  const onClickSort = (sort: SortType) => {
    if (allowSort) {
      const { field, sortBy, sortType, setSort } = props;
      setSort?.({ field, sort, sortBy, sortType });
    }
  };

  return (
    <div className="table-hd-sort">
      {allowSort && (
        <Sort
          sort={props.currentSortField === props.field ? props.sort : undefined}
          setSort={onClickSort}
        />
      )}
      <span>{children}</span>
    </div>
  );
};

export default HeaderContent;
