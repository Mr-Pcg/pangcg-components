---
nav: 组件 #设置具体的导航栏
group: #设置具体的菜单栏
  title: Table表格 # 所在分组的名称
  order: 1 # 分组排序，值越小越靠前
title: EditFormTable #设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# EditFormTable 可编辑表格

EditFormTable 是一个基于 Form.List 和 Table 的高级组件，用于展示和编辑表格数据。它允许用户直接在表格中编辑数据，支持多种表单控件类型。

## 何时使用

- 当你需要以表格展示数据，并允许用户直接编辑这些数据时

## 注意事项

1. 暂时不支持树形数据结构的表格编辑

## 代码演示

<code src="./demo/editFormTable" ></code>

## API

| 参数               | 说明                               | 类型                                           | 默认值 | 版本  |
| ------------------ | ---------------------------------- | ---------------------------------------------- | ------ | ----- |
| formListProps      | 参考 Antd 的 formListProps（必填） | `-`                                            | `-`    | 0.0.1 |
| recordCreatorProps | 创建一行参数(非必填)               | [RecordCreatorProps](#recordcreatorprops-参数) | `-`    | 0.0.1 |
| columns            | 表格列的配置描述                   | [CustomColumns](#customcolumns-参数)           | `_`    | 0.0.1 |
| otherProps         | 其余参数继承 antd 的 Table         | `-`                                            | `_`    | 0.0.1 |

## RecordCreatorProps 参数

| 参数              | 说明                   | 类型        | 默认值     | 版本  |
| ----------------- | ---------------------- | ----------- | ---------- | ----- |
| creatorButtonShow | 是否显示新增按钮       | `boolean`   | `false`    | 0.0.1 |
| creatorButtonText | 新增按钮文案（非必填） | `string`    | `新增一行` | 0.0.1 |
| record            | 新增一行的数据         | `() => any` | `{}`       | 0.0.1 |
| buttonProps       | 继承 Antd 的 Button    | `-`         | `-`        | 0.0.1 |

## CustomColumns 参数

| 参数           | 说明                                           | 类型                                 | 默认值 | 版本  |
| -------------- | ---------------------------------------------- | ------------------------------------ | ------ | ----- |
| componentType  | 组件类型                                       | [ComponentType](#componenttype-参数) | `text` | 0.0.1 |
| componentProps | 组件类型对应的属性（继承 Antd 对应的组件属性） | `-`                                  | `-`    | 0.0.1 |
| formItemProps  | 继承 Antd 的 formItemProps                     | `-`                                  | `-`    | 0.0.1 |

## ComponentType 参数

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
