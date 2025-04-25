import { createContext } from 'react';

/**
 * 错误边界上下文类型定义
 * @property didCatch - 是否捕获到错误
 * @property error - 捕获的错误信息
 * @property resetErrorBoundary - 重置错误边界的方法
 */
export type ErrorBoundaryContextType = {
  didCatch: boolean;
  error: any;
  resetErrorBoundary: (...args: any[]) => void;
};

/**
 * 创建错误边界上下文
 * 用于在组件树中共享错误状态和重置方法
 */
export const ErrorBoundaryContext =
  createContext<ErrorBoundaryContextType | null>(null);
