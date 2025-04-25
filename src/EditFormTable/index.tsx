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
  Table,
} from 'antd';
import React, { FC, useEffect } from 'react';

const { RangePicker } = DatePicker;

// 内部资源
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
    dataSource,
    ...rest
  } = props;

  // 获取 form 实例
  const form = Form.useFormInstance();

  // 监听可编辑表格的数据
  // const formListWatch = Form.useWatch(formListProps.name, form)

  // 初始化设置：表格 数据
  useEffect(() => {
    if (formListProps.name) {
      form.setFieldValue(formListProps.name, dataSource || []);
    }
  }, [dataSource, formListProps]);

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
    const formListValues = form.getFieldValue(formListProps.name) || [];

    return columns.map((columnItem) => {
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
          const curRecord = formListValues?.[inx] || {};

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
              curRecord?.[dataIndex] || '',
              curRecord,
              inx,
            );
          } else {
            // 根据 componentType 渲染
            if (componentType === 'text') {
              return curRecord?.[dataIndex]?.toString() || '';
            }
            return (
              <Form.Item
                {...formItemProps}
                name={[inx, dataIndex]}
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

  return (
    <Form.List {...(formListProps || {})}>
      {(fields, { add }) => {
        return (
          <>
            <Table
              {...(rest || {})}
              columns={customColumns()}
              dataSource={fields} // 数据源
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
                    console.log('0000', addItem);
                    add({ ...addItem });
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

export default EditFormTable;
