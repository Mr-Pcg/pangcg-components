// 外部资源
import {
  Button,
  Cascader,
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
import { generateUUID } from 'pangcg-components';
import React, { FC, useCallback } from 'react';

const { RangePicker } = DatePicker;

// 内部资源
import useEditFormTable from './hooks/useEditFormTable';
import { ComponentProps, ComponentType, EditFormTableProps } from './types';

/**
 *  可编辑表格
 * @param props
 * @returns
 */

const EditFormTable: FC<EditFormTableProps> = (props) => {
  const {
    formListProps,
    recordCreatorProps = {
      creatorButtonShow: false,
    },
    columns,
    rowKey = 'id',
    ...rest
  } = props;

  // 获取 form 实例
  const form = Form.useFormInstance();

  // 监听可编辑表格的数据
  // const formListWatch = Form.useWatch(formListProps.name, form)

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
      case 'cascader':
        return <Cascader {...(componentProps as ComponentProps<'cascader'>)} />;
      default:
        return null;
    }
  };

  /**
   * 设置：表格 列
   * 根据不同 componentType 渲染不同的组件
   */
  const customColumns = useCallback(() => {
    // 获取可编辑表格的数据
    // const formListValues = form.getFieldValue(formListProps.name) || [];

    return columns.map((columnItem) => {
      const {
        dataIndex,
        componentType = 'text',
        componentProps,
        formItemProps,
        renderFormItem = undefined,
      } = columnItem;

      return {
        ...columnItem,
        render: (text: any, record: any, index: number) => {
          // const curRecord = formListValues?.[index] || {}; // 获取当前数据

          // 去除 fieldKey isListField 两个字段
          if ('fieldKey' in record) {
            delete record.fieldKey;
          }
          if ('isListField' in record) {
            delete record.isListField;
          }

          // 自定义渲染：customRender
          if (columnItem?.customRender instanceof Function) {
            return columnItem.customRender(
              {
                text,
                record,
                index,
              },
              form,
            );
          } else if (columnItem?.render instanceof Function) {
            // 渲染render
            return columnItem.render(text, record, index);
          } else {
            // 根据 componentType 渲染

            // 渲染： 表单元素 和 自定义Form.Item子组件
            if (
              componentType !== 'text' ||
              renderFormItem instanceof Function
            ) {
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
                  name={[index, dataIndex]}
                  style={{ marginBottom: 0 }}
                >
                  {renderFormItem && renderFormItem instanceof Function
                    ? renderFormItem()
                    : renderComponent(
                        componentType,
                        componentProps as ComponentProps<ComponentType>,
                      )}
                </Form.Item>
              );
            } else if (componentType === 'text') {
              // 渲染：文本
              return text;
            }
          }
        },
      };
    });
  }, [formListProps.name, columns, form]);

  // 设置：可编辑表格每行数据
  const transformData = useCallback(
    (data: any[]): any[] => {
      return data?.map((field, index) => {
        // 获取当前数据
        const currentData = form.getFieldValue([formListProps.name, index]);
        return {
          ...currentData, // 当前行数据
          fieldKey: index, // 用于标识表单列表中每个项的唯一键
          isListField: true, // 用于标识该字段是否属于Form.List
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
              columns={customColumns()}
              // dataSource={fields} // 数据源
              dataSource={transformData(fields)}
              // 使用rowKey绑定的字段作为行唯一标识
              rowKey={(record) => {
                return record?.[rowKey];
              }}
              // rowKey={(record) => {
              //   const formListValues =
              //     form.getFieldValue(formListProps.name) || [];
              //   const index = record.name;
              //   return formListValues?.[index]?.[rowKey];
              // }}
              pagination={false} // 可编辑表格，不允许分页
            />
            {/* 添加一行 */}
            {recordCreatorProps?.creatorButtonShow ? (
              <div style={{ marginTop: 24 }}>
                <Button
                  {...(recordCreatorProps?.buttonProps || {
                    type: 'dashed',
                    block: true,
                  })}
                  onClick={() => {
                    const addItem = recordCreatorProps?.record
                      ? recordCreatorProps?.record()
                      : {};
                    add({
                      ...addItem,
                      [`${rowKey}`]:
                        addItem?.[rowKey]?.toString() ||
                        `add-${generateUUID()}`,
                    });
                  }}
                >
                  {recordCreatorProps?.creatorButtonText || '新增一行'}
                </Button>
              </div>
            ) : null}
          </>
        );
      }}
    </Form.List>
  );
};

// 导出组件和自定义hooks
export default EditFormTable;

export { useEditFormTable };
