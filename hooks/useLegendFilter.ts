import { useCallback, useState } from 'react';

interface UseLegendFilterOptions {
  onDataChange?: () => void;
}

interface UseLegendFilterReturn {
  disabledLegendItems: string[];
  handleLegendClick: (name: string, disabled: boolean) => void;
  resetLegendFilter: () => void;
  isLegendDisabled: (name: string) => boolean;
}

/**
 * 图例筛选功能的自定义hook
 * 提供图例项的显示/隐藏状态管理和相关操作
 */
export const useLegendFilter = (options?: UseLegendFilterOptions): UseLegendFilterReturn => {
  const { onDataChange } = options || {};
  const [disabledLegendItems, setDisabledLegendItems] = useState<string[]>([]);

  const handleLegendClick = useCallback((name: string, disabled: boolean) => {
    setDisabledLegendItems((prev: string[]) => {
      let newItems: string[];
      if (disabled) {
        newItems = [...prev, name];
      } else {
        newItems = prev.filter((item: string) => item !== name);
      }
      
      // 触发数据变化回调
      onDataChange?.();
      
      return newItems;
    });
  }, [onDataChange]);

  const resetLegendFilter = useCallback(() => {
    setDisabledLegendItems([]);
    onDataChange?.();
  }, [onDataChange]);

  const isLegendDisabled = useCallback((name: string) => {
    return disabledLegendItems.includes(name);
  }, [disabledLegendItems]);

  return {
    disabledLegendItems,
    handleLegendClick,
    resetLegendFilter,
    isLegendDisabled
  };
};