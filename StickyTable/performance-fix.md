# StickyTable 快速滚动白屏问题解决方案

## 问题分析

StickyTable组件出现快速滚动白屏的主要原因：

1. **没有虚拟滚动**：直接渲染所有行，大数据量时性能差
2. **复杂的样式计算**：每行每单元格都要计算样式
3. **频繁的DOM操作**：rowSpan检查和类型转换
4. **CSS性能问题**：复杂的伪元素和动画
5. **滚动事件处理**：频繁的状态更新

## 解决方案

### 1. 添加虚拟滚动支持

```typescript
// 修改TBody.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const TBody = <T,>(props: Props<T>) => {
  const { table, hightlightRows } = props;
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // 行高
    overscan: 10, // 增加缓冲
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Tr row={rows[virtualRow.index]} hightlightRows={hightlightRows} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. 优化样式计算

```typescript
// 优化Tr.tsx
import { useMemo } from 'react';

const Tr = <T,>(props: Props<T>) => {
  const { row, hightlightRows } = props;
  const isSummary = (row.original as T & { isSummary?: boolean }).isSummary;

  // 缓存样式计算
  const cellStyles = useMemo(() => {
    return row.getVisibleCells().map(cell => {
      const columnId = cell.column.id;
      const item = (row.original as any)[columnId];
      const rowSpan = typeof item === 'object' ? item.rowSpan : undefined;
      const isHidden = rowSpan === 0;

      return {
        cell,
        rowSpan,
        isHidden,
        style: {
          ...getCommonPinningStyles(cell.column),
          ...(isSummary ? { background: '#ececec' } : {}),
          ...(isHidden ? { display: 'none' } : {})
        }
      };
    });
  }, [row, isSummary]);

  return (
    <tr key={row.id} className={hightlightRows?.(row) ? 'sticky-table-highlight-row' : ''}>
      {cellStyles.map(({ cell, rowSpan, isHidden, style }) => (
        <td
          key={cell.id}
          style={style}
          className={`${getCommonPinningClass(cell.column)} ${getCommonCanExpandClass(cell.row)}`}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
        >
          {isHidden ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};
```

### 3. 使用React.memo优化

```typescript
// 优化Tr组件
const Tr = React.memo(<T,>(props: Props<T>) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return (
    prevProps.row.id === nextProps.row.id &&
    prevProps.hightlightRows === nextProps.hightlightRows
  );
});

// 优化TBody组件
const TBody = React.memo(<T,>(props: Props<T>) => {
  // 组件实现
});
```

### 4. 优化CSS性能

```less
// 优化index.less
.table-container {
  /* 减少重绘 */
  contain: layout style paint;
  will-change: scroll-position;
  
  /* 移除复杂的伪元素动画 */
  th, td {
    /* 简化边框实现 */
    border-bottom: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
    
    /* 移除伪元素 */
    &::before,
    &::after {
      display: none;
    }
  }
  
  /* 简化固定列样式 */
  .last-left-pinned-column {
    /* 移除过渡动画 */
    transition: none;
    will-change: auto;
    
    /* 简化阴影效果 */
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  }
}
```

### 5. 优化滚动事件处理

```typescript
// 优化useIsScrolling.ts
import { useCallback, useRef } from 'react';
import { throttle } from 'lodash';

const useIsScrolling = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [scrolling, setScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledScrollEnd = useCallback(
    throttle(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setScrolling(false);
      }, 150);
    }, 16), // 60fps
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolling(true);
      throttledScrollEnd();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      throttledScrollEnd.cancel();
      container.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, throttledScrollEnd]);

  return { scrolling };
};
```

### 6. 添加性能监控

```typescript
// 添加性能监控hook
const usePerformanceMonitor = () => {
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    const start = performance.now();
    const end = performance.now();
    setRenderTime(end - start);
  });
  
  return renderTime;
};

// 在组件中使用
const TBody = <T,>(props: Props<T>) => {
  const renderTime = usePerformanceMonitor();
  
  // 开发环境下输出性能信息
  if (process.env.NODE_ENV === 'development') {
    console.log(`TBody render time: ${renderTime}ms`);
  }
  
  // 组件实现
};
```

## 最佳实践

1. **优先添加虚拟滚动**：这是解决大数据量滚动性能最有效的方法
2. **减少样式计算**：使用useMemo缓存计算结果
3. **优化CSS**：移除复杂的伪元素和动画
4. **使用React.memo**：避免不必要的重渲染
5. **节流滚动事件**：减少事件处理频率
6. **监控性能**：定期检查渲染性能

## 实施建议

1. 首先实施虚拟滚动，这是最关键的优化
2. 然后优化样式计算和CSS
3. 最后添加性能监控和调试工具
4. 逐步测试和验证性能改进效果