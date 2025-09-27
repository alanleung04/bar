import './index.less';

interface Props {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const SeparateCell = (props: Props) => {
  const { leftContent, rightContent } = props;

  return (
    <div className="sticky-table-separate-cell">
      <div className="left-content">{leftContent}</div>
      <div className="separator" />
      <div className="right-content">{rightContent}</div>
    </div>
  );
};

export default SeparateCell;
