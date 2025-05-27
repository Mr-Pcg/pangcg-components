import { message, TableColumnsType } from 'antd';
import { DragSortTreeTable, generateUUID } from 'pangcg-components';
import React, { useState } from 'react';

interface DataType {
  id: string;
  name: string;
  age: number;
  address: string;
  children?: DataType[];
  parentId?: string;
}

const DemoPage = () => {
  const columns: TableColumnsType<DataType> = [
    { title: '名称', dataIndex: 'name' },
    { title: '年龄', dataIndex: 'age' },
    { title: '地址', dataIndex: 'address' },
  ];

  // 生成树形数据
  const generateTreeData = (
    depth = 0,
    parentId?: string,
    parentIndex?: string | number,
  ): DataType[] => {
    if (depth >= 3) return []; // 最多生成3层

    const count = depth === 0 ? 5 : Math.floor(Math.random() * 3) + 1; // 第一层5个，子节点1-3个随机

    return Array.from({ length: count }, (_, index) => {
      const id = generateUUID();
      const nodeIndex =
        parentIndex !== undefined
          ? `${parentIndex}-${index + 1}`
          : `${index + 1}`;
      const nodeData: DataType = {
        id,
        parentId,
        name: `节点 ${nodeIndex}`,
        age: Math.floor(Math.random() * 50) + 18,
        address: `城市 ${String.fromCharCode(
          65 + Math.floor(Math.random() * 26),
        )} 第 ${nodeIndex} 街区`,
      };

      const children = generateTreeData(depth + 1, id, nodeIndex);
      if (children.length > 0) {
        nodeData.children = children;
      }

      return nodeData;
    });
  };

  const initialData: DataType[] = generateTreeData();
  const [dataSource, setDataSource] = useState<DataType[]>([...initialData]);

  // 添加选中行的状态管理
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 多选功能相关配置
  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys: React.Key[]) => {
  //     console.log('-newSelectedRowKeys--', newSelectedRowKeys);
  //     setSelectedRowKeys(newSelectedRowKeys);
  //   },
  // };

  return (
    <div>
      <DragSortTreeTable<DataType>
        rowKey="id"
        initialDataSource={dataSource}
        columns={columns}
        pagination={false}
        onDragSortEnd={(newList) => {
          message.success('数据更新成功');
          setDataSource([...newList]);
          console.log('树形数据更新:', newList);
        }}
        // rowSelection={rowSelection}
      />
    </div>
  );
};

export default DemoPage;
