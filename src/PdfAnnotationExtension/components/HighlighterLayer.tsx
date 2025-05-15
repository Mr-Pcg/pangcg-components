import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Highlighter from 'web-highlighter';
import { Annotation, TextAnnotation } from '../types';

// 扩展web-highlighter类型以适合我们的使用场景
interface HighlightSource {
  id: string;
  text: string;
  rects: Array<{ x: number; y: number; width: number; height: number }>;
}

// 扩展文本批注类型，添加额外需要的元数据
interface ExtendedTextAnnotation extends TextAnnotation {
  startMeta?: any;
  endMeta?: any;
}

// 扩展 Highlighter 类型以匹配实际 API
interface ExtendedHighlighter {
  run: () => void;
  stop: () => void;
  dispose: () => void;
  highlightSelection: (styles: any) => string;
  remove: (id: string) => boolean;
  on: (eventType: string, callback: (data: any) => void) => ExtendedHighlighter;
  off: (eventType: string, callback: (data: any) => void) => void;
  fromStore: (startMeta: any, endMeta: any, text: string, id: string) => string;
}

// 高亮层组件的props类型
export interface HighlighterLayerProps {
  pageNumber: number;
  scale: number;
  activeTool: 'highlight' | 'strikethrough' | 'underline' | null;
  activeColor: string;
  pdfLayerRef: React.RefObject<HTMLDivElement>;
  annotations: Annotation[];
  readOnly?: boolean;
  zIndex?: number;
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationUpdate: (
    id: string,
    updates: Partial<Omit<Annotation, 'type'>>,
  ) => void;
  onAnnotationRemove: (id: string) => void;
  onToolReset?: () => void; // 重置工具
}

// 跟踪已处理过的容器，防止重复应用样式
const processedContainers = new Set<HTMLElement>();

// 辅助函数：确保PDF内容中的文本元素可选择
const ensureTextSelectable = (container: HTMLElement) => {
  // 防止重复处理同一容器，避免重影问题
  if (processedContainers.has(container)) {
    return;
  }

  // 确保PDF文本层的元素可选择
  const textElements = container.querySelectorAll(
    '.react-pdf__Page__textContent span, .react-pdf__Page__textContent div',
  );
  textElements.forEach((el) => {
    const element = el as HTMLElement;
    element.style.userSelect = 'text';
    element.style.webkitUserSelect = 'text';
    (element.style as any).mozUserSelect = 'text';
    (element.style as any).msUserSelect = 'text';
    element.style.cursor = 'text';
    // 确保文本层元素的层级高于画布，但低于高亮层
    element.style.position = 'relative';
    element.style.zIndex = '2'; // 固定值，低于高亮层
    // 允许应用样式
    element.style.color = element.style.color || 'inherit';
    // 防止其他CSS干扰
    element.style.pointerEvents = 'auto';
  });

  // 确保其他可能包含文本的元素也可选择
  const paragraphs = container.querySelectorAll(
    'p, span, div:not(.konvajs-content):not([data-highlight-id])',
  );
  paragraphs.forEach((el) => {
    const element = el as HTMLElement;
    element.style.cursor = 'text';
    element.style.userSelect = 'text'; // 确保所有文本元素都可选择
  });

  // 确保文本层容器本身可选择
  const textLayer = container.querySelector('.react-pdf__Page__textContent');
  if (textLayer) {
    const element = textLayer as HTMLElement;
    element.style.userSelect = 'text';
    element.style.webkitUserSelect = 'text';
    (element.style as any).mozUserSelect = 'text';
    (element.style as any).msUserSelect = 'text';
    // 确保文本层在高亮层下方但高于PDF
    element.style.zIndex = '2'; // 固定值，低于高亮层
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.right = '0';
    element.style.bottom = '0';
    element.style.pointerEvents = 'auto';
  }

  // 将容器标记为已处理
  processedContainers.add(container);
};

