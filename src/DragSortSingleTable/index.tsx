import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Table, TableColumnType } from 'antd';
import React, { useEffect, useMemo } from 'react';

//------ 内部 ------
import DragHandle from './components/DragHandle';
import TableRow from './components/TableRow';
import { DragSortSingleTableProps } from './types';

/**
 * 单表格拖拽排序组件
 * 基于 dnd-kit 和 antd Table 实现的可拖拽排序表格
 *
 * @param params DragSortSingleTableProps<RecordType> 组件参数
 * @returns React 组件
 */
const DragSortSingleTable = <RecordType extends object = any>({
  rowKey = 'id',
  isDrag = true,
  initialDataSource = [],
  columns,
  renderDragHandle = undefined,
  onDragSortEnd,
  ...rest
}: DragSortSingleTableProps<RecordType>) => {
  // 内部维持数据源
  const [dataSource, setDataSource] = React.useState<RecordType[]>([]);

  // 当初始数据源变化时，更新内部数据源
  useEffect(() => {
    if (Array.isArray(initialDataSource)) {
      setDataSource([...initialDataSource]);
    }
  }, [initialDataSource]);

  /**
   * 获取记录的唯一键
   * 支持字符串 key 或函数形式的 rowKey
   * @param record 数据记录
   * @returns 唯一标识符
   */
  const getRecordKey = (record: RecordType): UniqueIdentifier => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String((record as any)[rowKey]);
  };

  /**
   * 拖拽结束事件：更新数据源
   * 当拖拽超出有效区域时（over 不存在），不会更新数据源
   * @param {DragEndEvent} 拖拽结束事件对象，包含 active（拖拽元素）和 over（放置目标）
   */
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    // 只有当 over 存在且 id 不同时才更新数据
    if (over && active.id !== over.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex(
          (record) => getRecordKey(record) === active?.id,
        );
        const overIndex = prevState.findIndex(
          (record) => getRecordKey(record) === over?.id,
        );
        const newDataSource = arrayMove(prevState, activeIndex, overIndex);

        // 调用回调函数，将最新数据传递给父组件
        onDragSortEnd?.(newDataSource);

        return newDataSource;
      });
    }
  };

  /**
   * 构建表格列配置
   * 当启用拖拽功能时，自动在表格最左侧添加拖拽把手列
   */
  const customColumns = useMemo(() => {
    const columnLists = [...columns];
    if (isDrag) {
      columnLists.unshift({
        key: 'sort',
        align: 'center',
        width: 80,
        render: () => <DragHandle renderDragHandle={renderDragHandle} />,
      } as TableColumnType<RecordType>);
    }
    return columnLists;
  }, [columns, isDrag]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        items={dataSource.map((i) => getRecordKey(i))}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...rest}
          rowKey={rowKey}
          columns={customColumns}
          dataSource={dataSource}
          components={isDrag ? { body: { row: TableRow } } : undefined}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DragSortSingleTable;
