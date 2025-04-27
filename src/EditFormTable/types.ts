import type {
  ButtonProps,
  CheckboxProps,
  DatePickerProps,
  FormItemProps,
  InputNumberProps,
  InputProps,
  RadioProps,
  SelectProps,
  TableProps,
  SwitchProps,
  TimePickerProps,
  TreeSelectProps,
} from 'antd';
import type { RangePickerProps } from 'antd/lib/date-picker';
import type { ColumnsType } from 'antd/lib/table';
import type { ValidatorRule } from 'rc-field-form/lib/interface';

/**
 * Form.List组件属性接口
 * @property prefixCls - 样式前缀
 * @property name - 表单项名称
 * @property rules - 校验规则
 * @property initialValue - 初始值
 */
export interface IFormListProps {
  prefixCls?: string;
  name: string | number | (string | number)[];
  rules?: ValidatorRule[];
  initialValue?: any[];
}

/**
 * 创建行记录属性接口
 * 定义新创建行的数据结构
 */
export interface CreatorRecordProps {
  id?: string; // 默认存在id，绑定到Table的rowKey
  [key: string]: string | undefined;
}

/**
 * 表格添加一行的配置属性接口
 */
export interface RecordCreatorProps {
  /**
   * 是否显示"添加一行"按钮
   */
  creatorButtonShow: boolean;

  /**
   * 添加表格按钮文案：默认为"新增一行"
   */
  creatorButtonText?: string;

  /**
   * 添加一行数据的初始化函数
   * @returns 新行的初始数据
   */
  record?: () => CreatorRecordProps;

  /**
   * 按钮组件的属性配置
   */
  buttonProps?: ButtonProps;
}

/**
 * 可编辑表格支持的组件类型
 * text: 文本展示
 * select: 下拉选择框
 * input: 文本输入框
 * datePicker: 日期选择器
 * rangePicker: 日期范围选择器
 * inputNumber: 数字输入框
 * checkbox: 复选框
 * radio: 单选框
 * switch: 开关
 * timePicker: 时间选择器
 * treeSelect: 树选择器
 */
export type ComponentType =
  | 'text'
  | 'select'
  | 'input'
  | 'datePicker'
  | 'rangePicker'
  | 'inputNumber'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'timePicker'
  | 'treeSelect';

/**
 * 根据组件类型获取对应的Props类型
 * 通过条件类型实现不同组件属性的映射
 */
export type ComponentProps<T extends ComponentType> = T extends 'input'
  ? InputProps
  : T extends 'select'
  ? SelectProps<any>
  : T extends 'datePicker'
  ? DatePickerProps
  : T extends 'rangePicker'
  ? RangePickerProps
  : T extends 'inputNumber'
  ? InputNumberProps
  : T extends 'checkbox'
  ? CheckboxProps
  : T extends 'radio'
  ? RadioProps
  : T extends 'switch'
  ? SwitchProps
  : T extends 'timePicker'
  ? TimePickerProps
  : T extends 'treeSelect'
  ? TreeSelectProps<any>
  : T extends 'text'
  ? Record<string, never>
  : never;

/**
 * 可编辑表格的列定义类型
 * 扩展了Antd表格的列类型，增加了编辑相关的属性
 */
export type EditColumnsType<T = any> = Array<
  ColumnsType<T>[0] & {
    dataIndex: string;
    /** 列使用的组件类型 */
    componentType?: ComponentType;
    /** 组件的属性配置 */
    componentProps?: ComponentProps<ComponentType>;
    /** 表单项的属性配置 */
    formItemProps?: FormItemProps;
    /** 自定义渲染函数 */
    customRender?: (
      { text, record, index }: { text: string; record: any; index: number },
      form?: any,
    ) => React.ReactNode;
  }
>;

/**
 * 可编辑表格组件属性接口
 * 扩展了Antd表格的属性，使用自定义的列定义
 */
export interface EditTableProps<T = any>
  extends Omit<TableProps<T>, 'columns'> {
  columns: EditColumnsType<T>;
}

/**
 * 可编辑表单表格组件属性接口
 * 结合了可编辑表格和表单功能
 */
export interface EditFormTableProps<T = any> extends EditTableProps<T> {
  /**
   * Form.List组件的属性配置
   */
  formListProps: IFormListProps;

  /**
   * 创建行数据的配置
   */
  recordCreatorProps?: RecordCreatorProps;
}
