import { FormInstance } from 'antd';
import { generateUUID } from 'pangcg-components';

/**
 * 可编辑树形表格 自定义 hook
 * 提供操作树表格的工具方法，用于在表格外部进行操作
 * @param formInstance
 * @returns
 */
const useEditFormTreeTable = (formInstance: FormInstance) => {
  // 获取 form 实例
  const form = formInstance;

  /**
   * 添加根数据
   * @param formListName 表单列表名称
   * @param record 添加的数据
   */
  const addRootRecord = (formListName: string, record?: object) => {
    // 获取当前表单列表的值
    const formListValues = form?.getFieldValue(formListName) || [];
    formListValues.push({ ...(record || {}), _key: generateUUID() });
    form.setFieldValue(formListName, formListValues);
  };

  /**
   * 添加子数据
   * @param formListName 表单列表名称
   * @param parentKey 父级key
   * @param record 添加的数据
   */
  const addChildRecord = (
    formListName: string,
    parentKey: string,
    record?: any,
  ) => {
    // 获取当前表单列表的值
    const formListValues = form?.getFieldValue(formListName) || [];

    // 递归找到当前需要添加子数据的数据
    const addChildToNode = (nodes: any[]): any[] => {
      return nodes.map((node) => {
        if (parentKey?.toString() === node?._key?.toString()) {
          return {
            ...node,
            children: [
              ...(node?.children || []),
              { ...(record || {}), _key: generateUUID() },
            ],
          };
        }
        if (Array.isArray(node?.children) && node?.children?.length) {
          return {
            ...node,
            children: addChildToNode(node.children),
          };
        }
        return node;
      });
    };
    const newData = addChildToNode(formListValues);

    // 设置数据
    form.setFieldValue(formListName, newData);
  };

  /**
   * 删除根数据及其子数据 || 删除子数据
   * @param formListName 表单列表名称
   * @param key 数据key
   */
  const deleteRecord = (formListName: string, deleteKey: string) => {
    // 获取当前表单列表的值
    const formListValues = form?.getFieldValue(formListName) || [];

    // 递归找到需要删除的数据，找到将数据删除
    const removeNode = (nodes: any[]): any[] => {
      return nodes.filter((node) => {
        if (node._key?.toString() === deleteKey?.toString()) {
          return false;
        }
        if (Array.isArray(node?.children) && node?.children?.length) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };
    const newData = removeNode(formListValues);

    // 设置数据
    form.setFieldValue(formListName, newData);
  };

  /**
   * 更新数据
   * @param formListName 表单列表名称
   * @param updateKey 更新数据key
   * @param record 更新数据
   */
  const updateRecord = (
    formListName: string,
    updateKey: string,
    record: any,
  ) => {
    // 获取当前表单列表的值
    const formListValues = form?.getFieldValue(formListName) || [];

    // 递归找到需要更新的数据，找到将数据更新
    const updateNode = (nodes: any[]): any[] => {
      return nodes.map((node) => {
        if (updateKey?.toString() === node?._key?.toString()) {
          return {
            ...node,
            ...{
              ...record,
              _key: node?._key?.toString() || generateUUID(),
            },
          };
        }
        if (Array.isArray(node?.children) && node?.children?.length) {
          node.children = updateNode(node.children);
        }
        return node;
      });
    };
    const newData = updateNode(formListValues);

    // 设置数据
    form.setFieldValue(formListName, newData);
  };

  return {
    addRootRecord,
    addChildRecord,
    deleteRecord,
    updateRecord,
  };
};

export default useEditFormTreeTable;
