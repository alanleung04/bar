# React Table 快速滚动白屏问题解决方案

## 问题分析

在使用@tanstack/react-table时，快速滚动出现白屏的主要原因：

1. **虚拟滚动overscan值过小**
2. **频繁的measure调用**
3. **复杂的样式计算**
4. **渲染性能瓶颈**

## 解决方案

### 1. 优化虚拟滚动配置

```typescript
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => (size === 'small' ? 39 : 49),
  overscan: 10, // 增加overscan值，提供更多缓冲
  measureElement: undefined, // 使用estimateSize而不是动态测量
});

const columnVirtualizer = useVirtualizer({
  horizontal: true,
  count: allColumns.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: index => allColumns[index]?.size ?? 150,
  overscan: 5, // 增加列虚拟化的overscan
});
```

### 2. 优化measure调用

```typescript
// 使用防抖来减少measure调用频率
const debouncedMeasure = useMemo(
  () => debounce(() => {
    columnVirtualizer.measure();
  }, 100),
  [columnVirtualizer]
);

useEffect(() => {
  debouncedMeasure();
}, [columnWidths, debouncedMeasure]);
```

### 3. 使用CSS transform优化

```typescript
// 使用CSS变量减少JavaScript计算
const virtualStyle = useMemo(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  width: '100%',
}), []);

// 在渲染时只计算必要的样式
{virtualScroll ? (
  rowVirtualizer.getVirtualItems().map(virtualRow => (
    <CommonTableCell
      key={rows[virtualRow.index]?.id}
      // ... 其他props
      virtualStyle={{
        ...virtualStyle,
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    />
  ))
) : (
  // 非虚拟滚动渲染
)}
```

### 4. 添加滚动节流

```typescript
import { throttle } from 'lodash';

const throttledScroll = useMemo(
  () => throttle((e: Event) => {
    // 处理滚动事件
  }, 16), // 60fps
  []
);

useEffect(() => {
  const container = tableContainerRef.current;
  if (container) {
    container.addEventListener('scroll', throttledScroll, { passive: true });
    return () => container.removeEventListener('scroll', throttledScroll);
  }
}, [throttledScroll]);
```

### 5. 使用React.memo优化组件

```typescript
const CommonTableCell = React.memo(({ 
  table, 
  columnCopy, 
  columnSelection, 
  filterValue, 
  size, 
  virtualRow, 
  virtualScroll, 
  virtualColumns, 
  virtualStyle 
}) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return (
    prevProps.virtualRow === nextProps.virtualRow &&
    prevProps.filterValue === nextProps.filterValue &&
    prevProps.size === nextProps.size
  );
});
```

### 6. 优化数据更新

```typescript
// 使用useMemo缓存计算结果
const processedData = useMemo(() => {
  return data.map((item, index) => ({
    ...item,
    auto_index: index + 1
  }));
}, [data]);

// 使用useCallback缓存函数
const handleColumnResize = useCallback((accessorKey: string, newWidth: number) => {
  if (onColumnWidthsChange) {
    onColumnWidthsChange(accessorKey, Math.max(newWidth, 40));
  } else {
    setInternalColumnWidths(widths => ({ 
      ...widths, 
      [accessorKey]: Math.max(newWidth, 40) 
    }));
  }
}, [onColumnWidthsChange]);
```

## 性能监控

### 添加性能监控

```typescript
const usePerformanceMonitor = () => {
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    const start = performance.now();
    const end = performance.now();
    setRenderTime(end - start);
  });
  
  return renderTime;
};
```

### 使用React DevTools Profiler

1. 打开React DevTools
2. 切换到Profiler标签
3. 开始录制
4. 执行快速滚动操作
5. 停止录制并分析性能瓶颈

## 最佳实践

1. **合理设置overscan值**：根据数据量和滚动速度调整
2. **减少不必要的重新渲染**：使用React.memo和useMemo
3. **优化样式计算**：使用CSS变量和transform
4. **节流滚动事件**：避免过于频繁的更新
5. **监控性能指标**：定期检查渲染性能