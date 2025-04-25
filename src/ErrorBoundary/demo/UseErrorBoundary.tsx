import { Button } from 'antd';
import { ErrorBoundary, useErrorBoundary } from 'pangcg-components';
import React, { useState } from 'react';

/**
 * 一个会抛出错误的组件
 */
const BuggyComponent = () => {
  throw new Error('这是一个始终会抛出错误的组件');
};

/**
 * 演示使用useErrorBoundary hook的组件
 * 允许子组件触发错误重置
 */
const ResetButton = () => {
  const { resetErrorBoundary, didCatch } = useErrorBoundary();

  if (!didCatch) return null;

  return (
    <Button
      style={{
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        padding: '5px 15px',
        borderRadius: 4,
      }}
      onClick={() => resetErrorBoundary()}
    >
      在子组件中重置错误
    </Button>
  );
};

/**
 * 父组件，包含错误组件和重置按钮
 */
const Container = () => {
  const [showError, setShowError] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Button onClick={() => setShowError(!showError)}>
          {showError ? '隐藏' : '显示'}错误组件
        </Button>
      </div>

      {showError && <BuggyComponent />}

      <div style={{ marginTop: 20 }}>
        <ResetButton />
      </div>
    </div>
  );
};

/**
 * 使用useErrorBoundary示例
 * 演示如何在子组件中访问错误边界的重置方法
 */
const UseErrorBoundaryDemo = () => {
  return (
    <div style={{ border: '1px solid #eee', padding: 20, borderRadius: 4 }}>
      <h3>使用useErrorBoundary示例</h3>
      <p>演示如何在深层子组件中重置错误</p>

      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div
            style={{ padding: 20, backgroundColor: '#f9f0ff', borderRadius: 4 }}
          >
            <h4 style={{ color: '#722ed1' }}>错误已捕获</h4>
            <p>错误信息: {error.message}</p>
            <p>你可以使用下方的按钮重置错误状态</p>
            <ResetButton />
          </div>
        )}
      >
        <Container />
      </ErrorBoundary>
    </div>
  );
};

export default UseErrorBoundaryDemo;
