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
import React, { FC, useEffect, useState } from 'react';

const { RangePicker } = DatePicker;

// 内部类型定义
import type {
  ComponentProps,
  ComponentType,
  EditFormTreeTableProps,
  TreeDataItem,
} from './types';

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
    childrenColumnName = 'children',
    ...rest
  } = props;

  // 获取 form 实例
  const form = Form.useFormInstance();

  // 维护树形数据映射关系
  const [treeMapping, setTreeMapping] = useState<Record<string, TreeDataItem>>(
    {},
  );

  // 使用useRef存储树操作函数，避免linter错误
  // const treeOpsRef = useRef({
  //   addChildRecord,
  //   addRootRecord,
  //   deleteRecord,
  // });

  // 将树形数据扁平化处理
  const flattenTreeData = (
    treeData: readonly any[],
    parentId: string | null = null,
    level = 0,
  ): TreeDataItem[] => {
    let result: TreeDataItem[] = [];
    treeData.forEach((item, index) => {
      // 为数据添加唯一键和层级信息
      const flattenedItem: TreeDataItem = {
        ...item,
        _parentId: parentId,
        _level: level,
        _key: parentId ? `${parentId}-${index}` : `${index}`,
      };

      // 移除子项，但记录子项信息
      const children = item[childrenColumnName];
      delete flattenedItem[childrenColumnName];

      result.push(flattenedItem);

      // 递归处理子项
      if (children && children.length > 0) {
        const childrenItems = flattenTreeData(
          children,
          flattenedItem._key,
          level + 1,
        );
        result = [...result, ...childrenItems];
      }
    });
    return result;
  };

  // 初始化设置：表格 数据
  useEffect(() => {
    if (formListProps.name && dataSource) {
      // 处理树形数据
      const flattened = flattenTreeData(dataSource);

      // 创建树形映射关系
      const mapping: Record<string, TreeDataItem> = {};
      flattened.forEach((item) => {
        if (item._key) {
          mapping[item._key] = item;
        }
      });
      setTreeMapping(mapping);

      // 设置表单数据
      form.setFieldValue(formListProps.name, flattened);
    }
  }, [dataSource, formListProps, childrenColumnName, form]);

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
   * 自定义缩进单元格样式
   * @param level 层级
   * @param indentSize 缩进大小
   * @returns
   */
  const getIndentStyle = (level: number, indentSize: number = 16) => {
    return {
      paddingLeft: level * indentSize + 'px',
    };
  };

  /**
   * 设置：表格 列
   * 根据不同 componentType 渲染不同的组件
   */
  const customColumns = () => {
    // 获取可编辑表格的数据
    const formListValues = form.getFieldValue(formListProps.name) || [];

    return columns.map((columnItem: any, colIndex: number) => {
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

          // 第一列添加缩进
          if (colIndex === 0) {
            const level = curRecord._level || 0;

            // 自定义渲染：customRender
            if (columnItem?.customRender instanceof Function) {
              const customContent = columnItem.customRender(
                {
                  text: curRecord?.[dataIndex] || undefined,
                  record: curRecord,
                  index: inx,
                },
                form,
              );

              return <div style={getIndentStyle(level)}>{customContent}</div>;
            } else if (columnItem?.render instanceof Function) {
              // 渲染render
              const renderedContent = columnItem.render(
                curRecord?.[dataIndex] || '',
                curRecord,
                inx,
              );

              return <div style={getIndentStyle(level)}>{renderedContent}</div>;
            } else {
              // 根据 componentType 渲染
              if (componentType === 'text') {
                return (
                  <div style={getIndentStyle(level)}>
                    {curRecord?.[dataIndex]?.toString() || ''}
                  </div>
                );
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
                <div style={getIndentStyle(level)}>
                  <Form.Item
                    {...formItemProps}
                    valuePropName={valuePropName}
                    name={[inx, dataIndex]}
                    style={{ marginBottom: 0 }}
                  >
                    {renderComponent(
                      componentType,
                      componentProps as ComponentProps<ComponentType>,
                    )}
                  </Form.Item>
                </div>
              );
            }
          } else {
            // 其他列正常渲染
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
          }
        },
      };
    });
  };

  /**
   * 添加子节点逻辑
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddChildRecord = (parentKey: string) => {
    const formListValues = form.getFieldValue(formListProps.name) || [];

    // 找到父节点的索引
    const parentIndex = formListValues.findIndex(
      (item: any) => item._key === parentKey,
    );
    if (parentIndex === -1) return;

    // 找到同级最后一个元素的索引
    let lastChildIndex = parentIndex;
    for (let i = 0; i < formListValues.length; i++) {
      const item = formListValues[i];
      if (item._parentId === parentKey) {
        lastChildIndex = i;
      }
    }

    // 创建新记录
    const newRecord = recordCreatorProps?.record
      ? recordCreatorProps.record()
      : {};
    const parentLevel = formListValues[parentIndex]._level || 0;
    const newKey = `${parentKey}-${Date.now()}`;

    const newItem = {
      ...newRecord,
      _parentId: parentKey,
      _level: parentLevel + 1,
      _key: newKey,
    };

    // 在最后一个子元素后插入新元素
    const newFormListValues = [
      ...formListValues.slice(0, lastChildIndex + 1),
      newItem,
      ...formListValues.slice(lastChildIndex + 1),
    ];

    form.setFieldValue(formListProps.name, newFormListValues);

    // 更新映射
    setTreeMapping((prev) => ({
      ...prev,
      [newKey]: newItem,
    }));
  };

  /**
   * 添加根节点
   */
  const handleAddRootRecord = () => {
    const formListValues = form.getFieldValue(formListProps.name) || [];

    // 创建新记录
    const newRecord = recordCreatorProps?.record
      ? recordCreatorProps.record()
      : {};
    const newKey = `root-${Date.now()}`;

    const newItem = {
      ...newRecord,
      _parentId: null,
      _level: 0,
      _key: newKey,
    };

    // 添加到列表末尾
    const newFormListValues = [...formListValues, newItem];

    form.setFieldValue(formListProps.name, newFormListValues);

    // 更新映射
    setTreeMapping((prev) => ({
      ...prev,
      [newKey]: newItem,
    }));
  };

  /**
   * 删除记录及其所有子记录逻辑
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteRecord = (key: string) => {
    const formListValues = form.getFieldValue(formListProps.name) || [];

    // 递归找出所有需要删除的key
    const keysToDelete = new Set<string>();

    const findChildren = (parentKey: string) => {
      keysToDelete.add(parentKey);
      formListValues.forEach((item: any) => {
        if (item._parentId === parentKey) {
          findChildren(item._key);
        }
      });
    };

    findChildren(key);

    // 过滤掉需要删除的记录
    const newFormListValues = formListValues.filter(
      (item: any) => !keysToDelete.has(item._key),
    );

    form.setFieldValue(formListProps.name, newFormListValues);

    // 更新映射
    const newMapping = { ...treeMapping };
    keysToDelete.forEach((keyToDelete) => {
      delete newMapping[keyToDelete];
    });
    setTreeMapping(newMapping);
  };

  return (
    <Form.List {...(formListProps || {})}>
      {(fields) => {
        return (
          <>
            <Table
              {...(rest || {})}
              columns={customColumns()}
              dataSource={fields} // 数据源
              pagination={false} // 可编辑表格，不允许分页
              rowKey={(record) => record._key || record.name} // 使用_key作为行唯一标识
            />
            {/* 添加根节点 */}
            {recordCreatorProps?.creatorButtonShow ? (
              <div style={{ marginTop: 24 }}>
                <Button
                  {...(recordCreatorProps?.buttonProps || {
                    type: 'dashed',
                    block: true,
                  })}
                  onClick={handleAddRootRecord}
                >
                  {recordCreatorProps?.creatorButtonText || '添加根节点'}
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

// 导出添加子节点和删除节点方法
export const useEditFormTreeTable = (formInstance?: any) => {
  const contextForm = Form.useFormInstance();
  const form = formInstance || contextForm;

  if (!form) {
    console.error(
      'useEditFormTreeTable: Form instance is required. Either use this hook within Form context or provide a form instance.',
    );

    // 返回无操作函数，防止调用时出错
    return {
      addChildRecord: () => {
        console.warn('Form instance is missing, operation not performed');
      },
      deleteRecord: () => {
        console.warn('Form instance is missing, operation not performed');
      },
    };
  }

  /**
   * 添加子节点
   * @param formList 表单数组名称
   * @param parentKey 父节点Key
   * @param record 新记录数据
   */
  const addChildRecord = (
    formList: string,
    parentKey: string,
    record: Record<string, any> = {},
  ) => {
    const formListValues = form.getFieldValue(formList) || [];

    // 找到父节点的索引
    const parentIndex = formListValues.findIndex(
      (item: any) => item._key === parentKey,
    );
    if (parentIndex === -1) return;

    // 找到同级最后一个元素的索引
    let lastChildIndex = parentIndex;
    for (let i = 0; i < formListValues.length; i++) {
      const item = formListValues[i];
      if (item._parentId === parentKey) {
        lastChildIndex = i;
      }
    }

    const parentLevel = formListValues[parentIndex]._level || 0;
    const newKey = `${parentKey}-${Date.now()}`;

    const newItem = {
      ...record,
      _parentId: parentKey,
      _level: parentLevel + 1,
      _key: newKey,
    };

    // 在最后一个子元素后插入新元素
    const newFormListValues = [
      ...formListValues.slice(0, lastChildIndex + 1),
      newItem,
      ...formListValues.slice(lastChildIndex + 1),
    ];

    form.setFieldValue(formList, newFormListValues);
  };

  /**
   * 删除记录及其子记录
   * @param formList 表单数组名称
   * @param key 要删除的记录key
   */
  const deleteRecord = (formList: string, key: string) => {
    const formListValues = form.getFieldValue(formList) || [];

    // 递归找出所有需要删除的key
    const keysToDelete = new Set<string>();

    const findChildren = (parentKey: string) => {
      keysToDelete.add(parentKey);
      formListValues.forEach((item: any) => {
        if (item._parentId === parentKey) {
          findChildren(item._key);
        }
      });
    };

    findChildren(key);

    // 过滤掉需要删除的记录
    const newFormListValues = formListValues.filter(
      (item: any) => !keysToDelete.has(item._key),
    );

    form.setFieldValue(formList, newFormListValues);
  };

  return {
    addChildRecord,
    deleteRecord,
  };
};
