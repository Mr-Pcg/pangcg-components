---
nav: 组件 #设置具体的导航栏
group:
  title: 异常处理 # 所在分组的名称
  order: 2 # 分组排序，值越小越靠前
title: ErrorBoundary # 设置文件名称

toc: content #在页面右侧展示锚点链接
mobile: false
---

# ErrorBoundary 错误边界

## 介绍

ErrorBoundary 是一个用于捕获和处理 React 组件树中 JavaScript 错误的组件，可以防止因组件错误导致整个应用崩溃，并提供优雅的降级 UI 展示。

## 实现方案

###### 采用 React 的 class 组件提供的 static getDerivedStateFromError 和 componentDidCatch 来捕获出现错误的页面

## 何时使用

当你需要：

- 防止应用因组件错误而整体崩溃
- 为用户提供友好的错误提示
- 提供错误恢复机制
- 收集前端错误信息用于分析和修复

## 代码演示

### 基础用法

<code src="./demo/Basic.tsx"></code>

### 自定义错误 UI

<code src="./demo/CustomFallback.tsx"></code>

### 错误恢复

<code src="./demo/Recovery.tsx"></code>

### 错误日志上报

<code src="./demo/LogError.tsx"></code>

### 子组件触发错误重置

<code src="./demo/UseErrorBoundary.tsx"></code>

## API

### ErrorBoundary

| 参数              | 说明 \*\*\*\*            | 类型                                    | 默认值 |
| ----------------- | ------------------------ | --------------------------------------- | ------ |
| children          | 子组件                   | ReactNode                               | -      |
| fallback          | 静态错误显示内容         | ReactNode                               | -      |
| FallbackComponent | 错误显示组件             | [`FallbackProps`](#fallbackprops)       | -      |
| fallbackRender    | 动态渲染错误 UI 的函数   | (props: FallbackProps) => ReactNode     | -      |
| onError           | 错误发生时的回调函数     | (error: Error, info: ErrorInfo) => void | -      |
| onReset           | 重置错误状态后的回调函数 | () => void                              | -      |

**注意**：fallback、FallbackComponent、fallbackRender 这三个参数互斥，只能选择其中一种方式定义错误 UI

### FallbackProps

`FallbackProps`是错误边界组件传递给错误 UI 渲染函数的参数类型，包含以下属性：

| 参数               | 说明               | 类型                     |
| ------------------ | ------------------ | ------------------------ |
| error              | 捕获到的错误对象   | any                      |
| resetErrorBoundary | 重置错误状态的函数 | (...args: any[]) => void |

### useErrorBoundary

返回上下文对象，其中包含以下属性：

| 属性               | 说明               | 类型          |
| ------------------ | ------------------ | ------------- |
| resetErrorBoundary | 重置错误状态的函数 | () => void    |
| error              | 当前捕获的错误     | Error \| null |
| didCatch           | 是否已捕获错误     | boolean       |

## 类型说明

三种错误 UI 定义方式区别：

- **fallback**: 直接接受静态 React 元素，适用于简单错误提示
- **FallbackComponent**: 接受 React 组件类型，适合复用复杂错误组件
- **fallbackRender**: 接受渲染函数，适合需要动态生成错误 UI 的场景

类型定义强制互斥关系，同时使用多个参数时 Typescript 会报类型错误

## 注意事项

1. ErrorBoundary 无法捕获以下类型的错误：

   - 事件处理函数中的错误
   - 异步代码错误（setTimeout、Promise 等）
   - 服务端渲染错误
   - ErrorBoundary 自身的错误

2. 建议将 ErrorBoundary 放置在以下位置：

   - 应用顶层，作为最后的错误防护
   - 路由级别，为每个路由提供独立的错误处理
   - 重要的 UI 组件单元，隔离潜在错误影响

3. 在开发环境中，React 会显示错误信息在屏幕上，这是正常的，有助于开发调试

4. 生产环境中，未被捕获的错误会导致整个 React 组件树被卸载，使用 ErrorBoundary 可以避免这种情况
