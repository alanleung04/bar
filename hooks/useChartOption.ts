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
      
      // 根据图例状态更新series的显示状态
      if (result && result.series && disabledLegendItems.length > 0) {
        result.series = result.series.map((series: any) => {
          if (disabledLegendItems.includes(series.name)) {
            return {
              ...series,
              show: false
            };
          }
          return series;
        });
      }
      
      return result;
    } catch (err) {
      console.error('图表渲染错误:', err);
      return null;
    }
  }, [options, pending, error, useSort, disabledLegendItems]);

  return chartOption;
};