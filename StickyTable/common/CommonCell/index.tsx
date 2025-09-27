import { PropsWithChildren } from 'react';
import { DotLoading } from 'antd-mobile';
import { observer } from 'mobx-react-lite';
import PopoverIcon from '@/components/StickyTable/PopoverIcon';
import './index.less';

interface Props {
  align?: 'left' | 'right' | 'center';
  tooltip?: string;
  placeholder?: string;
  color?: string;
  isPending?: boolean;
  isSummary?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const COLOR = {
  red: '#FF3434',
  green: '#50E3C2',
  inherit: 'inherit'
};

export const PopoverIconWithIndexScrolling = observer((props: { content: string }) => {
  const { content } = props;

  return <PopoverIcon content={content} isScrolling={false} />;
});

const Cell: React.FC<PropsWithChildren<Props>> = ({
  children,
  tooltip,
  placeholder = '-',
  color,
  align = 'right',
  isPending = false,
  style,
  className
}) => {
  return (
    <span
      className={`sticky-table-common-cell ${className}`}
      style={{
        color,
        justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        overflow: 'hidden',
        ...style
      }}
    >
      {isPending ? (
        <DotLoading />
      ) : (
        <span style={{ textAlign: align }}>{children || placeholder}</span>
      )}
      {tooltip && <PopoverIconWithIndexScrolling content={tooltip} />}
    </span>
  );
};

export default Cell;
