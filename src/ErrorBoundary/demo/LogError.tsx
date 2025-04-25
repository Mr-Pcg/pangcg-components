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
 * 错误日志上报示例
 * 使用onError回调记录错误信息
 */
const LogErrorDemo = () => {
  // 模拟错误日志上报
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // 实际应用中，这里会发送错误到日志服务
    console.group('错误已捕获并记录');
    console.error('错误:', error);
    console.error('组件栈:', info.componentStack);
    console.groupEnd();

    // 示例中仅展示
    alert(`错误已记录! 错误信息: ${error.message}`);
  };

  return (
    <div className="error-boundary-demo">
      <div className="demo-container">
        <h3>错误日志上报示例</h3>
        <p>触发错误时，会调用onError回调记录错误信息</p>
        <ErrorBoundary
          onError={handleError}
          fallback={
            <div className="error-fallback log">
              <h4 style={{ color: '#52c41a' }}>错误已记录</h4>
              <p>请查看控制台以获取详细信息</p>
            </div>
          }
        >
          <BuggyCounter />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default LogErrorDemo;
