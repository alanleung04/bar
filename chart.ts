import { cloneDeep } from 'lodash';
import { PIE_COLORS } from '../pie/constants';
import { BASE_OPTIONS } from '../shared/constants';
import { createSumData, getDataSource, getLegendConfig } from '../shared/utils';
import { format } from '../shared/utils/numbro';
const base = cloneDeep(BASE_OPTIONS);

// 折线&柱状
export const getLineAndBarOption = (chartConfig?: any) => {
  let o = {
    ...base,
    legend: {
      // ...base.legend,
      // bottom: 8
    },
    xAxis: {
      type: 'category',
      splitLine: {
        show: false,
        // disabled: true,
        lineStyle: {
          type: 'dashed',
          color: ['#e8e8e8']
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false // 隐藏 y 轴的轴线
      },
      splitLine: {
        show: false
        // lineStyle: {
        // type: 'dashed',
        // color: ['#e8e8e8']
        // }
      },
      axisLabel: {
        formatter: function (value: any) {
          if (value > 1000000000) {
            return (Number(value) / 1000000000).toFixed(0) + 'b';
          } else if (value > 1000000) {
            return (Number(value) / 1000000).toFixed(0) + 'm';
          } else if (value > 1000) {
            return (Number(value) / 1000).toFixed(0) + 'k';
          } else {
            return value;
          }
        }
      }
    }
  };

  //   if (chartConfig.option) {
  //     adjustLegend(o, chartConfig.option);
  //   }

  return o;
};

export function createBarOrLineChart(chartInfo: any, disabledLegend: boolean = false) {
  // 基础数据验证
  if (!chartInfo) {
    throw new Error('chartInfo参数缺失');
  }

  if (!chartInfo.chartConfig) {
    throw new Error('chartConfig配置缺失');
  }

  if (!chartInfo.chartConfig.option) {
    throw new Error('chartConfig.option配置缺失');
  }

  const { datasetSource, indicatorList } = getDataSource(chartInfo);

  if (!datasetSource || !Array.isArray(datasetSource) || datasetSource.length === 0) {
    throw new Error('数据源为空或格式不正确');
  }

  let [xAxisData, ...source] = datasetSource;

  source = source.filter(item => item[0] !== '-');

  const baseOption = getLineAndBarOption(chartInfo.chartConfig);

  const {
    chartConfig: { option, values }
  } = chartInfo;

  // 验证关键配置
  if (!values || !Array.isArray(values)) {
    throw new Error('values配置缺失或格式不正确');
  }
  // 拿到所有的图形序列
  const seriesList = source.map(s => {
    const s_name = s[0];
    // 指标名称
    const indicatorName = s_name.split('-').pop();
    const chart = indicatorList.find((c: any) => c.name === indicatorName);
    return {
      ...chart,
      name: s_name
    };
  });

  let sumData = createSumData(seriesList, source);

  if (source && source.length > 0) {
    // values长度对应Y轴数量，最大为2

    let yAxes = Array.isArray(option.yAxes) ? option.yAxes : [option.yAxes];

    // 验证yAxes数据的完整性
    if (!yAxes || yAxes.length === 0) {
      throw new Error('yAxes配置缺失或为空');
    }

    let yAxis = yAxes.map((_c: any, axisIndex: number) => {
      // 验证每个yAxis配置项
      if (!_c || typeof _c !== 'object') {
        throw new Error(`yAxes[${axisIndex}]配置项无效或缺失`);
      }

      const _valueFormatter = '';
      //  values[axisIndex]?.cols[0]?.formatter;
      // ('fullWithNoDecimals');
      //

      let axis: StoreKeyValue = {
        ...baseOption.yAxis
      };

      // 安全解构，提供默认值
      const {
        max = null,
        min = null,
        name = '',
        showAxis = false,
        showLabel = true,
        showSpiltLine = false
      } = _c;

      axis.axisLine = {
        show: showAxis
        // lineStyle: {
        //   color: getVisionStyle('axis-color')
        // }
      };

      axis.axisLabel = {
        show: showLabel,
        formatter: (label: any) => {
          return format(label, _valueFormatter);
        }
        // color: getVisionStyle('label-text-color')
      };

      axis.splitLine = {
        show: axisIndex === 0 ? showSpiltLine : false,
        lineStyle: {
          type: 'dashed'
          //   color: getVisionStyle('split-line-color')
        }
      };
      if (name) axis.name = name;

      if (max && !max.auto) {
        axis.max = max.value;
      }

      if (min && !min.auto) {
        axis.min = min.value;
      }

      axis.scale = true;

      return axis;
    });

    let xAxis = {
      type: 'category',
      data: xAxisData.slice(1),
      axisLine: {
        show: option.xAxis.showAxis,
        lineStyle: {
          //   color: getVisionStyle('axis-color')
        }
      },
      axisLabel: {
        show: option.xAxis.showLabel,
        interval: option.xAxis.ctgLabelInterval || 'auto',
        rotate: option.xAxis.ctgLabelRotate,
        formatter: (label: any) => {
          return label.length > 11 ? label.substr(0, 11) + '\n' + label.substr(11) : label;
        }
        // color: getVisionStyle('label-text-color')
      },
      splitLine: {
        show: false,
        // option.xAxis.showSpiltLine,
        lineStyle: {
          type: 'dashed'
          //   color: getVisionStyle('split-line-color')
        }
      }
    };

    if (option.valueOrient === 'horizontal') {
      [xAxis, yAxis] = [yAxis, xAxis];
    }

    // let tooltip: StoreKeyValue = {
    //   trigger: 'axis',
    //   confine: true,
    //   ...getTooltipStyle(),
    //   formatter: function (params: any) {
    //     let name = params[0].name;

    //     const [prefix, suffix] = splitName(name);

    //     const _name = name.length > 20 ? prefix + '-' + '</br>' + suffix : name;
    //     let back = '';
    //     back = _name + '<br/>';

    //     // 如果是stack 需要特殊处理tooltip
    //     let reverseParams = cloneDeep(params);

    //     if (seriesList.length > 1) {
    //       // 对每个轴单独处理
    //       const yAxes = chartInfo.chartConfig.option.yAxes;

    //       // 按轴分组参数
    //       const paramsByAxis: any = {};
    //       reverseParams.forEach((param: any) => {
    //         const { seriesIndex } = param;
    //         const series = seriesList?.[seriesIndex];
    //         if (series && series.index !== undefined) {
    //           if (!paramsByAxis[series.index]) {
    //             paramsByAxis[series.index] = [];
    //           }
    //           paramsByAxis[series.index].push(param);
    //         }
    //       });

    //       // 对每个轴内的参数单独reverse
    //       Object.keys(paramsByAxis).forEach(axisIndex => {
    //         const axisParams = paramsByAxis?.[axisIndex];
    //         const axisConfig = yAxes?.[axisIndex];

    //         if (axisConfig && ['PERCENTBAR', 'STACKBAR'].includes(axisConfig.seriesType)) {
    //           axisParams.reverse();
    //         }
    //       });

    //       // 重新组合参数
    //       reverseParams = Object.values(paramsByAxis).flat();
    //     }

    //     reverseParams.forEach((p: any, index: number) => {
    //       const { data, marker, seriesName, dataIndex, seriesIndex } = p;

    //       // 安全检查：如果seriesIndex超出seriesList范围，跳过该系列（可能是趋势面积图系列）
    //       if (!seriesList[seriesIndex]) {
    //         return; // 跳过趋势面积图系列
    //       }

    //       // const { formatter, series_type } = seriesList[index];

    //       // const chart = seriesList.find((c: any) => c.name === p.seriesName);
    //       const { index: yAxesIndex, formatter } = seriesList[seriesIndex];
    //       const { seriesType: series_type } = chartInfo.chartConfig.option.yAxes[yAxesIndex];

    //       let _data: any = '';
    //       if (series_type?.toUpperCase() === 'PERCENTBAR') {
    //         const num = source[seriesIndex][dataIndex + 1];
    //         _data = `${data === 'NaN' ? '****' : data + '%'} (${
    //           formatter && num !== '-' ? format(num, formatter) : num
    //         })`;
    //       } else {
    //         _data = formatter && data !== '-' ? format(data, formatter) : data;
    //       }

    //       back += `${marker}${seriesName}: ${_data}<br/>`;
    //     });

    //     return back;
    //   }
    // };

    let legend = {
      ...baseOption.legend,
      ...getLegendConfig(chartInfo.chartConfig.option),
      data: source.map(s => {
        const _name = s[0];
        const chart = seriesList.find((c: any) => c.name === _name);
        return {
          name: s[0],
          icon: chart.index === 0 ? 'circle' : 'rect'
        };
      }),
      // top: 0,
      bottom: '0%',
      itemGap: 4, // 图例项之间的间距
      padding: [0, 0, 0, 0],
      itemHeight: 8,
      // selectorItemGap: 0,
      itemWidth: 8,
      // itemStyle 移除负数padding，会导致布局问题
      textStyle: {
        padding: [0, 0, 0, -4], // 文本左侧4px间距，增加色块和文字间距
        fontSize: 10, // 减小字体
        color: '#666'
      },
      // itemStyle:{}
      // ...getLegendStyle(),
      // 如果启用趋势线，禁用图例点击事件
      selectedMode: !disabledLegend,
      show: !disabledLegend
    };

    let series = source.map(s => {
      const [name, ...data] = s;
      const chart = seriesList.find((c: any) => c.name === name);
      const { index } = chart;

      const { seriesType: series_type } = chartInfo.chartConfig.option.yAxes[index];
      const { smooth, dataArea, diaphaneity, shadowColor, shadowBlur } =
        chartInfo.chartConfig.option; //后端返回的配置

      // 如果指标不带 series_type 字段，取备用的type
      let _series_type = (series_type || chartInfo.chartConfig.type).toLowerCase();

      let _option: StoreKeyValue = Object.assign(
        {
          type: _series_type,
          seriesLayoutBy: 'row',
          smooth,
          name,
          data
        },
        option.valueOrient === 'horizontal'
          ? {
              xAxisIndex: index
            }
          : {
              yAxisIndex: index
            }
      );

      if (dataArea) {
        //面积图
        _option.areaStyle = {
          shadowColor,
          shadowBlur,
          opacity: diaphaneity ? diaphaneity / 100 : 1
        };
      }

      let subType: null | string = null; // 图表第二类型，堆叠、百分比堆叠

      ['stack', 'percent'].forEach(type => {
        if (_series_type.indexOf(type) >= 0) {
          _option.type = _series_type.replace(type, '');
          subType = type;
        }
      });

      if (_option.type === 'bar') {
        _option.barMaxWidth = 20;
      }

      if (subType === 'stack') {
        _option.stack = index.toString();
      }

      if (subType === 'percent') {
        _option.data = data.map((d: any, _index: number) => {
          return ((d / sumData[index][_index]) * 100).toFixed(2);
        });
        _option.stack = index.toString();
      }

      return _option;
    });

    let finalOption = {
      ...baseOption,
      color: PIE_COLORS,
      dataZoom: [
        {
          type: 'inside',
          throttle: 200, // 增加节流时间，降低响应频率
          minValueSpan: 6,
          start: 70, // 显示全部数据范围，避免过滤掉有效数据
          end: 100,
          zoomLock: true,
          zoomSensitivity: 0.3, // 降低缩放灵敏度 (默认1)
          moveThreshold: 5, // 增加移动阈值，需要更大的移动距离才触发
          preventDefaultMouseMove: false, // 防止被动事件监听器错误
          filterMode: 'none'
        }
      ],
      tooltip: {
        trigger: 'axis',
        // show: true,
        showContent: false
        // axisPointer: {
        //   type: 'shadow'
        // }

        // conte
      },
      //   tooltip,
      yAxis,
      grid: {
        ...baseOption.grid,
        ...(disabledLegend ? {} : { top: '36px' })
      },
      legend,
      series,
      xAxis
      //   showTrendLine: option.showTrendLine || false
    };

    return finalOption as any;
  } else {
    return {};
  }
}
