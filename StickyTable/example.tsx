import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import StickyTable from './index';

// 示例数据类型
interface Person {
  id: number;
  name: string;
  age: number;
  email: string;
}

// 示例数据
const data: Person[] = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
  { id: 3, name: '王五', age: 35, email: 'wangwu@example.com' },
  // ... 更多数据
];

// 创建表格配置
const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    size: 80,
  }),
  columnHelper.accessor('name', {
    header: '姓名',
    size: 120,
  }),
  columnHelper.accessor('age', {
    header: '年龄',
    size: 80,
  }),
  columnHelper.accessor('email', {
    header: '邮箱',
    size: 200,
  }),
];

// 基础使用示例
export const BasicExample = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StickyTable
      table={table}
      style={{ height: '400px' }}
    />
  );
};

// 启用滚动截流的示例
export const ScrollThrottleExample = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleScrollStart = () => {
    console.log('开始滚动');
  };

  const handleScrollEnd = () => {
    console.log('滚动结束');
  };

  const handleScroll = (event: Event) => {
    // 自定义滚动处理
    console.log('滚动中...');
  };

  return (
    <StickyTable
      table={table}
      style={{ height: '400px' }}
      scrollThrottle={{
        throttleMs: 16, // 60fps
        enableScrollDirection: true,
        enableScrollPosition: true,
        onScrollStart: handleScrollStart,
        onScrollEnd: handleScrollEnd,
        onScroll: handleScroll,
      }}
    />
  );
};

// 高性能配置示例
export const HighPerformanceExample = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StickyTable
      table={table}
      style={{ height: '600px' }}
      scrollThrottle={{
        throttleMs: 8, // 120fps，适合高性能设备
        enableScrollDirection: true,
        enableScrollPosition: false, // 禁用位置跟踪以提升性能
      }}
    />
  );
};

// 低性能设备配置示例
export const LowPerformanceExample = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StickyTable
      table={table}
      style={{ height: '400px' }}
      scrollThrottle={{
        throttleMs: 32, // 30fps，适合低性能设备
        enableScrollDirection: false, // 禁用方向检测
        enableScrollPosition: false, // 禁用位置跟踪
      }}
    />
  );
};