const HighlighterLayer: React.FC<HighlighterLayerProps> = ({
  pageNumber,
  scale,
  activeTool,
  activeColor,
  pdfLayerRef,
  annotations,
  onAnnotationAdd,
  onAnnotationRemove,
  onToolReset,
  readOnly = false,
  zIndex = 6,
}) => {
  const highlighterRef = useRef<ExtendedHighlighter | null>(null);
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);
  const [, updateState] = useState<object>();
  const forceUpdate = useCallback(() => updateState({}), []);

  // 初始化web-highlighter
  useEffect(() => {
    if (!pdfLayerRef.current) return;

    // 从已处理容器集合中移除该元素，以便重新处理
    if (processedContainers.has(pdfLayerRef.current)) {
      processedContainers.delete(pdfLayerRef.current);
    }

    // 清理现有高亮 - 解决页面切换时高亮不消失的问题
    const existingHighlights = pdfLayerRef.current.querySelectorAll(
      '.web-highlighter-wrapper, [data-highlight-id]',
    );
    existingHighlights.forEach((el) => {
      try {
        el.remove();
      } catch (error) {
        console.error('清理现有高亮失败:', error);
      }
    });

    // 确保文本可选择
    ensureTextSelectable(pdfLayerRef.current);

    // 创建高亮器实例
    try {
      // 清理旧实例
      if (highlighterRef.current) {
        try {
          highlighterRef.current.dispose();
        } catch (error) {
          console.error('清理旧高亮器实例失败:', error);
        }
      }

      // 创建新实例 - 使用类型断言
      const highlighter = new Highlighter({
        $root: pdfLayerRef.current,
        exceptSelectors: [
          'canvas',
          '.konvajs-content',
          '.annotation-layer',
          '[data-highlight-id]',
          '.text-selection-preview',
        ],
        wrapTag: 'span',
        style: {
          className: 'web-highlighter-selection',
          style: {
            display: 'inline',
          },
        },
      } as any);

      // 添加额外配置
      (highlighter as any).includeSelector = ['.react-pdf__Page__textContent'];
      (highlighter as any).devicePixelRatio = window.devicePixelRatio || 1;

      // 使用类型断言将实例转换为我们的扩展类型
      highlighterRef.current = highlighter as unknown as ExtendedHighlighter;

      // 启动高亮器
      highlighterRef.current.run();
    } catch (error) {
      console.error('初始化web-highlighter失败:', error);
    }

    return () => {
      // 清理高亮器
      if (highlighterRef.current) {
        try {
          highlighterRef.current.dispose();
          highlighterRef.current = null;
        } catch (error) {
          console.error('清理高亮器失败:', error);
        }
      }
    };
  }, [pdfLayerRef, pageNumber]);

  // 应用样式到高亮元素的辅助函数
  const applyStyleToHighlightElements = (
    id: string,
    type: string,
    color: string,
  ) => {
    setTimeout(() => {
      try {
        // 使用更精确的选择器查找元素
        const elements = document.querySelectorAll(
          `[data-highlight-id="${id}"], .web-highlighter-selection[data-highlight-source="${id}"]`,
        );

        if (elements && elements.length > 0) {
          elements.forEach((el) => {
            const element = el as HTMLElement;

            // 只设置必要的样式，避免覆盖所有css
            element.style.display = 'inline';
            element.style.position = 'relative';
            element.style.zIndex = '5'; // 固定高亮层zIndex，高于文本层(2)
            element.style.pointerEvents = 'auto';

            if (type === 'strikethrough') {
              element.style.textDecoration = 'line-through';
              element.style.textDecorationColor = color;
              element.style.textDecorationThickness = '2px';
              element.style.backgroundColor = 'transparent';
            } else if (type === 'underline') {
              element.style.textDecoration = 'underline';
              element.style.textDecorationColor = color;
              element.style.textDecorationThickness = '2px';
              element.style.backgroundColor = 'transparent';
            } else if (type === 'highlight') {
              element.style.backgroundColor = color;
              element.style.opacity = '0.3';
              element.style.mixBlendMode = 'multiply';
            }

            // 添加特定类以便CSS可以覆盖默认样式
            element.classList.add(`pdf-text-${type}`);
          });
        }
      } catch (error) {
        console.error('应用样式失败:', error);
      }
    }, 50); // 缩短延迟时间以更快应用样式
  };

  // 清除页面上的重复高亮元素
  const cleanupDuplicateHighlights = () => {
    if (!pdfLayerRef.current) return;

    // 查找所有高亮元素
    const highlightElements = pdfLayerRef.current.querySelectorAll(
      '[data-highlight-id]',
    );
    const highlightIds = new Map();

    // 遍历元素，检测并移除重复的元素
    highlightElements.forEach((el) => {
      const id = el.getAttribute('data-highlight-id');
      if (!id) return;

      if (highlightIds.has(id)) {
        // 如果已经存在该ID，将当前元素作为重复项移除
        try {
          el.remove();
        } catch (error) {
          console.error('清理重复高亮失败:', error);
        }
      } else {
        // 记录该ID的首次出现
        highlightIds.set(id, true);
      }
    });
  };

  // 处理批注事件
  useEffect(() => {
    if (!highlighterRef.current || readOnly) return;

    // 创建高亮批注处理函数
    const handleHighlightCreated = ({
      sources,
    }: {
      sources: HighlightSource[];
    }) => {
      if (!activeTool || !sources || sources.length === 0) return;

      // 获取批注源数据
      const source = sources[0];

      // 创建批注对象
      const annotation: TextAnnotation = {
        id: source.id || Date.now().toString(),
        type: activeTool,
        pageNumber,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        color: activeColor,
        opacity: activeTool === 'highlight' ? 0.3 : 1,
        text: source.text || '',
        rects: source.rects || [],
        highlightId: source.id,
      };

      // 添加到批注列表
      onAnnotationAdd(annotation);
      setIsHighlighting(false);

      // 应用样式到DOM元素
      applyStyleToHighlightElements(source.id, activeTool, activeColor);

      // 强制组件重新渲染以更新视图
      forceUpdate();

      // 清理重复高亮避免重影
      cleanupDuplicateHighlights();

      // 重置工具
      onToolReset?.();
    };

    // 点击事件处理
    const handleHighlightClick = ({ id }: { id: string }) => {
      if (activeTool) return; // 如果有工具激活，不处理删除

      // 确认删除操作
      if (window.confirm('是否删除此批注？')) {
        // 从web-highlighter中移除高亮
        if (highlighterRef.current) {
          highlighterRef.current.remove(id);
        }

        // 移除批注数据
        onAnnotationRemove(id);
      }
    };

    // 监听高亮创建事件
    highlighterRef.current.on('selection:create', handleHighlightCreated);
    highlighterRef.current.on('click', handleHighlightClick);

    return () => {
      if (highlighterRef.current) {
        highlighterRef.current.off('selection:create', handleHighlightCreated);
        highlighterRef.current.off('click', handleHighlightClick);
      }
    };
  }, [
    activeTool,
    activeColor,
    pageNumber,
    onAnnotationAdd,
    onAnnotationRemove,
    readOnly,
    forceUpdate,
    onToolReset,
  ]);

  // 监控文本选择并应用样式
  useEffect(() => {
    if (!highlighterRef.current || readOnly) return;

    const handleSelectionChange = () => {
      if (!activeTool) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0)
        return;

      // 检查选区是否在PDF容器内
      const range = selection.getRangeAt(0);
      if (!pdfLayerRef.current?.contains(range.commonAncestorContainer)) return;

      // 文本被选中，准备高亮
      setIsHighlighting(true);
    };

    const handleMouseUp = () => {
      if (!activeTool || !highlighterRef.current) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0)
        return;

      // 检查选区是否在PDF容器内
      const range = selection.getRangeAt(0);
      if (!pdfLayerRef.current?.contains(range.commonAncestorContainer)) return;

      // 检查是否已处于高亮中，避免重复操作
      if (isHighlighting) return;

      // 获取选区文本
      const text = selection.toString().trim();
      if (!text) return;

      // 根据批注类型设置样式
      let styles: Record<string, any> = {
        className: `pdf-text-${activeTool}`,
      };

      switch (activeTool) {
        case 'highlight':
          styles = {
            ...styles,
            backgroundColor: activeColor,
            opacity: 0.3,
            mixBlendMode: 'multiply',
          };
          break;
        case 'strikethrough':
          styles = {
            ...styles,
            textDecoration: 'line-through',
            textDecorationColor: activeColor,
            textDecorationThickness: '2px',
            backgroundColor: 'transparent',
          };
          break;
        case 'underline':
          styles = {
            ...styles,
            textDecoration: 'underline',
            textDecorationColor: activeColor,
            textDecorationThickness: '2px',
            backgroundColor: 'transparent',
          };
          break;
      }

      // 应用高亮
      setIsHighlighting(true);
      try {
        if (typeof highlighterRef.current.highlightSelection === 'function') {
          const id = highlighterRef.current.highlightSelection(styles);

          // 使用辅助函数应用样式
          applyStyleToHighlightElements(id, activeTool, activeColor);

          // 清除选区，避免与下一次操作冲突
          window.getSelection()?.removeAllRanges();

          // 强制组件重新渲染以更新视图
          forceUpdate();
          setIsHighlighting(false);

          // 清理重复高亮避免重影
          cleanupDuplicateHighlights();

          // 重置工具
          onToolReset?.();
        }
      } catch (error) {
        console.error('高亮选区失败:', error);
        setIsHighlighting(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    activeTool,
    activeColor,
    pdfLayerRef,
    readOnly,
    forceUpdate,
    isHighlighting,
    onToolReset,
  ]);

  // 恢复已保存的批注
  useEffect(() => {
    if (!highlighterRef.current || !pdfLayerRef.current) return;

    // 清理当前页面上的重复高亮元素
    cleanupDuplicateHighlights();

    // 过滤当前页的文本批注
    const textAnnotations = annotations.filter(
      (a): a is TextAnnotation =>
        ['highlight', 'strikethrough', 'underline'].includes(a.type) &&
        a.pageNumber === pageNumber,
    );

    if (textAnnotations.length === 0) return;

    // 恢复批注
    textAnnotations.forEach((annotation) => {
      try {
        if (!highlighterRef.current || !pdfLayerRef.current) return;

        // 检查高亮是否已存在，避免重复创建
        const existingHighlight = pdfLayerRef.current.querySelector(
          `[data-highlight-id="${annotation.id}"]`,
        );
        if (existingHighlight) {
          // 高亮已存在，只需更新样式
          applyStyleToHighlightElements(
            annotation.id,
            annotation.type,
            annotation.color,
          );
          return;
        }

        // 转换为扩展类型
        const extAnnotation = annotation as ExtendedTextAnnotation;

        // 如果有fromStore方法且有必要的元数据，使用它来恢复高亮
        if (
          typeof highlighterRef.current.fromStore === 'function' &&
          extAnnotation.startMeta &&
          extAnnotation.endMeta
        ) {
          const highlightId = highlighterRef.current.fromStore(
            extAnnotation.startMeta,
            extAnnotation.endMeta,
            annotation.text,
            annotation.id,
          );

          // 使用辅助函数应用样式
          applyStyleToHighlightElements(
            highlightId,
            annotation.type,
            annotation.color,
          );
        } else if (annotation.rects && annotation.rects.length > 0) {
          // 使用DOM方式手动创建高亮元素
          annotation.rects.forEach((rect) => {
            const element = document.createElement('span');
            element.className = `web-highlighter-selection pdf-text-${annotation.type}`;
            element.setAttribute('data-highlight-id', annotation.id);

            element.style.position = 'absolute';
            element.style.left = `${rect.x * scale}px`;
            element.style.top = `${rect.y * scale}px`;
            element.style.width = `${rect.width * scale}px`;
            element.style.height = `${rect.height * scale}px`;
            element.style.zIndex = '5'; // 固定值，高于文本层

            // 根据批注类型设置样式
            if (annotation.type === 'highlight') {
              element.style.backgroundColor = annotation.color;
              element.style.opacity = '0.3';
              element.style.mixBlendMode = 'multiply';
            } else if (annotation.type === 'strikethrough') {
              element.style.textDecoration = 'line-through';
              element.style.textDecorationColor = annotation.color;
              element.style.textDecorationThickness = '2px';
              element.style.backgroundColor = 'transparent';
            } else if (annotation.type === 'underline') {
              element.style.textDecoration = 'underline';
              element.style.textDecorationColor = annotation.color;
              element.style.textDecorationThickness = '2px';
              element.style.backgroundColor = 'transparent';
            }

            // 确保pdfLayerRef.current存在
            if (pdfLayerRef.current) {
              pdfLayerRef.current.appendChild(element);
            }
          });
        }
      } catch (error) {
        console.error('恢复批注失败:', error, annotation);
      }
    });

    // 再次清理，确保没有重复元素
    cleanupDuplicateHighlights();
  }, [annotations, pageNumber, pdfLayerRef, scale, forceUpdate]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: readOnly ? 'none' : 'auto',
        zIndex: zIndex,
      }}
      className="highlighter-layer"
    >
      {/* 文本选择捕获层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: readOnly || !activeTool ? 'none' : 'auto',
          zIndex: zIndex + 1,
          cursor: activeTool ? 'text' : 'default',
        }}
        className="text-selection-layer"
      />
    </div>
  );
};

// 导出组件
export default HighlighterLayer;
