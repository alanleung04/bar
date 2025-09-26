import { useMemo } from 'react';
import { createBarOrLineChart } from '../chart';

interface UseChartOptionOptions {
  options: any;
  pending?: boolean;
  error?: boolean;
  useSort?: boolean;
  disabledLegendItems: string[];
}

/**
 * 图表配置的自定义hook
 * 根据图例筛选状态动态更新图表配置
 */
export const useChartOption = ({
  options,
  pending,
  error,
  useSort,
  disabledLegendItems
}: UseChartOptionOptions) => {
  const chartOption = useMemo(() => {
    if (pending || error) {
      return null;
    }
    if (!options.chartConfig) {
      return null;
    }
    
    try {
      const result = createBarOrLineChart(options, useSort || false);
      
      // 根据图例状态更新legend的selected配置
      if (result && result.legend && result.legend.data) {
        const selected: Record<string, boolean> = {};
        
        // 设置每个图例项的显示状态
        result.legend.data.forEach((item: any) => {
          selected[item.name] = !disabledLegendItems.includes(item.name);
        });
        
        result.legend.selected = selected;
      }
      
      return result;
    } catch (err) {
      console.error('图表渲染错误:', err);
      return null;
    }
  }, [options, pending, error, useSort, disabledLegendItems]);

  return chartOption;
};