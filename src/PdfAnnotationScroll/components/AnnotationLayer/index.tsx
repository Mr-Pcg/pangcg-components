import dayjs from 'dayjs';
import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import {
  Circle,
  Ellipse,
  Image,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from 'react-konva';
import {
  Annotation,
  AnnotationType,
  DrawAnnotation,
  ImageAnnotation,
  LineStyle,
  ShapeAnnotation,
  TextNoteAnnotation,
} from '../../types';
import './index.less';

interface AnnotationLayerProps {
  pageNumber: number;
  scale: number;
  width: number;
  height: number;
  activeTool: AnnotationType | null;
  activeColor: string;
  activeLineStyle: LineStyle;
  annotations: Annotation[];
  readOnly?: boolean;
  zIndex?: number;
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationUpdate: (
    id: string,
    updates: Partial<Omit<Annotation, 'type'>>,
  ) => void;
  onAnnotationRemove: (id: string) => void;
  onToolReset?: () => void;
  setShowTextNotePanel: (show: boolean) => void;
  setTextNotePanelData: (data: TextNoteAnnotation) => void;
}

// 计算文本尺寸的辅助函数
const calculateTextDimensions = (
  text: string,
  fontSize: number,
  maxWidth: number,
  fontFamily: string = 'Arial',
): { width: number; height: number } => {
  // 创建临时canvas用于文本测量
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return { width: 200, height: 100 }; // 默认值
  }

  // 设置字体
  context.font = `${fontSize}px ${fontFamily}`;

  // 拆分文本行
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  // 计算行数
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + ' ' + word).width;

    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  // 计算所需高度 (行数 * 行高)
  const lineHeight = fontSize * 1.2; // 行高约为字体大小的1.2倍
  const height = lines.length * lineHeight + 16; // 添加一些内边距

  // 计算所需宽度 (找到最宽的行)
  let maxLineWidth = 0;
  for (const line of lines) {
    const lineWidth = context.measureText(line).width;
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }

  return {
    width: Math.min(maxLineWidth + 16, maxWidth), // 添加内边距，但不超过最大宽度
    height: height,
  };
};

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  pageNumber,
  scale,
  width,
  height,
  activeTool,
  activeColor,
  activeLineStyle,
  annotations,
  readOnly = false,
  zIndex = 5,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationRemove,
  onToolReset,
  setShowTextNotePanel,
  setTextNotePanelData,
}) => {
  // 引用和状态
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);

  // 绘制批注
  const [drawingAnnotation, setDrawingAnnotation] =
    useState<DrawAnnotation | null>(null);

  // 形状批注
  const [shapeAnnotation, setShapeAnnotation] =
    useState<ShapeAnnotation | null>(null);

  // 过滤不同类型的批注数据
  // 形状批注：矩形、圆形、椭圆
  const shapeAnnotations = annotations.filter((a): a is ShapeAnnotation =>
    ['rectangle', 'circle', 'ellipse'].includes(a.type),
  );

  // 绘制批注：绘制、高亮
  const drawAnnotations = annotations.filter((a): a is DrawAnnotation =>
    ['freedraw', 'freehighlight'].includes(a.type),
  );

  // 图片批注：签名、盖章
  const imageAnnotations = annotations.filter((a): a is ImageAnnotation =>
    ['signature', 'stamp'].includes(a.type),
  );

  // 文本批注
  const textAnnotations = annotations.filter(
    (a): a is TextNoteAnnotation => a.type === 'text',
  );

  // 处理形状变换完成事件
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!selectedId) return;

    const node = e.target;
    const id = node.id();

    // 获取变换后的属性 - 只保留缩放，不处理旋转
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    try {
      // 获取当前批注类型
      const annotation = annotations.find((a) => a.id === id);
      if (!annotation) return;

      // 为绘制批注准备的变量
      let drawAnnotation;
      let newPoints: number[] = [];

      // 根据批注类型更新不同的属性
      switch (annotation.type) {
        case 'rectangle': {
          // 矩形处理简单，直接获取变换后的位置和尺寸
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;
          const x = node.x();
          const y = node.y();

          onAnnotationUpdate(id, {
            x,
            y,
            width,
            height,
            modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          } as Partial<ShapeAnnotation>);
          break;
        }
        case 'circle': {
          // 圆形的中心点和半径计算
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;
          const newRadius = Math.max(width, height) / 2;

          // 获取节点的中心坐标
          const centerX = node.x(); // 节点中心点，因为Konva中的Circle是基于中心点绘制的
          const centerY = node.y();

          // 左上角坐标计算
          const x = centerX - newRadius;
          const y = centerY - newRadius;

          // 存储批注数据 - 转换为左上角坐标
          onAnnotationUpdate(id, {
            // 批注中的坐标是左上角
            x,
            y,
            // 保证存储的宽高一致并基于半径
            width: newRadius * 2,
            height: newRadius * 2,
            radius: newRadius,
            modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          } as Partial<ShapeAnnotation>);
          break;
        }
        case 'ellipse': {
          // 椭圆以中心点为基准
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;

          // 获取中心点坐标
          const centerX = node.x(); // 节点的中心点，因为Konva中的Ellipse是基于中心点绘制的
          const centerY = node.y();

          // 左上角坐标计算
          const x = centerX - width / 2;
          const y = centerY - height / 2;

          // 存储批注数据 - 转换为左上角坐标
          onAnnotationUpdate(id, {
            // 批注中的坐标是左上角
            x,
            y,
            width,
            height,
            modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          } as Partial<ShapeAnnotation>);
          break;
        }
        case 'signature':
        case 'stamp': {
          // 图片批注
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;
          const x = node.x();
          const y = node.y();

          onAnnotationUpdate(id, {
            x,
            y,
            width,
            height,
            modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          } as Partial<ImageAnnotation>);
          break;
        }
        case 'freedraw':
        case 'freehighlight': {
          // 获取原始点数据
          drawAnnotation = annotation as DrawAnnotation;
          const originalPoints = [...drawAnnotation.points];

          try {
            // 找到点集的中心
            let minX = Infinity,
              minY = Infinity;
            let maxX = -Infinity,
              maxY = -Infinity;

            for (let i = 0; i < originalPoints.length; i += 2) {
              minX = Math.min(minX, originalPoints[i]);
              maxX = Math.max(maxX, originalPoints[i]);
              minY = Math.min(minY, originalPoints[i + 1]);
              maxY = Math.max(maxY, originalPoints[i + 1]);
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            // 获取变换后的位移
            const nodeX = node.x();
            const nodeY = node.y();

            // 创建新的点集，应用缩放和位移
            newPoints = [];
            for (let i = 0; i < originalPoints.length; i += 2) {
              // 计算点相对于中心的偏移
              const dx = originalPoints[i] - centerX;
              const dy = originalPoints[i + 1] - centerY;

              // 应用缩放和位移
              const scaledX = nodeX + dx * scaleX;
              const scaledY = nodeY + dy * scaleY;

              newPoints.push(scaledX, scaledY);
            }

            // 更新批注数据
            onAnnotationUpdate(id, {
              points: newPoints,
              modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            } as Partial<DrawAnnotation>);

            // 重置缩放因子和位置
            node.scaleX(1);
            node.scaleY(1);
            node.position({ x: 0, y: 0 });
          } catch (error) {
            // 如果失败，至少重置缩放因子
            node.scaleX(1);
            node.scaleY(1);
            node.position({ x: 0, y: 0 });
          }

          break;
        }
        case 'text': {
          // 文本批注
          const width = node.width() * scaleX;
          const height = node.height() * scaleY;
          const x = node.x() / scale;
          const y = node.y() / scale;

          // 更新批注数据
          onAnnotationUpdate(id, {
            x,
            y,
            width: width / scale,
            height: height / scale,
            modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          } as Partial<TextNoteAnnotation>);

          // 重置文本节点的位置和尺寸
          const textNode = node.getStage()?.findOne(`#text-${id}`);
          if (textNode) {
            textNode.position({
              x: node.x() + 4 * scale,
              y: node.y() + 4 * scale,
            });
            textNode.width((width / scale - 8) * scale);
            textNode.height((height / scale - 8) * scale);
            textNode.getLayer()?.batchDraw();
          }

          break;
        }
      }
    } catch (error) {
      console.log('更新批注失败:', error);
    }

    // 重置缩放因子
    node.scaleX(1);
    node.scaleY(1);
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly || !activeTool) return;

    // 检查是否点击到了批注上
    const clickedOnEmpty = e.target === e.currentTarget;
    if (!clickedOnEmpty) return;

    // 鼠标位置
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // 坐标转换，处理缩放
    const x = pos.x / scale;
    const y = pos.y / scale;

    // 开始绘制
    switch (activeTool) {
      case 'freedraw':
      case 'freehighlight': {
        setDrawing(true);

        // 创建绘制批注
        const strokeWidth = activeTool === 'freedraw' ? 2 : 10;
        const newAnnotation: DrawAnnotation = {
          id: Date.now().toString(),
          type: activeTool,
          pageNumber,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          color: activeColor,
          opacity: activeTool === 'freedraw' ? 1 : 0.5,
          points: [x, y],
          strokeWidth,
          lineStyle: activeLineStyle, // 使用当前选择的线型
        };

        setDrawingAnnotation(newAnnotation);
        break;
      }
      case 'rectangle':
      case 'circle':
      case 'ellipse': {
        // 创建形状批注
        const newAnnotation: ShapeAnnotation = {
          id: Date.now().toString(),
          type: activeTool,
          pageNumber,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          color: activeColor,
          opacity: 1,
          x,
          y,
          width: 0,
          height: 0,
          strokeWidth: 2,
          lineStyle: activeLineStyle, // 使用当前选择的线型
        };

        setShapeAnnotation(newAnnotation);
        break;
      }
      case 'text': {
        // 文本批注 - 直接重置工具，因为这个工具需要通过面板添加
        if (onToolReset) onToolReset();
        break;
      }
      default:
        break;
    }
  };

  // 处理鼠标移动事件（调整形状大小或继续绘制线条）
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    // 绘制线条
    if (drawing && drawingAnnotation) {
      setDrawingAnnotation({
        ...drawingAnnotation,
        points: [...drawingAnnotation.points, x, y],
      });
    }

    // 调整形状大小
    if (shapeAnnotation) {
      const width = x - shapeAnnotation.x;
      const height = y - shapeAnnotation.y;

      setShapeAnnotation({
        ...shapeAnnotation,
        width,
        height,
        radius: Math.max(Math.abs(width || 0), Math.abs(height || 0)) / 2,
      });
    }
  };

  // 处理鼠标松开事件（完成绘制）
  const handleMouseUp = () => {
    if (readOnly) return;

    // 完成绘制线条
    if (drawing && drawingAnnotation) {
      // 只有线条有一定长度才添加
      if (drawingAnnotation.points.length > 4) {
        onAnnotationAdd(drawingAnnotation);
        // 添加成功后重置工具
        onToolReset?.();
      }
      setDrawing(false);
      setDrawingAnnotation(null);
    }

    // 完成绘制形状
    if (shapeAnnotation) {
      // 只有形状有一定大小才添加
      if (
        Math.abs(shapeAnnotation.width || 0) > 5 &&
        Math.abs(shapeAnnotation.height || 0) > 5
      ) {
        // 确保宽高为正数
        const width = shapeAnnotation.width || 0;
        const height = shapeAnnotation.height || 0;
        const x = width < 0 ? shapeAnnotation.x + width : shapeAnnotation.x;
        const y = height < 0 ? shapeAnnotation.y + height : shapeAnnotation.y;
        const absWidth = Math.abs(width);
        const absHeight = Math.abs(height);

        onAnnotationAdd({
          ...shapeAnnotation,
          x,
          y,
          width: absWidth,
          height: absHeight,
          radius:
            shapeAnnotation.type === 'circle'
              ? Math.max(absWidth, absHeight) / 2
              : undefined,
        });

        // 添加成功后重置工具
        onToolReset?.();
      }
      setShapeAnnotation(null);
    }
  };

  // 处理画布点击事件
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;

    // 获取点击位置
    const stage = e.target.getStage();
    if (!stage) return;

    // 如果点击了空白区域，取消选中
    if (e.target === e.currentTarget) {
      setSelectedId(null);
      return;
    }

    // 获取点击的形状
    const node = e.target;
    const nodeId = node.id();

    // 如果有工具激活，则不选中批注
    if (activeTool) return;

    // 选中批注
    setSelectedId(nodeId || null);
  };

  // 渲染形状批注: 绘制形状
  const renderShapeAnnotations = () => {
    return shapeAnnotations.map((annotation) => {
      const isSelected = selectedId === annotation.id;
      const strokeDashArray =
        annotation.lineStyle === 'dashed' ? [5, 5] : undefined; // 根据线型设置虚线样式

      switch (annotation.type) {
        case 'rectangle':
          return (
            <React.Fragment key={annotation.id}>
              <Rect
                id={annotation.id}
                x={annotation.x}
                y={annotation.y}
                width={annotation.width || 0}
                height={annotation.height || 0}
                stroke={annotation.color}
                strokeWidth={annotation.strokeWidth || 2}
                opacity={annotation.opacity}
                dash={strokeDashArray} // 应用虚线样式
                perfectDrawEnabled={false}
                listening={!readOnly}
                onClick={() => !readOnly && setSelectedId(annotation.id)}
                onTap={() => !readOnly && setSelectedId(annotation.id)}
                draggable={!readOnly}
                onDragEnd={(e) => {
                  onAnnotationUpdate(annotation.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                    modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  } as Partial<ShapeAnnotation>);
                }}
                onTransformEnd={handleTransformEnd}
              />
              {isSelected && !readOnly && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => newBox}
                  rotateEnabled={false}
                  keepRatio={(annotation.type as string) === 'circle'}
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                />
              )}
            </React.Fragment>
          );
        case 'circle':
          return (
            <React.Fragment key={annotation.id}>
              <Circle
                id={annotation.id}
                x={annotation.x + (annotation.radius || 0)}
                y={annotation.y + (annotation.radius || 0)}
                radius={annotation.radius || 0}
                stroke={annotation.color}
                strokeWidth={annotation.strokeWidth || 2}
                opacity={annotation.opacity}
                dash={strokeDashArray} // 应用虚线样式
                perfectDrawEnabled={false}
                listening={!readOnly}
                onClick={() => !readOnly && setSelectedId(annotation.id)}
                onTap={() => !readOnly && setSelectedId(annotation.id)}
                draggable={!readOnly}
                onDragEnd={(e) => {
                  const centerX = e.target.x();
                  const centerY = e.target.y();
                  const radius = annotation.radius || 0;
                  const leftX = centerX - radius;
                  const leftY = centerY - radius;

                  onAnnotationUpdate(annotation.id, {
                    x: leftX,
                    y: leftY,
                    modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  } as Partial<ShapeAnnotation>);
                }}
                onTransformEnd={handleTransformEnd}
              />
              {isSelected && !readOnly && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => newBox}
                  rotateEnabled={false}
                  keepRatio={(annotation.type as string) === 'circle'}
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                />
              )}
            </React.Fragment>
          );
        case 'ellipse':
          return (
            <React.Fragment key={annotation.id}>
              <Ellipse
                id={annotation.id}
                x={annotation.x + (annotation.width || 0) / 2}
                y={annotation.y + (annotation.height || 0) / 2}
                radiusX={(annotation.width || 0) / 2}
                radiusY={(annotation.height || 0) / 2}
                stroke={annotation.color}
                strokeWidth={annotation.strokeWidth || 2}
                opacity={annotation.opacity}
                dash={strokeDashArray} // 应用虚线样式
                perfectDrawEnabled={false}
                listening={!readOnly}
                onClick={() => !readOnly && setSelectedId(annotation.id)}
                onTap={() => !readOnly && setSelectedId(annotation.id)}
                draggable={!readOnly}
                onDragEnd={(e) => {
                  const centerX = e.target.x();
                  const centerY = e.target.y();
                  const width = annotation.width || 0;
                  const height = annotation.height || 0;
                  const leftX = centerX - width / 2;
                  const leftY = centerY - height / 2;

                  onAnnotationUpdate(annotation.id, {
                    x: leftX,
                    y: leftY,
                    modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                  } as Partial<ShapeAnnotation>);
                }}
                onTransformEnd={handleTransformEnd}
              />
              {isSelected && !readOnly && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => newBox}
                  rotateEnabled={false}
                  keepRatio={(annotation.type as string) === 'circle'}
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                />
              )}
            </React.Fragment>
          );
        default:
          return null;
      }
    });
  };

  // 渲染绘制批注: 绘制线条
  const renderDrawAnnotations = () => {
    return drawAnnotations.map((annotation) => {
      const isSelected = selectedId === annotation.id;
      const strokeDashArray =
        annotation.lineStyle === 'dashed' ? [5, 5] : undefined; // 根据线型设置虚线样式

      return (
        <React.Fragment key={annotation.id}>
          <Line
            id={annotation.id}
            points={annotation.points}
            stroke={annotation.color}
            strokeWidth={annotation.strokeWidth || 2}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            opacity={annotation.opacity}
            dash={strokeDashArray} // 应用虚线样式
            perfectDrawEnabled={false}
            globalCompositeOperation={
              annotation.type === 'freehighlight' ? 'multiply' : 'source-over'
            }
            listening={!readOnly}
            onClick={() => !readOnly && setSelectedId(annotation.id)}
            onTap={() => !readOnly && setSelectedId(annotation.id)}
            draggable={!readOnly}
            onDragEnd={(e) => {
              // 获取拖拽后的位置调整值
              const dx = e.target.x();
              const dy = e.target.y();

              // 重置位置并更新所有点的坐标
              e.target.position({ x: 0, y: 0 });

              // 计算新的点坐标
              const newPoints = [...annotation.points];
              for (let i = 0; i < newPoints.length; i += 2) {
                newPoints[i] += dx;
                newPoints[i + 1] += dy;
              }

              // 更新批注数据
              onAnnotationUpdate(annotation.id, {
                points: newPoints,
                modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              } as Partial<DrawAnnotation>);
            }}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && !readOnly && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => newBox}
              rotateEnabled={false}
            />
          )}
        </React.Fragment>
      );
    });
  };

  // 渲染图像批注: 绘制图像
  const renderImageAnnotations = () => {
    return imageAnnotations.map((annotation) => {
      const { id, x, y, width, height, imageData, opacity } = annotation;
      const isSelected = selectedId === annotation.id;

      // 创建图像对象
      const image = new window.Image();
      image.src = imageData;

      return (
        <React.Fragment key={id}>
          <Image
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            image={image}
            opacity={opacity}
            draggable={!readOnly}
            onClick={() => !readOnly && setSelectedId(id)}
            onTap={() => !readOnly && setSelectedId(id)}
            // 拖拽
            onDragEnd={(e) => {
              onAnnotationUpdate(id, {
                x: e.target.x(),
                y: e.target.y(),
              } as Partial<ImageAnnotation>);
            }}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && !readOnly && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => newBox}
              rotateEnabled={false}
              keepRatio={(annotation.type as string) === 'circle'}
              enabledAnchors={[
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
              ]}
            />
          )}
        </React.Fragment>
      );
    });
  };

  // 渲染正在绘制的批注: 绘制线条
  const renderDrawingAnnotation = () => {
    if (!drawingAnnotation) return null;

    // 为正在绘制的批注添加虚线样式
    const strokeDashArray =
      drawingAnnotation.lineStyle === 'dashed' ? [5, 5] : undefined;

    return (
      <Line
        points={drawingAnnotation.points}
        stroke={drawingAnnotation.color}
        strokeWidth={drawingAnnotation.strokeWidth || 2}
        lineCap="round"
        lineJoin="round"
        tension={0.5}
        opacity={drawingAnnotation.opacity}
        dash={strokeDashArray} // 应用虚线样式
        perfectDrawEnabled={false}
        globalCompositeOperation={
          drawingAnnotation.type === 'freehighlight'
            ? 'multiply'
            : 'source-over'
        }
        listening={false}
      />
    );
  };

  // 渲染正在创建的形状: 绘制形状
  const renderShapeAnnotation = () => {
    if (!shapeAnnotation) return null;

    // 为正在绘制的形状添加虚线样式
    const strokeDashArray =
      shapeAnnotation.lineStyle === 'dashed' ? [5, 5] : undefined;

    // 根据形状类型选择渲染组件
    switch (shapeAnnotation.type) {
      case 'rectangle':
        return (
          <Rect
            x={shapeAnnotation.x}
            y={shapeAnnotation.y}
            width={shapeAnnotation.width || 0}
            height={shapeAnnotation.height || 0}
            stroke={shapeAnnotation.color}
            strokeWidth={shapeAnnotation.strokeWidth || 2}
            opacity={shapeAnnotation.opacity}
            dash={strokeDashArray} // 应用虚线样式
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      case 'circle': {
        const r = shapeAnnotation.radius || 0;
        return (
          <Circle
            x={shapeAnnotation.x + r}
            y={shapeAnnotation.y + r}
            radius={r}
            stroke={shapeAnnotation.color}
            strokeWidth={shapeAnnotation.strokeWidth || 2}
            opacity={shapeAnnotation.opacity}
            dash={strokeDashArray} // 应用虚线样式
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      }
      case 'ellipse':
        return (
          <Ellipse
            x={shapeAnnotation.x + (shapeAnnotation.width || 0) / 2}
            y={shapeAnnotation.y + (shapeAnnotation.height || 0) / 2}
            radiusX={Math.abs(shapeAnnotation.width || 0) / 2}
            radiusY={Math.abs(shapeAnnotation.height || 0) / 2}
            stroke={shapeAnnotation.color}
            strokeWidth={shapeAnnotation.strokeWidth || 2}
            opacity={shapeAnnotation.opacity}
            dash={strokeDashArray} // 应用虚线样式
            perfectDrawEnabled={false}
            listening={false}
          />
        );
      default:
        return null;
    }
  };

  // 渲染文本批注
  const renderTextAnnotations = () => {
    return textAnnotations
      ?.filter((annotation) => annotation.pageNumber === pageNumber)
      ?.map((annotation) => {
        const isSelected = selectedId === annotation.id;

        // 自动计算合适的宽高
        const maxWidth = width * 0.8; // 最大宽度为PDF宽度的80%
        const textDimensions = calculateTextDimensions(
          annotation.text || '',
          annotation.fontSize || 16,
          maxWidth,
          'Arial',
        );

        // 如果没有明确设置宽高或者宽高太小，则使用计算的尺寸
        const rectWidth =
          annotation.width && annotation.width > 20
            ? annotation.width
            : textDimensions.width / scale;

        const rectHeight =
          annotation.height && annotation.height > 20
            ? annotation.height
            : textDimensions.height / scale;

        return (
          <React.Fragment key={annotation.id}>
            <Rect
              id={annotation.id}
              x={annotation.x * scale}
              y={annotation.y * scale}
              width={rectWidth * scale}
              height={rectHeight * scale}
              fill={annotation.backgroundColor || '#FFFFA0'}
              opacity={0.8}
              cornerRadius={4}
              stroke={isSelected ? '#1890ff' : 'transparent'}
              strokeWidth={isSelected ? 2 : 0}
              // 双击删除文本批注
              onDblClick={() => {
                setSelectedId(annotation.id);
                setShowTextNotePanel(true);
                // 直接传递原始的批注对象，不创建新对象
                setTextNotePanelData(annotation);
              }}
              // 双击删除文本批注
              onDblTap={() => {}}
              // 拖拽
              draggable={!readOnly}
              onDragMove={(e) => {
                // 在拖拽过程中找到对应的文本节点并更新位置
                const textNode = e.target
                  .getStage()
                  ?.findOne(`#text-${annotation.id}`);
                if (textNode) {
                  textNode.position({
                    x: e.target.x() + 4 * scale,
                    y: e.target.y() + 4 * scale,
                  });
                  textNode.getLayer()?.batchDraw();
                }
              }}
              onDragEnd={(e) => {
                onAnnotationUpdate(annotation.id, {
                  x: e.target.x() / scale,
                  y: e.target.y() / scale,
                  width: rectWidth,
                  height: rectHeight,
                  modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                } as Partial<TextNoteAnnotation>);
              }}
              onTransform={(e) => {
                // 在变换过程中实时更新文本位置和大小
                const node = e.target;
                const textNode = node
                  .getStage()
                  ?.findOne(`#text-${annotation.id}`);
                if (textNode) {
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  textNode.position({
                    x: node.x() + 4 * scale * scaleX,
                    y: node.y() + 4 * scale * scaleY,
                  });

                  textNode.width(node.width() * scaleX - 8 * scale * scaleX);
                  textNode.height(node.height() * scaleY - 8 * scale * scaleY);
                  textNode.getLayer()?.batchDraw();
                }
              }}
              onTransformEnd={handleTransformEnd}
            />
            <Text
              id={`text-${annotation.id}`}
              x={(annotation.x + 4) * scale}
              y={(annotation.y + 4) * scale}
              width={(rectWidth - 8) * scale}
              height={(rectHeight - 8) * scale}
              text={annotation.text}
              fontSize={(annotation.fontSize || 16) * scale}
              fontFamily="Arial"
              fill="#333333"
              wrap="word"
              listening={false}
            />
            {isSelected && !readOnly && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // 确保变换结果不会太小
                  if (newBox.width < 50 || newBox.height < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </React.Fragment>
        );
      });
  };

  // 处理删除快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedId &&
        !readOnly
      ) {
        onAnnotationRemove(selectedId);
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, onAnnotationRemove, readOnly]);

  // 更新Transformer选中节点
  useEffect(() => {
    // 如果选中的节点存在，并且变换器存在，并且舞台存在
    if (selectedId && transformerRef.current && stageRef.current) {
      // 查找选中的节点
      const node = stageRef.current.findOne(`#${selectedId}`);

      // 如果选中的节点存在
      if (node) {
        const annotation = annotations.find((a) => a.id === selectedId); // 查找对应的批注

        // 只有非自由绘制和非高亮批注才能使用变换转换器
        if (
          annotation &&
          !['freedraw', 'freehighlight'].includes(annotation.type)
        ) {
          // 更新Transformer的节点
          transformerRef.current?.nodes([node]);

          // 根据批注类型设置不同的转换控制点
          // 签名或盖章
          if (['signature', 'stamp'].includes(annotation.type)) {
            transformerRef.current?.enabledAnchors([
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]);
            transformerRef.current?.rotateEnabled(false); // 不允许旋转
            transformerRef.current?.keepRatio(true); // 保持宽高比
          } else if (annotation.type === 'text') {
            // 文本批注
            transformerRef.current?.enabledAnchors([
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
              'middle-left',
              'middle-right',
              'top-center',
              'bottom-center',
            ]);
            transformerRef.current?.rotateEnabled(false); // 不允许旋转
            transformerRef.current?.keepRatio(false); // 允许自由调整宽高
          } else {
            // 其他批注类型
            transformerRef.current?.enabledAnchors([
              'top-left',
              'top-center',
              'top-right',
              'middle-left',
              'middle-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ]);
            transformerRef.current?.rotateEnabled(false); // 不允许旋转
            // 保持宽高比
            transformerRef.current?.keepRatio(
              (annotation.type as string) === 'circle',
            );
          }

          transformerRef.current?.getLayer()?.batchDraw();
        } else {
          // 自由绘制和高亮批注不应用变换转换器
          transformerRef.current?.nodes([]);
          transformerRef.current?.getLayer()?.batchDraw();
        }
      }
    } else if (transformerRef.current) {
      // 清除Transformer选择
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
    }
  }, [selectedId, annotations]);

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
      className="annotation-layer"
    >
      {/* Konva舞台 - 用于形状和绘制批注 */}
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scale={{ x: scale, y: scale }}
        onClick={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown as any}
        onTouchMove={handleMouseMove as any}
        onTouchEnd={handleMouseUp as any}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'all',
        }}
      >
        <Layer ref={layerRef}>
          {/* 渲染形状批注 */}
          {renderShapeAnnotations()}
          {/* 渲染绘制批注 */}
          {renderDrawAnnotations()}
          {/* 渲染图像批注 */}
          {renderImageAnnotations()}
          {/* 渲染文本批注 */}
          {renderTextAnnotations()}

          {/* 渲染正在绘制的批注 */}
          {renderDrawingAnnotation()}
          {/* 渲染正在创建的形状 */}
          {renderShapeAnnotation()}

          {/* 变换控制器 */}
          {!readOnly && (
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              keepRatio={false}
              borderDash={[6, 2]}
              borderStroke="#1890ff"
              anchorStroke="#1890ff"
              anchorFill="#ffffff"
              anchorSize={8}
              boundBoxFunc={(oldBox, newBox) => {
                // 禁止负宽度和高度
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationLayer;
