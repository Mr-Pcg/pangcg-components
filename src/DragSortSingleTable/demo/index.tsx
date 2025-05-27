import { message, TableColumnsType } from 'antd';
import { DragSortSingleTable, generateUUID } from 'pangcg-components';
import React, { useState } from 'react';

interface DataType {
  id: string;
  name: string;
  age: number;
  address: string;
}

const DemoPage = () => {
  const columns: TableColumnsType<DataType> = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Address', dataIndex: 'address' },
  ];

  const initialData: DataType[] = Array.from({ length: 15 }, (_, index) => ({
    id: generateUUID(),
    name: `用户 ${index + 1}`,
    age: Math.floor(Math.random() * 50) + 18,
    address: `城市 ${String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
    )} 第 ${index + 1} 街区`,
  }));

  const [dataSource, setDataSource] = useState<DataType[]>([...initialData]);

  return (
    <div>
      <DragSortSingleTable<DataType>
        rowKey="id"
        initialDataSource={dataSource}
        columns={columns}
        pagination={false}
        onDragSortEnd={(newList) => {
          message.success('数据更新成功');
          setDataSource([...newList]);
          console.log('-----', newList);
        }}
      />
    </div>
  );
};

export default DemoPage;
