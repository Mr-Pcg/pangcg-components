import { Button } from 'antd';
import React, { useState } from 'react';
import ErrorBoundary from '../index';
import './style.less';

/**
 * 一个会在点击到5时抛出错误的计数器组件
 */
const BuggyCounter = () => {
  const [counter, setCounter] = useState(0);

  if (counter === 5) {
    throw new Error('计数到5时发生错误！');
  }

  return (
    <div>
      <p>点击按钮增加计数，到5时会抛出错误</p>
      <Button onClick={() => setCounter((count) => count + 1)}>
        当前计数: {counter}
      </Button>
    </div>
  );
};

/**
 * ErrorBoundary基础使用示例
 * 使用默认的错误UI
 */
const BasicDemo = () => {
  return (
    <div className="error-boundary-demo">
      <div className="demo-container">
        <h3>基础用法示例</h3>
        <ErrorBoundary
          onError={(error, info) => {
            console.log('错误已被捕获:', error);
            console.log('组件堆栈:', info.componentStack);
          }}
          fallback={
            <div className="error-fallback default">
              <h4>发生了错误</h4>
              <p>组件渲染时出现问题</p>
              <Button onClick={() => window.location.reload()}>刷新页面</Button>
            </div>
          }
        >
          <BuggyCounter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default BasicDemo;
