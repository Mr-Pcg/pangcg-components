import React, { useEffect, useRef, useState } from 'react';
import '../index.less';
import { Annotation } from '../types';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  onUpdateAnnotation: (annotation: Annotation) => void;
  isToolActive: boolean;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageNumber,
  scale,
  pageWidth,
  pageHeight,
  onUpdateAnnotation,
  isToolActive,
}) => {
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const layerRef = useRef<HTMLDivElement>(null);

  // 添加调试日志，帮助排查问题
  useEffect(() => {
    console.log('AnnotationLayer渲染', {
      annotations,
      pageNumber,
      pageWidth,
      pageHeight,
      scale,
      isToolActive,
      layerElement: layerRef.current,
    });

    // 在组件挂载后添加一个测试批注
    if (layerRef.current && annotations.length === 0) {
      console.log('在页面中添加测试批注');

      // 在DOM中直接创建测试元素
      const testElem = document.createElement('div');
      testElem.className = 'annotation annotation-test';
      testElem.style.position = 'absolute';
      testElem.style.left = '50px';
      testElem.style.top = '50px';
      testElem.style.width = '100px';
      testElem.style.height = '50px';
      testElem.style.backgroundColor = 'red';
      testElem.style.opacity = '0.5';
      testElem.style.border = '2px solid red';
      testElem.style.zIndex = '1000';
      testElem.style.pointerEvents = 'auto';
      testElem.textContent = 'TEST';

      // 将测试元素添加到层中
      layerRef.current.appendChild(testElem);
    }
  }, [annotations, pageNumber, scale, pageWidth, pageHeight, isToolActive]);

  // 清除选中状态的处理函数
  const clearSelection = () => {
    setSelectedAnnotationId(null);
  };

  // 处理点击空白区域清除选择
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layerRef.current && !layerRef.current.contains(e.target as Node)) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理批注拖动
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !selectedAnnotationId) return;

    // 找到被拖动的批注
    const annotation = annotations.find((a) => a.id === selectedAnnotationId);
    if (!annotation || !annotation.position) return;

    // 获取批注层的坐标系
    const layerRect = layerRef.current?.getBoundingClientRect();
    if (!layerRect) return;

    // 计算新位置，考虑到缩放比例
    const newX = (e.clientX - layerRect.left - dragOffset.x) / scale;
    const newY = (e.clientY - layerRect.top - dragOffset.y) / scale;

    // 确保批注不会移出页面边界
    const width = annotation.position.width || 0;
    const height = annotation.position.height || 0;

    const boundedX = Math.max(0, Math.min(newX, pageWidth / scale - width));
    const boundedY = Math.max(0, Math.min(newY, pageHeight / scale - height));

    // 更新批注位置
    const updatedAnnotation = {
      ...annotation,
      position: {
        ...annotation.position,
        x: boundedX,
        y: boundedY,
      },
    };

    console.log('拖动批注更新:', updatedAnnotation);
    onUpdateAnnotation(updatedAnnotation);
  };

  // 结束拖动
  const handleDragEnd = () => {
    setIsDragging(false);
    console.log('结束拖动批注');

    // 移除全局鼠标事件监听器
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // 渲染批注函数
  const renderAnnotation = (annotation: Annotation, index: number) => {
    const { id, type, position, text, style } = annotation;
    if (!position) {
      console.log(`批注 ${id} 没有position属性`, annotation);
      return null;
    }

    const { x, y, width = 100, height = 100 } = position;
    const isSelected = selectedAnnotationId === id;

    // 基础样式 - 使用!important确保样式不被覆盖
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x * scale}px`,
      top: `${y * scale}px`,
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      cursor: isToolActive ? 'default' : 'move',
      border: isSelected ? '2px dashed #1890ff' : 'none',
      transformOrigin: 'top left',
      zIndex: isSelected ? 1200 : 1100,
      boxShadow: isSelected ? '0 0 5px rgba(24, 144, 255, 0.5)' : 'none',
    };

    // 日志详细信息以便调试
    console.log(`渲染批注 ${id}`, {
      ...baseStyle,
      annotation,
      computed: {
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
      },
    });

    // 渲染批注元素
    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedAnnotationId(id);
      console.log('选中批注:', id);
    };

    const handleDragStart = (e: React.MouseEvent) => {
      if (isToolActive) return;
      e.stopPropagation();
      e.preventDefault();

      setIsDragging(true);
      setSelectedAnnotationId(id);

      // 计算鼠标与批注左上角的偏移量
      const element = e.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      console.log('开始拖动批注:', id, { x: e.clientX, y: e.clientY, rect });

      // 添加全局鼠标事件监听器
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    };

    // 根据批注类型渲染不同内容
    switch (type) {
      case 'text':
        return (
          <div
            key={id || `text-${index}`}
            className={`annotation annotation-text ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '5px',
              overflow: 'auto',
              border: '1px solid #d9d9d9',
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          >
            <div
              style={{
                color: style.strokeColor,
                fontSize: `${(style.fontSize || 14) * scale}px`,
                fontFamily: style.fontFamily || 'Arial',
              }}
            >
              {text || '文本批注'}
            </div>
          </div>
        );

      case 'highlight':
        return (
          <div
            key={id || `highlight-${index}`}
            className={`annotation annotation-highlight ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              backgroundColor: style.fillColor || 'rgba(255, 255, 0, 0.3)',
              opacity: style.opacity,
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          >
            <div
              style={{
                color: style.strokeColor,
                fontSize: `${(style.fontSize || 14) * scale}px`,
              }}
            >
              {text || '高亮文本'}
            </div>
          </div>
        );

      case 'underline':
        return (
          <div
            key={id || `underline-${index}`}
            className={`annotation annotation-underline ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              textDecoration: `underline ${style.strokeColor}`,
              opacity: style.opacity,
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          >
            <div
              style={{
                color: style.strokeColor,
                fontSize: `${(style.fontSize || 14) * scale}px`,
              }}
            >
              {text || '下划线文本'}
            </div>
          </div>
        );

      case 'strikethrough':
        return (
          <div
            key={id || `strikethrough-${index}`}
            className={`annotation annotation-strikethrough ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              textDecoration: `line-through ${style.strokeColor}`,
              opacity: style.opacity,
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          >
            <div
              style={{
                color: style.strokeColor,
                fontSize: `${(style.fontSize || 14) * scale}px`,
              }}
            >
              {text || '删除线文本'}
            </div>
          </div>
        );

      case 'rectangle':
        return (
          <div
            key={id || `rectangle-${index}`}
            className={`annotation annotation-rectangle ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              border: `${style.lineWidth * scale}px solid ${style.strokeColor}`,
              backgroundColor: style.fillColor || 'rgba(255, 0, 0, 0.2)',
              opacity: style.opacity,
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          />
        );

      case 'circle':
      case 'ellipse':
        return (
          <div
            key={id || `${type}-${index}`}
            className={`annotation annotation-${type} ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              border: `${style.lineWidth * scale}px solid ${style.strokeColor}`,
              backgroundColor: style.fillColor || 'rgba(255, 255, 255, 0.1)',
              opacity: style.opacity,
              borderRadius: type === 'circle' ? '50%' : '40%',
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          />
        );

      case 'signature':
      case 'stamp':
        return (
          <div
            key={id || `${type}-${index}`}
            className={`annotation annotation-${type} ${
              isSelected ? 'selected' : ''
            }`}
            style={{
              ...baseStyle,
              backgroundImage: `url(${text})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
            onClick={handleSelect}
            onMouseDown={handleDragStart}
          />
        );

      default:
        return null;
    }
  };

  // 过滤当前页面的批注并渲染
  const currentPageAnnotations = annotations.filter(
    (annotation) => annotation.pageNumber === pageNumber,
  );

  console.log(
    '当前页面批注数量:',
    currentPageAnnotations.length,
    currentPageAnnotations,
  );

  return (
    <div
      ref={layerRef}
      className="annotation-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isToolActive ? 'none' : 'auto',
        zIndex: 1000, // 设置非常高的z-index以确保在最上层
      }}
      onClick={clearSelection}
    >
      {/* 为了测试，添加一个固定的批注元素 */}
      <div
        className="debug-annotation"
        style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          width: '120px',
          height: '60px',
          backgroundColor: 'blue',
          opacity: 0.5,
          border: '2px solid blue',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        调试批注
      </div>

      {/* 渲染所有批注 */}
      {currentPageAnnotations.map((annotation, index) =>
        renderAnnotation(annotation, index),
      )}
    </div>
  );
};

export default AnnotationLayer;
