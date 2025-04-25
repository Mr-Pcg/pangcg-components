import { Button, ConfigProvider, Form, Popconfirm, Space } from 'antd';
import { EditColumnsType, EditFormTable } from 'pangcg-components';
import React from 'react';

// 配置 antd 的 国际化
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

interface PersonInfo {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  address: string;
  bothday: string;
  hireOrResignationDate: [string, string];
}

const EditFormTableDemo = () => {
  const [form] = Form.useForm();

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
      width: 200,
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
      title: '操作',
      dataIndex: 'option',
      key: 'option',
      width: 120,
      fixed: 'right',
      customRender: ({ text, record, index }, form_s: any) => {
        return (
          <Space size="middle">
            <Popconfirm
              title="确定要删除这条记录吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                const curList = form_s?.getFieldValue('list');
                console.log('删除', text, record, index, curList);
                form_s.setFieldValue(
                  'list',
                  curList.filter((items: any, inx: number) => inx !== index),
                );
              }}
            >
              <a>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // form提交事件
  const onFinish = (values: any) => {
    console.log('values', values);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Button
        type="primary"
        onClick={() => {
          form.submit();
        }}
        style={{ marginBottom: 12 }}
      >
        打印数据
      </Button>
      <Form form={form} onFinish={onFinish}>
        <EditFormTable
          formListProps={{ name: 'list' }}
          recordCreatorProps={{
            creatorButtonShow: true,
            record: () => {
              return {
                name: '新记录',
                gender: 'male',
                age: '18',
                id: (Math.random() * 10).toFixed(2),
              };
            },
          }}
          rowKey={'id'}
          columns={columns}
          dataSource={[
            {
              id: '0000',
              name: '小刚',
              age: 32,
              gender: 'male',
              address: '西湖区湖底公园1号',
            },
            {
              id: '11111',
              name: '小理想',
              age: 35,
              gender: 'female',
              address: '西湖区湖底公园1号',
            },
          ]}
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </ConfigProvider>
  );
};

export default EditFormTableDemo;
