---
nav: 组件 #设置具体的导航栏
group: #设置具体的菜单栏
  title: Table表格 # 所在分组的名称
  order: 1 # 分组排序，值越小越靠前
title: DragSortTreeTable #设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# DragSortTreeTable 拖拽树形表格

DragSortTreeTable 是一个基于 @dnd-kit/core 实现的可拖拽排序的树形表格组件，继承自 Ant Design 的 Table 组件。

## 何时使用

- 当你需要以表格展示数据，并且希望用户能够通过拖拽来调整数据顺序时
- 适用于需要自定义列表顺序且需要保存排序结果的场景
- 当你需要一个简单易用的拖拽排序表格，又不想自己实现复杂的拖拽逻辑时

## 特性

- 基于 Ant Design 的 Table 组件，拥有其所有功能
- 支持垂直方向的行拖拽排序
- 可以自定义拖拽把手的样式
- 提供排序结束后的回调函数，方便处理排序后的数据

## 注意事项

1. rowKey 绑定的字段数据源一定是存在且唯一的， 默认是 id 字段

## 代码演示

<code src='./demo'></code>

## API

| 参数               | 说明                       | 类型                                         | 默认值     | 版本    |
| ------------------ | -------------------------- | -------------------------------------------- | ---------- | ------- |
| initialDataSource  | 表格数据源                 | `RecordType[]`                               | `[]`       | `0.0.5` |
| isDrag             | 是否启用拖拽功能           | `boolean`                                    | `true`     | `0.0.5` |
| columns            | 表格列的配置描述           | `TableColumnType<RecordType>[]`              | -          | `0.0.5` |
| renderDragHandle   | 自定义拖拽把手             | `React.ReactNode`                            | -          | `0.0.5` |
| onDragSortEnd      | 拖拽排序结束后的回调函数   | `(newDataSource: RecordType[]) => void`      | -          | `0.0.5` |
| childrenColumnName | 指定树形结构的子节点字段名 | `string`                                     | `children` | `0.0.5` |
| parentIdKey        | 指定父节点 ID 的字段名     | `string`                                     | `parentId` | `0.0.5` |
| rowKey             | 表格行 key 的取值          | `string \| ((record: RecordType) => string)` | `id`       | `0.0.5` |

除了以上属性外，该组件还支持 Ant Design Table 组件的所有属性。
