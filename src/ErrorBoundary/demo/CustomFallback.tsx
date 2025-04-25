import { Button } from 'antd';
import { ErrorBoundary } from 'pangcg-components';
import React, { useState } from 'react';
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
 * 自定义错误UI示例
 * 使用ReactNode作为fallback
 */
const CustomFallbackDemo = () => {
  return (
    <div className="error-boundary-demo">
      <div className="demo-container">
        <h3>自定义错误UI示例</h3>
        <ErrorBoundary
          fallback={
            <div className="error-fallback custom">
              <h4>组件出错了</h4>
              <p>别担心，请尝试刷新页面</p>
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

export default CustomFallbackDemo;
