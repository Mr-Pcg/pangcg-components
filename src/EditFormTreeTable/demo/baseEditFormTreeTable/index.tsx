import { Button, ConfigProvider, Form, Popconfirm, Space } from 'antd';
import {
  EditFormTreeTable,
  EditTreeColumnsType,
  useEditFormTreeTable,
} from 'pangcg-components';
import React from 'react';

// 配置 antd 的 国际化
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

interface DepartmentInfo {
  id: string;
  name: string;
  manager: string;
  level: number;
  establishDate: string;
  status: 'active' | 'inactive';
}

const EditFormTreeTableDemo = () => {
  const [form] = Form.useForm();
  const { addChildRecord, deleteRecord } = useEditFormTreeTable(form);

  // 定义列配置
  const columns: EditTreeColumnsType<DepartmentInfo> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      componentType: 'input',
      componentProps: {
        placeholder: '请输入部门名称',
        maxLength: 50,
        allowClear: true,
      },
      formItemProps: {
        rules: [{ required: true, message: '部门名称不能为空' }],
      },
    },
    {
      title: '部门编码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      componentType: 'text',
    },
    {
      title: '部门经理',
      dataIndex: 'manager',
      key: 'manager',
      width: 180,
      componentType: 'input',
      componentProps: {
        placeholder: '请输入部门经理',
        maxLength: 50,
        allowClear: true,
      },
      formItemProps: {
        rules: [{ required: true, message: '请输入部门经理' }],
      },
    },
    {
      title: '部门级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      componentType: 'select',
      componentProps: {
        options: [
          { label: '一级部门', value: 1 },
          { label: '二级部门', value: 2 },
          { label: '三级部门', value: 3 },
          { label: '四级部门', value: 4 },
        ],
        placeholder: '请选择部门级别',
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择部门级别' }],
      },
    },
    // {
    //   title: '成立日期',
    //   dataIndex: 'establishDate',
    //   key: 'establishDate',
    //   width: 180,
    //   componentType: 'datePicker',
    //   componentProps: {
    //     placeholder: '请选择成立日期',
    //     allowClear: true,
    //     style: {
    //       width: '100%',
    //     },
    //   },
    //   formItemProps: {
    //     rules: [{ required: true, message: '请选择成立日期' }],
    //   },
    // },
    {
      title: '部门状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      componentType: 'switch',
      componentProps: {
        checkedChildren: '活跃',
        unCheckedChildren: '停用',
      },
      formItemProps: {
        valuePropName: 'checked',
        initialValue: true,
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 180,
      fixed: 'right',
      customRender: ({ record }) => {
        return (
          <Space size="middle">
            <a
              onClick={() => {
                // 添加子部门
                addChildRecord('departments', record._key, {
                  name: '新子部门',
                  manager: '未指定',
                  level: (record.level || 1) + 1,
                  status: true,
                });
              }}
            >
              添加子部门
            </a>
            <Popconfirm
              title="确定要删除这个部门及其所有子部门吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                deleteRecord('departments', record._key);
              }}
            >
              <a>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // 示例树形数据
  const treeData = [
    {
      id: '1',
      name: 'Zibo上海公司',
      manager: '张三',
      establishDate: '2010-01-01',
      status: true,
      level: 1,
      code: '100000',
      children: [
        {
          id: '1-1',
          name: '研发部',
          manager: '李四',
          establishDate: '2012-03-15',
          status: false,
          level: 2,
          code: '100001',
          children: [
            {
              id: '1-1-1',
              name: '前端组',
              manager: '王五',
              establishDate: '2015-06-20',
              status: true,
              level: 3,
              code: '100001-1',
            },
            {
              id: '1-1-2',
              name: '后端组',
              manager: '赵六',
              establishDate: '2015-07-18',
              status: true,
              level: 3,
              code: '100001-2',
            },
          ],
        },
        {
          id: '1-2',
          name: '市场部',
          manager: '钱七',
          establishDate: '2013-05-22',
          status: true,
          level: 2,
          code: '100002',
        },
      ],
    },
  ];

  // form提交事件
  const onFinish = (values: any) => {
    console.log('提交的数据:', values);
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
        提交数据
      </Button>
      <Form form={form} onFinish={onFinish}>
        <EditFormTreeTable
          key="tree-table"
          formListProps={{ name: 'departments' }}
          recordCreatorProps={{
            creatorButtonShow: true,
            creatorButtonText: '添加根数据',
            record: () => {
              return {
                id: '',
                name: '新部门',
                manager: '未指定',
                level: 1,
                status: true,
              };
            },
          }}
          columns={columns}
          dataSource={treeData}
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </ConfigProvider>
  );
};

export default EditFormTreeTableDemo;
