# PDF 批注功能说明

## 功能概述

PDF 批注插件支持以下几种批注类型：

1. 文本批注（使用 web-highlighter 实现， 暂时没有完成该功能）
   - 高亮
   - 下划线
   - 删除线
2. 形状批注（使用 Konva 实现）
   - 矩形
   - 圆形
   - 椭圆
3. 绘制批注（使用 Konva 实现）
   - 自由绘制
   - 自由高亮
4. 图像批注
   - 签名
   - 盖章

## 文本批注实现

文本批注使用了[web-highlighter](https://github.com/alienzhou/web-highlighter)库，这是一个轻量级、无依赖的网页文本高亮工具。

### 主要特性

- 自动识别文本选择并应用高亮、下划线或删除线效果
- 支持高亮颜色自定义
- 批注数据持久化支持，可保存和恢复批注
- 支持批注删除

### 如何使用

1. 选择工具栏中的高亮、下划线或删除线工具
2. 在 PDF 文本上拖动选择要批注的文本
3. 文本将自动应用选择的批注样式
4. 点击已创建的批注可以删除它

### 技术实现

批注功能分为两个图层：

1. `HighlighterLayer` - 使用 web-highlighter 处理文本批注
2. `AnnotationLayer` - 使用 Konva 处理形状、绘制和图像批注

这种分离使得文本高亮功能可以更好地利用 web-highlighter 的优势，同时保持其他类型批注的灵活性。

### web-highlighter 关键 API

```typescript
// 初始化
const highlighter = new Highlighter({
  $root: pdfLayerRef.current,
  exceptSelectors: ['.konvajs-content', '.annotation-layer'],
  wrapTag: 'span',
  style: {
    className: 'web-highlighter-selection',
  },
});

// 启动高亮器
highlighter.run();

// 监听高亮创建事件
highlighter.on('selection:create', callback);

// 监听高亮点击事件
highlighter.on('click', callback);

// 手动创建高亮
highlighter.highlightSelection(styles);

// 移除高亮
highlighter.remove(id);

// 从持久化数据恢复高亮
highlighter.fromStore(startMeta, endMeta, text, id);
```

## 扩展开发

如果需要自定义批注功能，可以：

1. 修改`HighlighterLayer.tsx`组件以更改文本批注行为
2. 调整`ExtendedHighlighter`接口以添加更多 web-highlighter 功能
3. 在`ExtendedTextAnnotation`接口中添加更多元数据字段以支持批注的额外特性

## 参考资料

- [web-highlighter 官方文档](https://github.com/alienzhou/web-highlighter/wiki/Basic-Options-&-APIs)
- [Konva.js 文档](https://konvajs.org/docs/)

## 近期修复问题

### 批注变换后高亮位置不正确问题

**问题描述：**
矩形、圆形和椭圆形状在变换（缩放/放大）后，点击批注列表时的临时高亮位置不正确。

**原因分析：**

1. Konva Canvas 中，圆形(Circle)和椭圆(Ellipse)使用中心点坐标渲染，而矩形(Rectangle)使用左上角坐标
2. 数据存储时，所有形状都使用左上角坐标
3. 变换后的坐标计算未正确转换坐标系

**解决方案：**

1. 更新了 AnnotationList 组件中的高亮计算逻辑，确保使用正确的坐标系
2. 在 AnnotationLayer 组件中，为圆形添加了 keepRatio=true 强制保持比例
3. 添加更明确的中心点到左上角坐标转换逻辑
4. 优化 Circle 和 Ellipse 组件的渲染逻辑，使用更清晰的变量名和计算方式
5. 添加调试日志以便追踪坐标转换过程

通过这些更改，现在批注在变换后点击批注列表时会正确高亮显示在 PDF 文档中的实际位置。

### 批注移动后高亮位置不跟随问题

**问题描述：**
矩形、圆形和椭圆形状在拖拽移动后，点击批注列表时的临时高亮位置没有跟随，导致高亮显示在原位置。

**原因分析：**

1. 形状批注（矩形、圆形、椭圆）缺少 onDragEnd 事件处理
2. 移动批注后，没有更新批注的坐标信息到数据存储中
3. 圆形和椭圆形状需要从中心点坐标转换为左上角坐标进行保存

**解决方案：**

1. 为 Rect、Circle 和 Ellipse 组件添加了 onDragEnd 事件处理
2. 在拖拽结束后更新批注的坐标位置，确保数据同步
3. 针对圆形和椭圆形状，添加了从中心点坐标到左上角坐标的转换逻辑
4. 保持坐标系统的一致性，所有形状统一使用左上角坐标存储

通过这些更改，现在批注在拖拽移动后，点击批注列表时的临时高亮会正确显示在实际位置。
