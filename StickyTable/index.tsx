import { createContext, useMemo, useRef } from 'react';
import { Table } from '@tanstack/react-table';
import { ErrorBlock } from 'antd-mobile';
import useIsScrolling from '@/hooks/useIsScrolling';
import { useStickyTableScroll } from './hooks/useStickyTableScroll';
import TBody, { type BodyConfig } from './TBody';
import TFoot, { type FooterConfig } from './TFooter';
import THead from './THead';
import './index.less';

interface Props<T = {}> {
  table: Table<T>;
  footerConfig?: FooterConfig<T>;
  bodyConfig?: BodyConfig<T>;
  isEmpty?: boolean;
  style?: React.CSSProperties;
  className?: string;
  // 滚动截流配置
  scrollThrottle?: {
    throttleMs?: number;
    enableScrollDirection?: boolean;
    enableScrollPosition?: boolean;
    onScrollStart?: () => void;
    onScrollEnd?: () => void;
    onScroll?: (event: Event) => void;
  };
}

export interface ScrollContextProps {
  scrolling: boolean;
  scrollDirection?: 'up' | 'down' | null;
  scrollPosition?: { x: number; y: number };
  isScrollingFast?: boolean;
}

export const ScrollContext = createContext<ScrollContextProps>({ scrolling: false });

const StickyTableContainer = <T,>(props: Props<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    style, 
    table, 
    isEmpty, 
    footerConfig, 
    bodyConfig, 
    className = '',
    scrollThrottle
  } = props;

  // 使用增强的滚动截流hook
  const scrollState = useStickyTableScroll(containerRef, scrollThrottle);
  
  // 保持向后兼容，如果没有配置scrollThrottle，使用原来的hook
  const fallbackScrolling = useIsScrolling(containerRef);
  
  const contextValue = useMemo(() => {
    if (scrollThrottle) {
      return scrollState;
    }
    return { scrolling: fallbackScrolling.scrolling };
  }, [scrollState, fallbackScrolling.scrolling, scrollThrottle]);

  return (
    <>
      <div
        ref={containerRef}
        className={`table-container ${className} ${isEmpty ? 'table-container-empty' : ''}`}
        style={style}
      >
        <ScrollContext.Provider value={contextValue}>
          <StickyTable {...{ table, bodyConfig, footerConfig }} />
        </ScrollContext.Provider>
      </div>
      {isEmpty ? (
        <div
          style={{
            width: '100%',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          <ErrorBlock status="empty" title="" description="暂无数据" />
        </div>
      ) : null}
    </>
  );
};
//不能加memo
const StickyTable = <T,>(props: Props<T>) => {
  const { table, footerConfig, bodyConfig } = props;
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <table ref={tableRef}>
      <THead table={table} />
      <TBody table={table} {...bodyConfig} />
      {footerConfig?.show && <TFoot table={table} {...footerConfig} />}
    </table>
  );
};

export default StickyTableContainer;

export { THead, TBody, TFoot };
export * from './hooks';
export { useStickyTableScroll } from './hooks/useStickyTableScroll';
