import { FormInstance } from 'antd';
import { generateUUID } from 'pangcg-components';

/**
 * 可编辑表格 自定义 hook
 * 提供操作表格的工具方法，用于在表格外部进行操作
 * @param formInstance form实例
 * @param rowKey table的rowKey属性，默认 id
 * @returns
 */
const useEditFormTable = (
  formInstance: FormInstance,
  rowKey: string = 'id',
) => {
  // 获取 form 实例
  const form = formInstance;

  /**
   * 添加根数据
   * @param formListName 表单列表名称
   * @param record 添加的数据
   */
  const addRecord = (formListName: string, record?: any) => {
    // 获取当前表单列表数据
    const formListValues = form?.getFieldValue(formListName) || [];
    formListValues.push({
      ...(record || {}),
      [rowKey]: record?.[rowKey]?.toString() || `add-${generateUUID()}`,
    });
    form.setFieldValue(formListName, formListValues);
  };

  /**
   * 删除根数据
   * @param formListName 表单列表名称
   * @param deleteIndex 当前删除行的小标
   */
  const deleteRecord = (formListName: string, deleteIndex: number) => {
    // 获取当前表单列表的值
    const formListValues = form?.getFieldValue(formListName) || [];
    const newData = formListValues?.filter(
      (items: any, index: number) => index !== deleteIndex,
    );

    // 设置数据
    form.setFieldValue(formListName, [...newData]);
  };

  /**
   * 修改：当前行所有数据
   * @param formListName 表单列表名称
   * @param updateIndex 更新数据下标
   * @param record 更新数据
   */
  const updateRecord = (
    formListName: string,
    updateIndex: number,
    record: any,
  ) => {
    form.setFieldValue([formListName, updateIndex], { ...record });
  };

  /**
   * 修改：当前行特定字段数据
   * @param formListName 表单列表名称
   * @param updateIndex 更新行下标
   * @param field 更新的字段
   * @param fieldValue 更新值
   */
  const updateRecordField = (
    formListName: string,
    updateIndex: number,
    field: string,
    fieldValue: any,
  ) => {
    form.setFieldValue([formListName, updateIndex, field], fieldValue);
  };

  /**
   * 修改：通过修改整个数据源来修改对应下表数据 （目的是解决表格不是表单的字段）
   * @param formListName 表单列表名称
   * @param updateIndex 更新行下标
   * @param record 更新数据
   */
  const updateFormList = (
    formListName: string,
    updateIndex: number,
    record: any,
  ) => {
    const formListValues = form?.getFieldValue(formListName) || [];
    formListValues[updateIndex] = {
      ...record,
    };
    form.setFieldValue(formListName, [...formListValues]);
  };

  return {
    addRecord,
    deleteRecord,
    updateRecord,
    updateRecordField,
    updateFormList,
  };
};

export default useEditFormTable;
