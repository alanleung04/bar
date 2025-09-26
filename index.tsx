import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBlock } from 'antd-mobile';
import ChartLoading from '@/components/ChartLoading';
import Echarts, { ECOption } from '@/components/Echarts';
import { TimeDimensionType } from '@/hooks/useTimeDimensionType';
import { TimeCompareTrendPopover, usePopoverData } from '@/render/TimeCompareTrendPopover';
import type { TableResponse, TrendChartResponse } from '@/types';
import BarLegend from './legend';
import { xAxisDataIsEmpty } from '@/render/shared/utils';
import { useLegendFilter, useChartOption } from './hooks';

interface Props {
  chartData?: TrendChartResponse;
  pending?: boolean;
  error?: boolean;
  legendDirection?: 'down' | 'up';
  height?: string;
  timeDimensionType?: TimeDimensionType;
  timeTabName?: string;
  useSort?: boolean;
  // onLongPress?: (dataIndex: number, options: ECOption) => void;
  // onMouseout?: () => void;
}

const Bar = (props: Props) => {
  const {
    chartData,
    pending,
    error,
    timeDimensionType,
    legendDirection = 'down',
    height,
    timeTabName,
    useSort = false
  } = props;
  const [chartError, setChartError] = useState<string | null>(null);
  const [legendHeight, setLegendHeight] = useState<number>(0);
  const legendRef = useRef<HTMLDivElement>(null);

  const queryGranularity = useMemo(() => {
    if (timeDimensionType === 'singleDay') {
      return 'half_an_hour';
    }
    if (timeTabName) {
      return timeTabName;
    }
    return 'day';
  }, [timeDimensionType, timeTabName]);

  const options = useMemo(() => {
    return {
      ...chartData?.aggregateData,
      chartConfig: chartData?.chartConfig
    };
  }, [chartData]);

  // 使用图例筛选hook
  const { disabledLegendItems, handleLegendClick, resetLegendFilter } = useLegendFilter({
    onDataChange: () => {
      // 当图例状态改变时，可以在这里添加额外的逻辑
    }
  });

  // 使用图表配置hook
  const chartOption = useChartOption({
    options,
    pending,
    error,
    useSort,
    disabledLegendItems
  });

  // 处理图表错误状态
  useEffect(() => {
    if (chartOption === null && !pending && !error && options.chartConfig) {
      setChartError('图表渲染失败');
    } else {
      setChartError(null);
    }
  }, [chartOption, pending, error, options.chartConfig]);

  const { activeIndex, setActiveIndex, header, rows } = usePopoverData({
    queryGranularity: queryGranularity,
    chartData: chartOption!,
    options: options as { chartConfig: TableResponse['chartConfig'] } | undefined,
    useSort
  });

  const onMouseout = useCallback(() => {
    setActiveIndex(null);
  }, [setActiveIndex]);

  const mouseoutChart = useCallback(() => {
    onMouseout();
  }, [onMouseout]);

  const onLongPress = useCallback(
    (index: number, options: ECOption) => {
      if (!chartOption) {
        setActiveIndex(null);
        onMouseout();
        return;
      }
      const xAxisDataLength = xAxisDataIsEmpty(chartOption);
      if (index < 0 || index >= (xAxisDataLength ?? 0)) {
        setActiveIndex(null);
        return;
      }

      setActiveIndex(index);
    },
    [chartOption, onMouseout, setActiveIndex]
  );

  const longPressChart = useCallback(
    (dataIndex: number) => {
      if (!chartOption) return;
      const xAxisDataLength = xAxisDataIsEmpty(chartOption);
      const index = dataIndex < 0 || dataIndex >= xAxisDataLength ? undefined : dataIndex;
      if (index === undefined) {
        mouseoutChart?.();
        return;
      }
      onLongPress?.(index, options);
    },
    [chartOption, mouseoutChart, options, onLongPress]
  );

  // 重置错误状态当数据改变时
  useEffect(() => {
    if (chartData) {
      setChartError(null);
      resetLegendFilter(); // 重置图例状态
    } else {
      setActiveIndex(null);
      resetLegendFilter();
    }
  }, [chartData, resetLegendFilter]);

  const legendData = useMemo(() => {
    return chartOption?.legend?.data || [];
  }, [chartOption]);

  const updateLegendHeight = () => {
    if (legendRef.current) {
      const rect = legendRef.current.getBoundingClientRect();
      setLegendHeight(rect.height);
    }
  };

  const resizeObserver = useMemo(() => {
    return new ResizeObserver(updateLegendHeight);
  }, [updateLegendHeight]);

  const echartsContainerStyle = useMemo(() => {
    const res = {
      height: legendData.length > 0 ? `calc(100% - ${legendHeight}px)` : '100%'
    };
    return res;
  }, [legendData.length, legendHeight]);

  const containerStyle = useMemo(() => {
    return { height, position: 'relative' as const };
  }, [height]);

  // 监听legend高度变化
  useEffect(() => {
    // 初始测量
    updateLegendHeight();

    const currentElement = legendRef.current;
    if (currentElement) {
      resizeObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        resizeObserver.unobserve(currentElement);
      }
    };
  }, [legendData, resizeObserver, updateLegendHeight]);

  // 显示加载状态
  if (pending) {
    return (
      <div style={containerStyle}>
        <ChartLoading />
      </div>
    );
  }

  // 优先显示数据错误
  if (error || chartError || !chartOption || !Object.keys(chartOption).length) {
    return <ErrorBlock status="empty" title="" description="暂无数据" />;
  }

  // 正常渲染图表
  return (
    <>
      <div style={containerStyle} className="bar-chart-container">
        {activeIndex !== null && <TimeCompareTrendPopover rows={rows} header={header} />}
        {legendData.length > 0 && useSort && (
          <div ref={legendRef}>
            <BarLegend 
              data={legendData} 
              color={chartOption?.color} 
              direction={legendDirection}
              onLegendClick={handleLegendClick}
              disabledItems={disabledLegendItems}
            />
          </div>
        )}
        <div style={echartsContainerStyle}>
          <Echarts option={chartOption} onMouseout={mouseoutChart} onLongPress={longPressChart} />
        </div>
      </div>
    </>
  );
};

export default Bar;
