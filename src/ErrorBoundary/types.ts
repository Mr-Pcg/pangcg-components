import { ComponentType, ErrorInfo, PropsWithChildren, ReactNode } from 'react';

/**
 * 错误回调组件的属性
 * @property error - 捕获到的错误
 * @property resetErrorBoundary - 重置错误边界的方法
 */
export type FallbackProps = {
  error: any;
  resetErrorBoundary: (...args: any[]) => void;
};

/**
 * 错误边界共享属性
 * @property onError - 当错误发生时的回调函数
 * @property onReset - 当错误边界重置时的回调函数
 * @property resetKeys - 当这些值改变时会触发错误边界重置
 */
type ErrorBoundarySharedProps = PropsWithChildren<{
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: (
    details:
      | { reason: 'imperative-api'; args: any[] }
      | { reason: 'keys'; prev: any[] | undefined; next: any[] | undefined },
  ) => void;
  resetKeys?: any[];
}>;

/**
 * 使用组件作为回退的错误边界属性
 * 通过传递FallbackComponent组件来显示错误状态
 */
export type ErrorBoundaryPropsWithComponent = ErrorBoundarySharedProps & {
  fallback?: never;
  FallbackComponent: ComponentType<FallbackProps>;
  fallbackRender?: never;
};

/**
 * 使用渲染函数作为回退的错误边界属性
 * 通过传递fallbackRender函数来渲染错误状态
 */
export type ErrorBoundaryPropsWithRender = ErrorBoundarySharedProps & {
  fallback?: never;
  FallbackComponent?: never;
  fallbackRender: (props: FallbackProps) => ReactNode;
};

/**
 * 使用ReactNode作为回退的错误边界属性
 * 通过传递fallback节点来显示错误状态
 */
export type ErrorBoundaryPropsWithFallback = ErrorBoundarySharedProps & {
  fallback: ReactNode;
  FallbackComponent?: never;
  fallbackRender?: never;
};

/**
 * 错误边界组件接受的属性联合类型
 * 可以使用以下三种方式之一来处理错误:
 * 1. 提供fallback节点
 * 2. 提供FallbackComponent组件
 * 3. 提供fallbackRender渲染函数
 */
export type ErrorBoundaryProps =
  | ErrorBoundaryPropsWithFallback
  | ErrorBoundaryPropsWithComponent
  | ErrorBoundaryPropsWithRender;
