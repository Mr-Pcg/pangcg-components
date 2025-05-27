import { DeleteOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Tooltip } from 'antd';
import React from 'react';
import { Annotation } from '../../types';
import './index.less';

interface AnnotationListProps {
  annotations: Annotation[];
  currentPage: number;
  pdfLayerRef?: React.RefObject<HTMLDivElement>;
  scale: number;
  readOnly?: boolean;
  handlePageChange: (page: number) => void;
  onAnnotationSelect?: (id: string) => void;
  onAnnotationDelete: (id: string) => void;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
}

const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  currentPage,
  pdfLayerRef,
  scale,
  readOnly = false,
  handlePageChange,
  onAnnotationSelect,
  onAnnotationDelete,
  onAnnotationUpdate,
}) => {
  // 获取批注类型的中文名称
  const getAnnotationTypeName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      highlight: '高亮',
      strikethrough: '删除线',
      underline: '下划线',
      rectangle: '矩形',
      circle: '圆形',
      ellipse: '椭圆',
      freedraw: '自由绘制',
      freehighlight: '自由高亮',
      signature: '签名',
      stamp: '盖章',
      text: '文本',
    };
    return typeMap[type] || type;
  };

  // 更新评论
  const handleCommentChange = (id: string, value: string) => {
    if (onAnnotationUpdate) {
      onAnnotationUpdate(id, { comment: value });
    }
  };

  // 批注选择 （点击）
  const handleAnnotationSelect = (id: string) => {
    // 获取批注对象
    const annotation = annotations.find((a) => a.id === id);
    if (!annotation) return;

    // 如果批注不在当前页，则切换到对应页面
    if (annotation.pageNumber !== currentPage) {
      handlePageChange(annotation.pageNumber);
    }

    // 创建临时高亮效果
    if (pdfLayerRef?.current) {
      // 根据批注类型确定位置和尺寸
      let position = { x: 0, y: 0, width: 100, height: 50 };

      // 计算位置和尺寸
      if ('x' in annotation && 'y' in annotation) {
        if (annotation.type === 'circle') {
          // 对于圆形，使用左上角坐标和直径（x,y已存储为左上角坐标）
          const radius = annotation.radius || 0;

          position.x = annotation.x * scale;
          position.y = annotation.y * scale;
          position.width = radius * 2 * scale;
          position.height = radius * 2 * scale;
        } else if (annotation.type === 'ellipse') {
          // 对于椭圆，使用左上角坐标和宽高（x,y已存储为左上角坐标）
          position.x = annotation.x * scale;
          position.y = annotation.y * scale;

          if ('width' in annotation && annotation.width) {
            position.width = annotation.width * scale;
          }

          if ('height' in annotation && annotation.height) {
            position.height = annotation.height * scale;
          }
        } else if (annotation.type === 'rectangle') {
          // 对于矩形，直接使用存储的坐标和尺寸
          position.x = annotation.x * scale;
          position.y = annotation.y * scale;

          if ('width' in annotation && annotation.width) {
            position.width = annotation.width * scale;
          }

          if ('height' in annotation && annotation.height) {
            position.height = annotation.height * scale;
          }
        } else {
          // 其他类型批注
          position.x = annotation.x * scale;
          position.y = annotation.y * scale;

          if ('width' in annotation && annotation.width) {
            position.width = annotation.width * scale;
          }

          if ('height' in annotation && annotation.height) {
            position.height = annotation.height * scale;
          }
        }
      }

      // 创建临时高亮元素
      const tempHighlight = document.createElement('div');
      tempHighlight.classList.add('annotation-highlight-selected');
      tempHighlight.style.position = 'absolute';

      // 设置位置和尺寸
      tempHighlight.style.left = `${position.x}px`;
      tempHighlight.style.top = `${position.y}px`;
      tempHighlight.style.width = `${position.width}px`;
      tempHighlight.style.height = `${position.height}px`;

      // 设置样式
      if (annotation.type === 'circle' || annotation.type === 'ellipse') {
        // 圆形和椭圆添加圆角
        tempHighlight.style.borderRadius = '50%';
        tempHighlight.style.border = `2px solid ${
          annotation.color || '#ff5500'
        }`;
        tempHighlight.style.backgroundColor = 'transparent';
      } else if (annotation.type === 'rectangle') {
        // 矩形只添加边框
        tempHighlight.style.border = `2px solid ${
          annotation.color || '#ff5500'
        }`;
        tempHighlight.style.backgroundColor = 'transparent';
      } else if (
        annotation.type === 'freedraw' ||
        annotation.type === 'freehighlight'
      ) {
        // 对于自由绘制和荧光笔，需要计算包围盒
        if (
          'points' in annotation &&
          annotation.points &&
          annotation.points.length > 0
        ) {
          // 计算包围盒
          const points = annotation.points as number[];
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          // 遍历所有点，找出最小和最大的x、y坐标
          for (let i = 0; i < points.length; i += 2) {
            const x = points[i] * scale;
            const y = points[i + 1] * scale;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }

          // 设置高亮区域的位置和大小，添加一些边距确保完全覆盖
          const padding = 5; // 5像素的边距
          tempHighlight.style.left = `${minX - padding}px`;
          tempHighlight.style.top = `${minY - padding}px`;
          tempHighlight.style.width = `${maxX - minX + padding * 2}px`;
          tempHighlight.style.height = `${maxY - minY + padding * 2}px`;

          // 使用批注颜色作为边框色
          tempHighlight.style.border = `2px solid ${
            annotation.color || '#ff5500'
          }`;
          tempHighlight.style.backgroundColor = 'transparent';
        } else {
          // 如果找不到点数组，回退到基本高亮
          tempHighlight.style.transform = 'scale(1.2)';
          tempHighlight.style.transformOrigin = 'center';
          tempHighlight.style.backgroundColor = 'transparent';
        }
      } else if (
        ['highlight', 'strikethrough', 'underline'].includes(annotation.type)
      ) {
        // 文本批注通常很薄
        tempHighlight.style.height = '20px';
      }

      // 将临时元素添加到PDF容器
      pdfLayerRef.current.appendChild(tempHighlight);

      // 确保元素在视图中可见
      const parentElement = pdfLayerRef.current.parentElement;
      if (parentElement) {
        // 获取批注的中心位置
        const highlightCenterX =
          position.x + parseInt(tempHighlight.style.width, 10) / 2;
        const highlightCenterY =
          position.y + parseInt(tempHighlight.style.height, 10) / 2;

        const containerRect = pdfLayerRef.current.getBoundingClientRect();
        const scrollTop = parentElement.scrollTop || 0;
        const scrollLeft = parentElement.scrollLeft || 0;

        parentElement.scrollTo({
          left: highlightCenterX + scrollLeft - containerRect.width / 2,
          top: highlightCenterY + scrollTop - containerRect.height / 2,
          behavior: 'smooth',
        });
      }

      // 3秒后移除临时元素
      setTimeout(() => {
        if (
          pdfLayerRef.current &&
          pdfLayerRef.current.contains(tempHighlight)
        ) {
          pdfLayerRef.current.removeChild(tempHighlight);
        }
      }, 3000);

      // 如果存在onAnnotationSelect，则调用
      if (typeof onAnnotationSelect === 'function') {
        onAnnotationSelect(id);
      }
    }
  };

  return (
    <div className="annotation-list-container-box">
      <div className="annotation-list-header">
        <h4 style={{ margin: 0 }}>批注列表 (第 {currentPage} 页)</h4>
      </div>
      <div className="annotation-list-content">
        {annotations.length === 0 ? (
          <Empty description="暂无批注" />
        ) : (
          <div className="custom-annotation-list">
            {annotations?.map((item) => (
              <div
                key={item.id}
                className="custom-annotation-item"
                onClick={() => handleAnnotationSelect(item.id)}
              >
                <div className="annotation-header">
                  <div className="annotation-type">
                    <span
                      className="annotation-color-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {getAnnotationTypeName(item.type)}
                  </div>
                  {!readOnly && (
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnnotationDelete(item.id);
                      }}
                    />
                  )}
                </div>

                <div className="annotation-date">
                  创建: {item?.createdAt || ''}
                </div>

                {'content' in item && (
                  <div className="annotation-content">
                    内容:
                    <Tooltip title={(item as any)?.content || ''}>
                      <span className="annotation-content-text">
                        {(item as any).content}
                      </span>
                    </Tooltip>
                  </div>
                )}

                <div className="annotation-comment">
                  <Input.TextArea
                    rows={2}
                    value={item.comment || ''}
                    onChange={(e) =>
                      handleCommentChange(item.id, e?.target?.value || '')
                    }
                    placeholder="请输入评论内容..."
                    disabled={readOnly}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationList;
