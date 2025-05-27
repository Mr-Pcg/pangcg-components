import { Button, ConfigProvider, Form, Popconfirm, Radio, Space } from 'antd';
import {
  EditColumnsType,
  EditFormTable,
  generateUUID,
  useEditFormTable,
} from 'pangcg-components';
import React, { useEffect, useState } from 'react';

// 配置 antd 的 国际化
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

interface PersonInfo {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  bothday: string;
  health: 1 | 2;
  hireOrResignationDate: [string, string];
}

const EditFormTableDemo = () => {
  const [form] = Form.useForm();
  // 添加选中行的状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    // addRecord,
    deleteRecord,
    updateRecord,
    updateFormList,
    updateRecordField,
  } = useEditFormTable(form);

  useEffect(() => {
    // 给表格设置值
    form.setFieldValue('list', [
      {
        id: '0000',
        name: '小刚',
        age: 32,
        gender: 'male',
        isMarried: true,
        health: 1,
      },
      {
        id: '11111',
        name: '小理想',
        age: 35,
        gender: 'female',
        isMarried: false,
        health: 2,
      },
    ]);
  }, []);

  const newData = () => {
    return {
      id: `add-${generateUUID()}`, // 新增数据，需要有和组件 rowKey 绑定相同的字段且赋值唯一
      name: '新记录',
      gender: 'male',
      age: '18',
      health: 1,
      bothday: dayjs(),
    };
  };

  // 定义列配置
  const columns: EditColumnsType<PersonInfo> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      componentType: 'input',
      // componentProps 继承 antd 的 InputProps， 参考 antd 的 Input 组件
      componentProps: {
        placeholder: '请输入姓名',
        maxLength: 50,
        allowClear: true,
      },
      // formItemProps 继承 antd 的 FormItemProps， 参考 antd 的 FormItem 组件
      formItemProps: {
        rules: [{ required: true, message: '姓名不能为空' }],
      },
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 180,
      componentType: 'select',
      componentProps: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
        placeholder: '请选择性别',
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择性别' }],
      },
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (value) => {
        return <div style={{ color: 'red' }}>{value || ''}</div>;
      },
    },
    {
      title: '出生年月',
      dataIndex: 'bothday',
      key: 'bothday',
      width: 200,
      componentType: 'datePicker',
      componentProps: {
        placeholder: '请选择出生年月',
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择出生年月' }],
      },
    },
    {
      title: '入职/离职日期',
      dataIndex: 'hireOrResignationDate',
      key: 'hireOrResignationDate',
      width: 240,
      componentType: 'rangePicker',
      componentProps: {
        placeholder: ['请选择入职日期', '请选择离职日期'],
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择入职/离职日期' }],
      },
    },
    {
      title: '是否结婚',
      dataIndex: 'isMarried',
      key: 'isMarried',
      width: 180,
      componentType: 'switch',
      componentProps: {
        placeholder: '请选择是否结婚',
        checkedChildren: '已婚',
        unCheckedChildren: '未婚',
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择是否结婚' }],
      },
    },
    {
      title: '健康情况',
      dataIndex: 'health',
      key: 'health',
      width: 180,
      formItemProps: {
        rules: [{ required: true, message: '请选择健康情况' }],
      },
      renderFormItem: () => {
        return (
          <Radio.Group
            options={[
              { value: 1, label: '健康' },
              { value: 2, label: '不健康' },
            ]}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      key: 'option',
      width: 280,
      fixed: 'right',
      render: (value, record, index) => {
        return (
          <Space size="middle">
            {/* <a
              onClick={() => {
                addRecord('list', { ...newData() });
              }}
            >
              增加
            </a> */}
            <Popconfirm
              title="确定要删除这条记录吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                deleteRecord('list', index);
              }}
            >
              <a>删除</a>
            </Popconfirm>
            <a
              onClick={() => {
                updateRecordField('list', index, 'name', 9999);
              }}
            >
              修改名称
            </a>
            <a
              onClick={() => {
                console.log('updateRecord', updateRecord);
                updateFormList('list', index, {
                  ...record,
                  name: '张三',
                  age: 9999,
                  gender: 'male',
                  bothday: dayjs(),
                });
              }}
            >
              修改当前行数据
            </a>
          </Space>
        );
      },
    },
  ];

  // form提交事件
  const onFinish = (values: any) => {
    console.log('values', values);
  };

  // 多选功能相关配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      console.log('-newSelectedRowKeys--', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              form.submit();
            }}
          >
            打印数据
          </Button>
        </Space>

        <Form form={form} onFinish={onFinish}>
          <EditFormTable
            formListProps={{ name: 'list' }}
            rowKey={'id'}
            columns={columns}
            scroll={{ x: 'max-content' }}
            rowSelection={rowSelection}
            // 添加一行配置
            recordCreatorProps={{
              creatorButtonShow: true,
              creatorButtonText: '添加一行数据',
              record: () => {
                return { ...newData() };
              },
            }}
          />
        </Form>
      </Space>
    </ConfigProvider>
  );
};

export default EditFormTableDemo;
