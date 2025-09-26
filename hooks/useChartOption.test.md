# useChartOption Hook 测试说明

## 修正内容

### 问题
之前的实现错误地使用了`series.show`属性来控制series的显示/隐藏，但ECharts的series对象中没有`show`属性。

### 解决方案
使用ECharts官方推荐的`legend.selected`配置来控制series的显示/隐藏。

## 实现原理

```typescript
// 错误的实现（已修正）
result.series = result.series.map((series: any) => {
  if (disabledLegendItems.includes(series.name)) {
    return {
      ...series,
      show: false  // ❌ series没有show属性
    };
  }
  return series;
});

// 正确的实现
if (result && result.legend && result.legend.data) {
  const selected: Record<string, boolean> = {};
  
  result.legend.data.forEach((item: any) => {
    selected[item.name] = !disabledLegendItems.includes(item.name);
  });
  
  result.legend.selected = selected;  // ✅ 使用legend.selected控制显示/隐藏
}
```

## ECharts legend.selected 说明

- `legend.selected`是一个对象，键为图例项名称，值为boolean
- `true`表示显示对应的series
- `false`表示隐藏对应的series
- 这是ECharts官方推荐的控制series显示/隐藏的方式

## 测试验证

1. 点击图例项应该能正确隐藏/显示对应的数据系列
2. 被隐藏的图例项应该显示为灰色并降低透明度
3. 重新点击被隐藏的图例项应该能重新显示对应的数据系列