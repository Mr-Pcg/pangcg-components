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

## 代码演示

### 基础用法

<code src="./demo/editFormTreeTable/index.tsx"></code>

## API

### EditFormTreeTable

| 参数               | 说明               | 类型                 | 默认值                         |
| ------------------ | ------------------ | -------------------- | ------------------------------ |
| formListProps      | Form.List 的属性   | `IFormListProps`     | -                              |
| recordCreatorProps | 添加行的配置       | `RecordCreatorProps` | `{ creatorButtonShow: false }` |
| columns            | 表格列的配置描述   | `EditColumnsType[]`  | -                              |
| dataSource         | 数据数组           | `object[]`           | -                              |
| childrenColumnName | 指定子节点的字段名 | `string`             | `children`                     |

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

可用的编辑组件类型：

- `text`: 纯文本展示
- `input`: 输入框
- `select`: 下拉选择框
- `datePicker`: 日期选择器
- `rangePicker`: 日期范围选择器
- `inputNumber`: 数字输入框
- `checkbox`: 复选框
- `radio`: 单选框
- `switch`: 开关
- `timePicker`: 时间选择器
- `treeSelect`: 树选择器

### useEditFormTreeTable

提供操作树表格的工具方法，用于在表格外部进行操作。

<!-- ```tsx
import { useEditFormTreeTable } from 'pangcg-components';
const { addChildRecord, deleteRecord } = useEditFormTreeTable();

// 添加子节点
addChildRecord('formFieldName', parentKey, newRecordData);

// 删除节点及其所有子节点
deleteRecord('formFieldName', keyToDelete);
``` -->

#### 方法说明

| 方法名         | 说明                   | 参数                                                             |
| -------------- | ---------------------- | ---------------------------------------------------------------- |
| addChildRecord | 添加子节点             | `(formList: string, parentKey: string, record?: object) => void` |
| deleteRecord   | 删除节点及其所有子节点 | `(formList: string, key: string) => void`                        |

## 注意事项

1. 组件内部会自动处理树形数据的扁平化，并在表单提交时维护正确的数据结构
2. 第一列会自动添加缩进效果，用于展示数据的层级关系
3. 删除节点时会连同其所有子节点一起删除
4. 为保证树形结构的正确性，内部会自动为每条数据添加 `_key`、`_parentId` 和 `_level` 属性
