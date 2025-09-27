import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

interface StickyTableScrollOptions {
  throttleMs?: number;
  enableScrollDirection?: boolean;
  enableScrollPosition?: boolean;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onScroll?: (event: Event) => void;
}

interface StickyTableScrollReturn {
  scrolling: boolean;
  scrollDirection: 'up' | 'down' | null;
  scrollPosition: { x: number; y: number };
  isScrollingFast: boolean;
}

/**
 * StickyTable专用的滚动截流hook
 * 提供滚动状态管理、方向检测和快速滚动检测
 */
export const useStickyTableScroll = (
  containerRef: React.RefObject<HTMLDivElement>,
  options: StickyTableScrollOptions = {}
): StickyTableScrollReturn => {
  const {
    throttleMs = 16, // 默认60fps
    enableScrollDirection = true,
    enableScrollPosition = true,
    onScrollStart,
    onScrollEnd,
    onScroll
  } = options;

  const [scrolling, setScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isScrollingFast, setIsScrollingFast] = useState(false);

  const lastScrollY = useRef(0);
  const lastScrollX = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollEndTimeout = useRef<NodeJS.Timeout>();
  const fastScrollTimeout = useRef<NodeJS.Timeout>();

  // 检测快速滚动
  const checkFastScroll = useCallback((currentScrollY: number, currentTime: number) => {
    const deltaY = Math.abs(currentScrollY - lastScrollY.current);
    const deltaTime = currentTime - lastScrollTime.current;
    
    if (deltaTime > 0) {
      const scrollSpeed = deltaY / deltaTime; // 像素/毫秒
      const isFast = scrollSpeed > 2; // 超过2像素/毫秒认为是快速滚动
      
      setIsScrollingFast(isFast);
      
      // 快速滚动时延长结束时间
      if (isFast && fastScrollTimeout.current) {
        clearTimeout(fastScrollTimeout.current);
        fastScrollTimeout.current = setTimeout(() => {
          setIsScrollingFast(false);
        }, 300);
      }
    }
    
    lastScrollTime.current = currentTime;
  }, []);

  // 截流的滚动处理函数
  const throttledScrollHandler = useCallback(
    throttle((event: Event) => {
      const target = event.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      const currentScrollX = target.scrollLeft;
      const currentTime = Date.now();

      // 更新滚动位置
      if (enableScrollPosition) {
        setScrollPosition({ x: currentScrollX, y: currentScrollY });
      }

      // 计算滚动方向
      if (enableScrollDirection && currentScrollY !== lastScrollY.current) {
        setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
        lastScrollY.current = currentScrollY;
      }

      if (currentScrollX !== lastScrollX.current) {
        lastScrollX.current = currentScrollX;
      }

      // 检测快速滚动
      checkFastScroll(currentScrollY, currentTime);

      // 调用外部滚动回调
      onScroll?.(event);
    }, throttleMs),
    [throttleMs, enableScrollDirection, enableScrollPosition, onScroll, checkFastScroll]
  );

  // 滚动开始处理
  const handleScrollStart = useCallback(() => {
    if (!scrolling) {
      setScrolling(true);
      onScrollStart?.();
    }
  }, [scrolling, onScrollStart]);

  // 滚动结束处理
  const handleScrollEnd = useCallback(() => {
    if (scrollEndTimeout.current) {
      clearTimeout(scrollEndTimeout.current);
    }
    
    // 根据是否快速滚动调整结束延迟
    const endDelay = isScrollingFast ? 300 : 150;
    
    scrollEndTimeout.current = setTimeout(() => {
      setScrolling(false);
      setScrollDirection(null);
      setIsScrollingFast(false);
      onScrollEnd?.();
    }, endDelay);
  }, [onScrollEnd, isScrollingFast]);

  // 主滚动事件处理
  const handleScroll = useCallback((event: Event) => {
    handleScrollStart();
    throttledScrollHandler(event);
    handleScrollEnd();
  }, [handleScrollStart, throttledScrollHandler, handleScrollEnd]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 添加滚动事件监听器，使用passive提高性能
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      throttledScrollHandler.cancel();
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
      if (fastScrollTimeout.current) {
        clearTimeout(fastScrollTimeout.current);
      }
    };
  }, [containerRef, handleScroll, throttledScrollHandler]);

  return {
    scrolling,
    scrollDirection,
    scrollPosition,
    isScrollingFast
  };
};

export default useStickyTableScroll;