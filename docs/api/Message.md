---
title: Message 全局提示
order: 4
group:
  path: /
  title: 组件
  order: 3
---

# Message 全局提示

全局展示操作反馈信息。

## 何时使用

- 可提供成功、警告和错误等反馈信息。
- 顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。

## 代码演示

### 基本用法

```tsx
import React from 'react';
import { Button, Space } from 'antd';
import { Message } from 'pangcg-components';

export default () => {
  return (
    <Space>
      <Button
        type="primary"
        onClick={() => Message.success('这是一条成功消息')}
      >
        成功提示
      </Button>
      <Button onClick={() => Message.error('这是一条错误消息')}>
        错误提示
      </Button>
      <Button onClick={() => Message.warning('这是一条警告消息')}>
        警告提示
      </Button>
      <Button onClick={() => Message.info('这是一条普通消息')}>普通提示</Button>
      <Button onClick={() => Message.loading('这是一条加载消息')} loading>
        加载提示
      </Button>
    </Space>
  );
};
```

### 修改延时

```tsx
import React from 'react';
import { Button, Space } from 'antd';
import { Message } from 'pangcg-components';

export default () => {
  return (
    <Space>
      <Button
        type="primary"
        onClick={() => Message.success('这条消息10秒后自动关闭', 10)}
      >
        自定义时长
      </Button>
    </Space>
  );
};
```

### 使用 Context 方式

```tsx
import React from 'react';
import { Button, Space } from 'antd';
import { Message } from 'pangcg-components';

export default () => {
  // 创建消息API实例
  const [messageApi, contextHolder] = Message.useMessage();

  const showMessage = () => {
    messageApi.open({
      type: 'success',
      content: '使用Context方式调用',
      duration: 2,
    });
  };

  return (
    <>
      {/* 在组件树中注入context */}
      {contextHolder}
      <Button type="primary" onClick={showMessage}>
        使用Context方式
      </Button>
    </>
  );
};
```

## API

组件提供了一些静态方法，使用方式和参数如下：

```javascript
Message.success(content, [duration]);
Message.error(content, [duration]);
Message.info(content, [duration]);
Message.warning(content, [duration]);
Message.loading(content, [duration]);
```

| 参数     | 说明                                        | 类型   | 默认值 |
| -------- | ------------------------------------------- | ------ | ------ |
| content  | 提示内容                                    | string | -      |
| duration | 自动关闭的延时，单位秒。设为 0 时不自动关闭 | number | 3      |

还提供了全局配置方法：

```javascript
Message.config({
  duration: 2,
  maxCount: 3,
});
```

| 参数     | 说明                                           | 类型   | 默认值 |
| -------- | ---------------------------------------------- | ------ | ------ |
| duration | 默认自动关闭延时，单位秒                       | number | 3      |
| maxCount | 最大显示数, 超过限制时，最早的消息会被自动关闭 | number | 3      |

### Message.useMessage()

```javascript
const [messageApi, contextHolder] = Message.useMessage();
```

通过 `messageApi` 可以调用以下方法：

```javascript
messageApi.open(config);
messageApi.success(content, [duration]);
messageApi.error(content, [duration]);
messageApi.info(content, [duration]);
messageApi.warning(content, [duration]);
messageApi.loading(content, [duration]);
```

`contextHolder` 需要被插入到组件树中，一般放在应用的根组件或者使用消息的父组件中。
