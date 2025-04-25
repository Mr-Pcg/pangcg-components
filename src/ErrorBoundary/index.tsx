import React, { Component, createElement, ErrorInfo } from 'react';
import { ErrorBoundaryContext } from './ErrorBoundaryContext';
import { ErrorBoundaryProps, FallbackProps } from './types';

/**
 * 错误边界组件的状态类型
 * @property didCatch - 是否捕获到错误
 * @property error - 捕获的错误信息
 */
type ErrorBoundaryState =
  | {
      didCatch: true;
      error: any;
    }
  | {
      didCatch: false;
      error: null;
    };

/**
 * 错误边界组件的初始状态
 */
const initialState: ErrorBoundaryState = {
  didCatch: false,
  error: null,
};

/**
 * 检查两个数组是否发生变化
 * @param a - 第一个数组
 * @param b - 第二个数组
 * @returns 如果两个数组不同则返回true，否则返回false
 */
function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的JavaScript错误，记录错误并显示备用UI
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }

  /**
   * 静态生命周期方法，当子组件抛出错误时被调用
   * @param error - 捕获到的错误
   * @returns 更新后的状态
   */
  static getDerivedStateFromError(error: Error) {
    return { didCatch: true, error };
  }

  /**
   * 重置错误边界状态的方法
   * @param args - 重置时传递的参数
   */
  resetErrorBoundary(...args: any[]) {
    const { error } = this.state;

    if (error !== null) {
      this.props.onReset?.({
        args,
        reason: 'imperative-api',
      });

      this.setState(initialState);
    }
  }

  /**
   * 当子组件抛出错误时被调用的生命周期方法
   * @param error - 捕获到的错误
   * @param info - 错误的组件堆栈信息
   */
  componentDidCatch(error: Error, info: ErrorInfo) {
    // 也可调用接口，错误日志
    this.props?.onError?.(error, info);
  }

  /**
   * 组件更新时的生命周期方法
   * 用于检测resetKeys是否变化，如果变化则重置错误状态
   * @param prevProps - 上一个props
   * @param prevState - 上一个state
   */
  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState,
  ) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    // 边缘情况：如果触发错误的内容也在resetKeys数组中，
    // 我们会立即重置错误边界，这可能会触发第二个错误。
    // 所以我们确保在错误设置后的第一次cDU调用中不检查resetKeys。

    if (
      didCatch &&
      prevState.error !== null &&
      hasArrayChanged(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onReset?.({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: 'keys',
      });

      this.setState(initialState);
    }
  }

  /**
   * 渲染方法
   * 根据错误状态渲染子组件或fallback UI
   */
  render() {
    const { children, fallbackRender, FallbackComponent, fallback } =
      this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (typeof fallbackRender === 'function') {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback !== undefined) {
        childToRender = fallback;
      } else {
        console.error(
          'react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop',
        );

        throw error;
      }
    }

    return createElement(
      ErrorBoundaryContext.Provider,
      {
        value: {
          didCatch,
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        },
      },
      childToRender,
    );
  }
}

/**
 * 自定义 Hook，用于在函数组件中访问 ErrorBoundary 上下文
 * 允许子组件访问和调用错误边界的重置方法
 * @returns ErrorBoundary 上下文对象
 */
export function useErrorBoundary() {
  const context = React.useContext(ErrorBoundaryContext);

  if (context === null) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundary');
  }

  return context;
}

export type { ErrorBoundaryProps, FallbackProps };
