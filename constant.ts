export const DEFAULT_OPTIONS = {
  xAxis: {
    showSpiltLine: true,
    ctgLabelRotate: 0,
    showAxis: true,
    showLabel: true
  },
  shadowBlur: '',
  showTrendLine: false,
  dataArea: false,
  legendShow: true,
  valueOrient: 'vertical',
  yAxes: [
    {
      showSpiltLine: true,
      min: {
        auto: false,
        value: 0
      },
      max: {
        auto: true
      },
      seriesType: 'STACKBAR',
      name: '',
      showAxis: true,
      showLabel: true
    },
    {
      min: {
        auto: true
      },
      showSpiltLine: false,
      max: {
        auto: true
      },
      name: '',
      showAxis: false,
      showLabel: false
    }
  ],
  diaphaneity: 50,
  legendY: 'top',
  shadowColor: '#A9B6E0',
  legendOrient: 'horizontal',
  legendX: 'left',
  smooth: true
};
