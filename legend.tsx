import { useMemo } from 'react';
import './index.less';

interface LegendItem {
  name: string;
  color: string;
  disabled?: boolean;
}

interface BarLegendProps {
  data: { name: string }[];
  color: string[];
  direction: 'down' | 'up';
  onLegendClick?: (name: string, disabled: boolean) => void;
  disabledItems?: string[];
}

const BarLegend = (props: BarLegendProps) => {
  const { data, color, direction, onLegendClick, disabledItems = [] } = props;
  
  const showData = useMemo(() => {
    const result = data.map((d, idx) => {
      return {
        ...d,
        color: color[idx],
        disabled: disabledItems.includes(d.name)
      };
    });
    return result.filter(item => item.name !== '-' && item.name !== '');
  }, [data, color, disabledItems]);

  const handleLegendClick = (item: LegendItem) => {
    onLegendClick?.(item.name, !item.disabled);
  };

  return (
    <div className={`bar-legend ${direction}`}>
      {showData.map((item: LegendItem, index: number) => (
        <div 
          key={item.name} 
          className={`bar-legend-item ${item.disabled ? 'disabled' : ''}`}
          onClick={() => handleLegendClick(item)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            style={{ 
              width: 8, 
              height: 8, 
              marginRight: 1, 
              backgroundColor: item.disabled ? '#ccc' : item.color,
              opacity: item.disabled ? 0.5 : 1
            }} 
          />
          <div style={{ opacity: item.disabled ? 0.5 : 1 }}>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default BarLegend;
