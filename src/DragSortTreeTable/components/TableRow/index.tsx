import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo } from 'react';

// 内部依赖
import { RowContext } from '../../createContext';
import { RowContextProps, RowProps } from '../../types';

/**
 * 可拖拽排序表格行组件
 * 使用 @dnd-kit/sortable 提供的拖拽功能
 * @param props 表格行属性，包含 data-row-key 作为唯一标识
 */
const TableRow: React.FC<RowProps> = (props) => {
  // 获取父节点ID
  const parentId = props['data-parent-id'];
  // 获取行ID
  const rowKey = props['data-row-key'];

  // 使用 useSortable hook 获取拖拽相关属性和方法
  const {
    attributes, // 拖拽元素属性
    listeners, // 拖拽事件监听器
    transform, // 拖拽时的变换属性
    transition, // 拖拽时的过渡效果
    isDragging, // 是否正在拖拽
    setNodeRef, // 设置可拖拽节点引用的函数
    setActivatorNodeRef, // 设置拖拽触发节点引用的函数
  } = useSortable({
    id: rowKey,
    data: {
      parentId, // 在拖拽数据中添加父节点ID
    },
  });

  // 合并样式，添加拖拽相关的样式
  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    // 拖拽时提升层级，确保拖拽元素显示在其他元素之上
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    // 确保拖拽样式在嵌套级别也有效
    cursor: 'pointer',
  };

  // 创建上下文值，提供给子组件使用
  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners, parentId }),
    [setActivatorNodeRef, listeners, parentId],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export default TableRow;
