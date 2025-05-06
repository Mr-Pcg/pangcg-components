---
nav: 组件 #设置具体的导航栏
group: #设置具体的菜单栏
  title: 文件预览 # 所在分组的名称
  order: 3 # 分组排序，值越小越靠前
title: PdfPreview #设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# PdfPreview PDF 预览组件

一个功能强大的 PDF 文件预览组件，支持多种文件来源、缩放、翻页等操作。

## 特性

- 支持多种文件来源：在线链接、Base64、文件流(Blob/File)
- 提供简洁的 API 接口，易于集成
- 完善的加载状态和错误处理
- 响应式设计，支持自定义宽高
- 提供文件下载功能
- 支持缩放、翻页等交互操作

## 代码演示

### 预览在线 PDF

使用在线链接预览 PDF 文件：

<code src="./demo/online.tsx"></code>

### 预览 Base64 编码的 PDF

使用 Base64 编码数据预览 PDF 文件：

<code src="./demo/base64.tsx"></code>

### 预览文件对象

通过文件上传获取文件对象并预览：

<code src="./demo/fileObject.tsx"></code>

## API

| 参数      | 说明                                           | 类型                     | 默认值       |
| --------- | ---------------------------------------------- | ------------------------ | ------------ |
| fileUrl   | 文件数据，支持在线链接、Base64 数据或文件对象  | `string \| Blob \| File` | -            |
| fileName  | 文件名，当 fileUrl 为 Blob 或 Base64 时可指定  | `string`                 | `'文件预览'` |
| className | 自定义 CSS 类名，用于定制容器样式              | `string`                 | `''`         |
| style     | 自定义内联样式，用于设置容器的宽高、颜色等属性 | `CSSProperties`          | `{}`         |

## 注意事项

1. PDF 预览需要网络环境能够访问 CDN：`cdnjs.cloudflare.com`，用于加载 PDF.js 的 worker 文件。
2. 支持 PDF 文件缩放、翻页和下载功能。
3. 当使用 Base64 或文件对象时，可以通过 fileName 属性自定义显示的文件名。
4. 对于文件对象，组件会自动获取并使用文件的原始名称。
