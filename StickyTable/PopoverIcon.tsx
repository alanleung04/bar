import { useContext, useEffect, useRef } from 'react';
import { Popover, PopoverRef } from 'antd-mobile';
import { QuestionCircleOutline } from 'antd-mobile-icons';
import { px2vw } from '@/utils/tools';
import { ScrollContext } from '.';

const PopoverIcon = (props: { content: string; isScrolling?: boolean }) => {
  const { content, isScrolling } = props;
  const popoverRef = useRef<PopoverRef>(null);
  const { scrolling: tableScrolling } = useContext(ScrollContext);

  useEffect(() => {
    if (isScrolling || tableScrolling) {
      popoverRef.current?.hide();
    }
  }, [isScrolling, tableScrolling]);

  return (
    <Popover
      ref={popoverRef}
      className="table-popover-icon"
      content={content}
      trigger="click"
      style={{ fontSize: px2vw(12) }}
    >
      <QuestionCircleOutline style={{ marginLeft: px2vw(4) }} />
    </Popover>
  );
};

export default PopoverIcon;
