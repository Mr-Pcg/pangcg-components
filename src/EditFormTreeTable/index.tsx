// 外部资源
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Table,
  TimePicker,
  TreeSelect,
} from 'antd';
import { cloneDeep } from 'lodash';
import { generateUUID } from 'pangcg-components';
import React, { FC, useCallback, useEffect } from 'react';
// 内部类型定义
import { StoreValue } from 'antd/es/form/interface';
import useEditFormTreeTable from './hooks/useEditFormTreeTable';
import type {
  ComponentProps,
  ComponentType,
  EditFormTreeTableProps,
} from './types';

const { RangePicker } = DatePicker;

/**
 * 可编辑树形表格
 * @param props
 * @returns
 */
const EditFormTreeTable: FC<EditFormTreeTableProps> = (props) => {
  const {
    formListProps,
    recordCreatorProps = {
      creatorButtonShow: false,
    },
    columns,
    dataSource,
    rowKey = 'id',
    ...rest
  } = props;

  // 获取 form 实例
  const form = Form.useFormInstance();

  // 初始化设置：表格 数据
  useEffect(() => {
    if (formListProps.name && dataSource) {
      // 递归给数据源设置唯一标识 _key，绑定到 Table 的rowKey
      const recursionDataSource = (dataList: any[]) => {
        dataList.forEach((item) => {
          // 设置唯一标识 _key， 默认赋值使用rowKey属性对应的值
          item._key = item?.[rowKey]?.toString() || generateUUID();
          if (Array.isArray(item?.children) && item?.children?.length) {
            recursionDataSource(item.children);
          } else {
            item.children = null;
          }
        });
      };
      const cloneDataSource = Array.isArray(dataSource)
        ? cloneDeep(dataSource)
        : [];
      recursionDataSource(cloneDataSource);

      // 设置表单数据
      form?.setFieldValue(formListProps.name, cloneDataSource || []);
    }
  }, [dataSource, formListProps]); // form

  /**
   * 根据不同 componentType 渲染不同的组件
   * @param componentType
   * @param componentProps
   * @returns
   */
  const renderComponent = (
    componentType: ComponentType,
    componentProps: ComponentProps<ComponentType>,
  ): React.ReactNode | null => {
    switch (componentType) {
      case 'input':
        return <Input {...(componentProps as ComponentProps<'input'>)} />;
      case 'select':
        return <Select {...(componentProps as ComponentProps<'select'>)} />;
      case 'datePicker':
        return (
          <DatePicker {...(componentProps as ComponentProps<'datePicker'>)} />
        );
      case 'rangePicker':
        return (
          <RangePicker {...(componentProps as ComponentProps<'rangePicker'>)} />
        );
      case 'inputNumber':
        return (
          <InputNumber {...(componentProps as ComponentProps<'inputNumber'>)} />
        );
      case 'checkbox':
        return <Checkbox {...(componentProps as ComponentProps<'checkbox'>)} />;
      case 'radio':
        return <Radio {...(componentProps as ComponentProps<'radio'>)} />;
      case 'switch':
        return <Switch {...(componentProps as ComponentProps<'switch'>)} />;
      case 'timePicker':
        return (
          <TimePicker {...(componentProps as ComponentProps<'timePicker'>)} />
        );
      case 'treeSelect':
        return (
          <TreeSelect {...(componentProps as ComponentProps<'treeSelect'>)} />
        );
      default:
        return null;
    }
  };

  /**
   * 设置：表格 列
   * 根据不同 componentType 渲染不同的组件
   */
  const customColumns = () => {
    // 获取可编辑表格的数据
    // const formListValues = form.getFieldValue(formListProps.name) || [];

    return columns.map((columnItem: any) => {
      const {
        dataIndex,
        componentType = 'text',
        componentProps,
        formItemProps,
      } = columnItem;

      return {
        ...columnItem,
        render: (text: string, record: any, inx: number) => {
          // 获取当前数据
          const curRecord = cloneDeep({ ...record }); // formListValues?.[record.fieldKey] || {};

          // 自定义渲染：customRender
          if (columnItem?.customRender instanceof Function) {
            return columnItem.customRender(
              {
                text: curRecord?.[dataIndex] || undefined,
                record: curRecord,
                index: inx,
              },
              form,
            );
          } else if (columnItem?.render instanceof Function) {
            // 渲染render
            return columnItem.render(
              curRecord?.[dataIndex]?.toString() || '',
              curRecord,
              inx,
            );
          } else {
            // 根据 componentType 渲染
            if (componentType === 'text') {
              return curRecord?.[dataIndex]?.toString() || '';
            }

            // 子节点的值的属性: 默认 value
            const valuePropName =
              formItemProps?.valuePropName ||
              (() => {
                switch (componentType) {
                  case 'switch':
                  case 'checkbox':
                    return 'checked';
                  default:
                    return 'value';
                }
              })();

            return (
              <Form.Item
                {...formItemProps}
                valuePropName={valuePropName}
                name={[...record.fieldKey!, dataIndex]}
                style={{ marginBottom: 0 }}
              >
                {renderComponent(
                  componentType,
                  componentProps as ComponentProps<ComponentType>,
                )}
              </Form.Item>
            );
          }
        },
      };
    });
  };

  /**
   * 添加根数据
   * @param add 添加数据的方法
   */
  const handleAddRootRecord = (
    add: (defaultValue?: StoreValue, insertIndex?: number) => void,
  ) => {
    const creatorProps_record = recordCreatorProps?.record
      ? recordCreatorProps?.record()
      : {};
    const newRecord = recordCreatorProps?.record
      ? {
          ...creatorProps_record,
          children:
            Array.isArray(creatorProps_record?.children) &&
            creatorProps_record?.children?.length
              ? creatorProps_record.children
              : null,
          _key: generateUUID(),
        }
      : { _key: generateUUID(), children: null };

    add({ ...newRecord });
  };

  // 树形可编辑表格
  const transformData = useCallback(
    (data: any[], parentKey: (string | number)[] = []): any[] => {
      return data?.map((field, index) => {
        const fieldKey = [...parentKey, index];
        const currentData = form.getFieldValue([
          formListProps.name,
          ...fieldKey,
        ]);

        return {
          ...currentData,
          fieldKey,
          isListField: true,
          children: currentData?.children
            ? transformData(Array(currentData.children.length).fill({}), [
                ...fieldKey,
                'children',
              ])
            : undefined,
        };
      });
    },
    [form, formListProps.name],
  );

  return (
    <Form.List {...(formListProps || {})}>
      {(fields, { add }) => {
        return (
          <>
            <Table
              {...(rest || {})}
              dataSource={transformData(fields)} // 数据源
              columns={customColumns()}
              rowKey={(record) => record._key} // 使用_key作为行唯一标识
              pagination={false} // 可编辑表格，不允许分页
            />
            {/* 添加根节点 */}
            {recordCreatorProps?.creatorButtonShow ? (
              <div style={{ marginTop: 24 }}>
                <Button
                  {...(recordCreatorProps?.buttonProps || {
                    type: 'dashed',
                    block: true,
                  })}
                  onClick={() => handleAddRootRecord(add)}
                >
                  {recordCreatorProps?.creatorButtonText || '添加一行'}
                </Button>
              </div>
            ) : null}
          </>
        );
      }}
    </Form.List>
  );
};

// 导出组件和方法
export default EditFormTreeTable;

// 提供操作树表格的工具方法，用于在表格外部进行操作
export { useEditFormTreeTable };
