import { HolderOutlined } from '@ant-design/icons';
import React, { useContext } from 'react';
import { RowContext } from '../../createContext';

export interface DragHandleProps {
  renderDragHandle?: React.ReactNode | undefined;
}

/**
 * 拖拽按钮
 * @param param0
 * @returns
 */
const DragHandle: React.FC<DragHandleProps> = ({
  renderDragHandle = undefined,
}) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <div style={{ cursor: 'move' }} ref={setActivatorNodeRef} {...listeners}>
      {renderDragHandle ? renderDragHandle : <HolderOutlined />}
    </div>
  );
};

export default DragHandle;
