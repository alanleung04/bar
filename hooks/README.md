# Bar Chart Hooks

这个目录包含了柱状图组件的自定义hooks，用于实现图例筛选功能。

## Hooks

### `useLegendFilter`

管理图例项的显示/隐藏状态。

**功能：**
- 跟踪被禁用的图例项
- 提供图例点击处理函数
- 提供重置图例状态的功能
- 提供检查图例是否被禁用的功能

**使用示例：**
```typescript
const { disabledLegendItems, handleLegendClick, resetLegendFilter } = useLegendFilter({
  onDataChange: () => {
    // 当图例状态改变时的回调
  }
});
```

### `useChartOption`

根据图例筛选状态动态生成图表配置。

**功能：**
- 根据图例状态更新legend的selected配置来控制series显示/隐藏
- 处理图表配置的生成逻辑
- 错误处理

**实现原理：**
使用ECharts的`legend.selected`配置来控制series的显示/隐藏，这是ECharts官方推荐的方式。

**使用示例：**
```typescript
const chartOption = useChartOption({
  options,
  pending,
  error,
  useSort,
  disabledLegendItems
});
```

## 设计原则

1. **关注点分离**：将图例筛选逻辑从组件中分离出来
2. **可复用性**：hooks可以在其他图表组件中复用
3. **类型安全**：提供完整的TypeScript类型定义
4. **最小化修改**：对原始组件的修改最小化