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
 * 拖拽排序树形表格组件
 * 基于 dnd-kit 和 antd Table 实现的可拖拽排序表格
 * 支持树形数据结构，子节点只能在相同父级下拖拽
 *
 * @param params DragSortSingleTableProps<RecordType> 组件参数
 * @returns React 组件
 */
const DragSortTreeTable = <RecordType extends object = any>({
  onDragSortEnd,
  isDrag = true,
  initialDataSource = [],
  columns,
  renderDragHandle = undefined,
  rowKey = 'id',
  childrenColumnName = 'children', // 默认子节点字段名为 children
  parentIdKey = 'parentId', // 默认父节点ID字段名为 parentId
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
   * 获取记录的父节点ID
   * @param record 数据记录
   * @returns 父节点ID或null
   */
  const getParentId = (record: RecordType): string | null => {
    return (record as any)[parentIdKey]
      ? String((record as any)[parentIdKey])
      : null;
  };

  /**
   * 递归查找并更新数据源
   * @param data 数据源
   * @param activeId 被拖动元素ID
   * @param overId 目标位置元素ID
   * @returns 更新后的数据源
   */
  const updateDataSource = (
    data: RecordType[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ): RecordType[] => {
    // 在当前层级查找元素
    const activeIndex = data.findIndex(
      (item) => getRecordKey(item) === activeId,
    );
    const overIndex = data.findIndex((item) => getRecordKey(item) === overId);

    // 如果在当前层级找到了元素，执行排序
    if (activeIndex !== -1 && overIndex !== -1) {
      return arrayMove(data, activeIndex, overIndex);
    }

    // 如果在当前层级没找到，递归查找子节点
    return data.map((item) => {
      const children = (item as any)[childrenColumnName];
      if (Array.isArray(children) && children.length > 0) {
        return {
          ...item,
          [childrenColumnName]: updateDataSource(children, activeId, overId),
        } as RecordType;
      }
      return item;
    });
  };

  /**
   * 拖拽结束事件：更新数据源
   * 当拖拽超出有效区域时（over 不存在），不会更新数据源
   * 子数据只能在相同父级下拖拽
   * @param {DragEndEvent} 拖拽结束事件对象，包含 active（拖拽元素）和 over（放置目标）
   */
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    // 只有当 over 存在且 id 不同时才更新数据
    if (over && active.id !== over.id) {
      // 获取拖动元素和目标元素的父节点ID
      const activeParentId = active.data.current?.parentId;
      const overParentId = over.data.current?.parentId;

      // 如果两个元素的父节点ID不同，则不允许拖拽
      // 父节点ID为null表示是顶级节点
      if (activeParentId !== overParentId) {
        return;
      }

      setDataSource((prevState) => {
        // 使用递归函数更新数据源
        const newDataSource = updateDataSource(prevState, active.id, over.id);

        // 调用回调函数，将最新数据传递给父组件
        onDragSortEnd?.(newDataSource);

        return newDataSource;
      });
    }
  };

  /**
   * 递归处理数据源，为每条记录添加parentId属性
   * @param data 原始数据
   * @param parentId 父节点ID
   * @returns 处理后的数据
   */
  const processDataWithParentId = (
    data: RecordType[],
    parentId: string | null = null,
  ): RecordType[] => {
    return data.map((item) => {
      const children = (item as any)[childrenColumnName];
      // 创建一个新对象，避免直接修改原始对象
      const newItem = { ...item } as any;
      // 设置父节点ID
      newItem[parentIdKey] = parentId;

      if (Array.isArray(children) && children.length > 0) {
        newItem[childrenColumnName] = processDataWithParentId(
          children,
          String(getRecordKey(item)),
        );
      }

      return newItem as RecordType;
    });
  };

  // 处理后的数据源，确保每条记录都有parentId
  const processedDataSource = useMemo(() => {
    return processDataWithParentId(dataSource);
  }, [dataSource]);

  /**
   * 获取所有行的ID，包括所有子行
   * 这是确保子级拖拽功能正常工作的关键
   * @param data 数据源
   * @returns 所有行ID的数组
   */
  const getAllRowKeys = (data: RecordType[]): UniqueIdentifier[] => {
    let keys: UniqueIdentifier[] = [];

    data.forEach((item) => {
      // 添加当前行ID
      keys.push(getRecordKey(item));

      // 递归添加子行ID
      const children = (item as any)[childrenColumnName];
      if (Array.isArray(children) && children.length > 0) {
        keys = [...keys, ...getAllRowKeys(children)];
      }
    });

    return keys;
  };

  /**
   * 构建表格列配置
   * 当启用拖拽功能时，自动在表格最左侧添加拖拽把手列，确保排序按钮在最外侧
   */
  const customColumns = useMemo(() => {
    const columnLists = [...columns];

    // 确保排序按钮和展开按钮不在同一列
    if (isDrag) {
      // 在最前面添加排序列
      columnLists.unshift({
        key: 'sort',
        title: '排序',
        width: 60,
        fixed: 'left',
        render: () => <DragHandle renderDragHandle={renderDragHandle} />,
      } as TableColumnType<RecordType>);
    }

    return columnLists;
  }, [columns, isDrag, rest.rowSelection]);

  /**
   * 自定义表格行属性，添加父节点ID
   * 使用any类型绕过TypeScript的类型检查
   */
  const onRow = isDrag
    ? (record: RecordType): any => ({
        'data-parent-id': getParentId(record),
      })
    : undefined;

  // 获取所有行ID，包括子行
  const allRowKeys = useMemo(() => {
    return getAllRowKeys(processedDataSource);
  }, [processedDataSource]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // 使用所有行的ID而不仅仅是顶级行，确保子行也可以拖拽
        items={allRowKeys}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...rest}
          rowKey={rowKey}
          columns={customColumns}
          dataSource={processedDataSource}
          components={isDrag ? { body: { row: TableRow } } : undefined}
          onRow={onRow}
          // 使用计算好的expandable配置
          expandable={{
            ...(rest?.expandable || {}),
            // expandIconColumnIndex：设置 展开按钮 位置
            expandIconColumnIndex:
              isDrag && !!rest?.rowSelection ? 3 : isDrag ? 1 : 0,
          }}
        />
      </SortableContext>
    </DndContext>
  );
};

export default DragSortTreeTable;
