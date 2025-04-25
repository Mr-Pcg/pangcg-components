---
nav: 组件 #设置具体的导航栏
group: #设置具体的菜单栏
  title: Table表格 # 所在分组的名称
  order: 1 # 分组排序，值越小越靠前
title: EditFormTable #设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# 可编辑 Table 表格

## 介绍

业务开发中，一些可编辑 Table，频繁使用，一些业务之外的额外配置每次都需要进行配置，现在将额外的配置统一规划起来，用户只需要关注业务即可

## 实现方案

###### 采用 Form.List + Table 进行二次封装的可编辑表格，使用的时候用 Form 标签包裹起来

## 代码演示

<code src="./demo/editFormTable" ></code>

## API

| 参数               | 说明                               | 类型                                             | 默认值 | 版本  |
| ------------------ | ---------------------------------- | ------------------------------------------------ | ------ | ----- |
| formListProps      | 参考 Antd 的 formListProps（必填） | `-`                                              | `-`    | 0.0.1 |
| recordCreatorProps | 创建一行参数(非必填)               | [`RecordCreatorProps`](#recordcreatorprops-参数) | `-`    | 0.0.1 |
| columns            | 表格列的配置描述                   | [`CustomColumns`](#customcolumns-参数)           | `_`    | 0.0.1 |
| otherProps         | 其余参数继承 antd 的 Table         | `-`                                              | `_`    | 0.0.1 |

## RecordCreatorProps 参数

| 参数              | 说明                   | 类型        | 默认值     | 版本  |
| ----------------- | ---------------------- | ----------- | ---------- | ----- |
| creatorButtonShow | 是否显示新增按钮       | `boolean`   | `false`    | 0.0.1 |
| creatorButtonText | 新增按钮文案（非必填） | `string`    | `新增一行` | 0.0.1 |
| record            | 新增一行的数据         | `() => any` | `{}`       | 0.0.1 |
| buttonProps       | 继承 Antd 的 Button    | `-`         | `-`        | 0.0.1 |

## CustomColumns 参数

| 参数           | 说明                                           | 类型                              | 默认值 | 版本  |
| -------------- | ---------------------------------------------- | --------------------------------- | ------ | ----- |
| componentType  | 组件类型                                       | [`ComponentType`](#componenttype) | `text` | 0.0.1 |
| componentProps | 组件类型对应的属性（继承 Antd 对应的组件属性） | `-`                               | `-`    | 0.0.1 |
| formItemProps  | 继承 Antd 的 formItemProps                     | `-`                               | `-`    | 0.0.1 |

## ComponentType 参数

| 参数        | 说明                | 类型          | 默认值 | 版本  |
| ----------- | ------------------- | ------------- | ------ | ----- |
| text        | 纯文本              | `string`      | `-`    | 0.0.1 |
| input       | Antd 的 Input       | `Input`       | `-`    | 0.0.1 |
| select      | Antd 的 Select      | `Select `     | `-`    | 0.0.1 |
| datePicker  | Antd 的 DatePicker  | `DatePicker`  | `-`    | 0.0.1 |
| RangePicker | Antd 的 RangePicker | `RangePicker` | `-`    | 0.0.1 |
| inputNumber | Antd 的 InputNumber | `InputNumber` | `-`    | 0.0.1 |
| checkbox    | Antd 的 Checkbox    | `Checkbox`    | `-`    | 0.0.1 |
| radio       | Antd 的 Radio       | `Radio`       | `-`    | 0.0.1 |
