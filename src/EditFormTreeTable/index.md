---
nav: 组件 #设置具体的导航栏
group: #设置具体的菜单栏
  title: Table表格 # 所在分组的名称
  order: 1 # 分组排序，值越小越靠前
title: EditFormTreeTable #设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# EditFormTreeTable 可编辑树形表格

EditFormTreeTable 是一个基于 Form 和 Table 的高级组件，用于展示和编辑树形结构的表格数据。它允许用户直接在表格中编辑数据，支持多种表单控件类型，并且能够以树形结构展示和管理数据。

## 何时使用

- 当你需要以树形结构展示数据，并允许用户直接编辑这些数据时
- 当你需要维护具有层级关系的数据，如组织架构、部门结构等
- 当你需要在表单中展示和编辑复杂的层级数据

## 注意事项

1. 唯一性字段, 使用`_key`, 不可以丢失
2. 为保证树形结构的正确性，内部会自动为每条数据添加`_key`属性, 默认赋值当前数据的`id`字段，不存在则生成随机数, 绑定到 Table 的`rowKey`

## 代码演示

### 基础用法

<code src="./demo/baseEditFormTreeTable/index.tsx"></code>

### useEditFormTreeTable 用法

<code src="./demo/editFormTreeTable/index.tsx"></code>

## API

### EditFormTreeTable

| 参数               | 说明                       | 类型                 | 默认值                         |
| ------------------ | -------------------------- | -------------------- | ------------------------------ |
| formListProps      | Form.List 的属性           | `IFormListProps`     | -                              |
| recordCreatorProps | 添加行的配置               | `RecordCreatorProps` | `{ creatorButtonShow: false }` |
| columns            | 表格列的配置描述           | `EditColumnsType[]`  | -                              |
| dataSource         | 数据数组                   | `object[]`           | -                              |
| otherProps         | 其余参数继承 antd 的 Table | -                    | -                              |

### IFormListProps

| 参数         | 说明             | 类型                                       | 默认值 |
| ------------ | ---------------- | ------------------------------------------ | ------ |
| name         | 表单字段名       | `string \| number \| (string \| number)[]` | -      |
| rules        | 校验规则         | `ValidatorRule[]`                          | -      |
| initialValue | 设置子元素默认值 | `any[]`                                    | -      |

### RecordCreatorProps

| 参数              | 说明                 | 类型                        | 默认值                            |
| ----------------- | -------------------- | --------------------------- | --------------------------------- |
| creatorButtonShow | 是否显示添加按钮     | `boolean`                   | `false`                           |
| creatorButtonText | 添加按钮文本         | `string`                    | `添加根节点`                      |
| record            | 初始化新行数据的方法 | `() => Record<string, any>` | -                                 |
| buttonProps       | 按钮的属性           | `ButtonProps`               | `{ type: 'dashed', block: true }` |

### columns

| 参数           | 说明                       | 类型                                           | 默认值 |
| -------------- | -------------------------- | ---------------------------------------------- | ------ |
| title          | 列头显示文字               | `ReactNode`                                    | -      |
| dataIndex      | 列数据在数据项中对应的路径 | `string`                                       | -      |
| componentType  | 编辑组件类型               | [ComponentType](#componenttype)                | `text` |
| componentProps | 编辑组件属性               | `ComponentProps<ComponentType>`                | -      |
| formItemProps  | Form.Item 的属性           | `FormItemProps`                                | -      |
| customRender   | 自定义渲染函数             | `({ text, record, index }, form) => ReactNode` | -      |

### ComponentType

| 参数        | 说明           | 类型               | 默认值 | 版本  |
| ----------- | -------------- | ------------------ | ------ | ----- |
| text        | 文本展示       | `string`           | `-`    | 0.0.1 |
| input       | 文本输入框     | `InputProps`       | `-`    | 0.0.1 |
| select      | 下拉选择框     | `SelectProps`      | `-`    | 0.0.1 |
| datePicker  | 日期选择器     | `DatePickerProps`  | `-`    | 0.0.1 |
| rangePicker | 日期范围选择器 | `RangePickerProps` | `-`    | 0.0.1 |
| inputNumber | 数字输入框     | `InputNumberProps` | `-`    | 0.0.1 |
| checkbox    | 复选框         | `CheckboxProps`    | `-`    | 0.0.1 |
| radio       | 单选框         | `RadioProps`       | `-`    | 0.0.1 |
| switch      | 开关           | `SwitchProps`      | `-`    | 0.0.1 |
| timePicker  | 时间选择器     | `TimePickerProps`  | `-`    | 0.0.1 |
| treeSelect  | 树选择器       | `TreeSelectProps`  | `-`    | 0.0.1 |

### useEditFormTreeTable 自定义 hooks

提供操作树表格的工具方法，用于在表格外部进行操作。

#### 方法说明

| 方法名         | 说明                   | 参数                                                                 |
| -------------- | ---------------------- | -------------------------------------------------------------------- |
| addRootRecord  | 添加根节点             | `(formListName: string, record?: object) => void`                    |
| addChildRecord | 添加子节点             | `(formListName: string, parentKey: string, record?: object) => void` |
| deleteRecord   | 删除节点及其所有子节点 | `(formListName: string, deleteKey: string) => void`                  |
| updateRecord   | 更新节点数据           | `(formListName: string, updateKey: string, record: object) => void`  |
