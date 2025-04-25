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
      <Button type="primary" onClick={() => setCounter((count) => count + 1)}>
        当前计数: {counter}
      </Button>
    </div>
  );
};

/**
 * 错误恢复示例
 * 使用函数作为fallback，实现错误重置
 */
const RecoveryDemo = () => {
  // 用于演示onReset回调
  const handleReset = ({ reason }: { reason: string }) => {
    console.log('错误已重置，重置原因:', reason);
  };

  return (
    <div className="error-boundary-demo">
      <div className="demo-container">
        <h3>错误恢复示例</h3>
        <ErrorBoundary
          onReset={handleReset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="error-fallback recovery">
              <h4>发生错误</h4>
              <p>错误信息: {error.message}</p>
              <Button type="primary" onClick={() => resetErrorBoundary()}>
                点击重置并重试
              </Button>
            </div>
          )}
        >
          <BuggyCounter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default RecoveryDemo;
