import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import type { Annotation } from '../../types';
import './index.less';

interface SideMenuProps {
  visible: boolean; // 是否显示
  annotations: Annotation[]; // 批注列表
  currentPage: number; // 当前页码

  fileUrl?: string | File | Blob; // PDF文件地址
  onAnnotationSelect: (annotationId: string) => void; // 选择批注回调
  onAnnotationDelete: (annotationId: string) => void; // 删除批注回调
  onThumbnailClick?: (pageNumber: number) => void; // 点击缩略图回调
}

interface TabItem {
  key: string;
  label: string;
  content: (props: SideMenuProps) => React.ReactNode;
}

// 获取批注类型名称
function getAnnotationTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    text: '文本',
    highlight: '高亮',
    underline: '下划线',
    strikethrough: '删除线',
    rectangle: '矩形',
    circle: '圆形',
    ellipse: '椭圆',
    freehand: '自由绘制',
    freeHighlight: '自由高亮',
    signature: '签名',
    stamp: '印章',
    line: '直线',
    dashed: '虚线',
  };

  return typeMap[type] || type;
}

const SideMenu: React.FC<SideMenuProps> = (props) => {
  const { visible, onThumbnailClick } = props;

  const [numPages, setNumPages] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('preview');

  // 文档加载成功回调
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // 当当前页面变化时，滚动到对应的缩略图
  useEffect(() => {
    const activeThumb = document.querySelector('.thumbnail-item.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [props.currentPage]);

  if (!visible) return null;

  // 处理缩略图点击
  const handleThumbnailClick = (pageNumber: number) => {
    if (onThumbnailClick) {
      onThumbnailClick(pageNumber);
    }
  };

  // 标签页内容定义
  const items: TabItem[] = [
    {
      key: 'preview',
      label: 'PDF预览',
      content: ({ fileUrl, currentPage }) => (
        <div className="preview-panel">
          {fileUrl ? (
            <div
              className="pdf-thumbnails"
              style={{ overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}
            >
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="thumbnail-loading">加载中...</div>}
                error={<div className="thumbnail-error">加载失败</div>}
              >
                {Array.from(new Array(numPages), (el, index) => {
                  const pageNum = index + 1;
                  return (
                    <div
                      key={`thumb_${pageNum}`}
                      className={`thumbnail-item ${
                        currentPage === pageNum ? 'active' : ''
                      }`}
                      onClick={() => handleThumbnailClick(pageNum)}
                    >
                      <div
                        className={`thumbnail-page-number ${
                          currentPage === pageNum ? 'active_bg' : ''
                        }`}
                      >
                        {pageNum}
                      </div>
                      <Page
                        pageNumber={pageNum}
                        width={120}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  );
                })}
              </Document>
            </div>
          ) : (
            <div className="preview-placeholder">
              <p>PDF预览功能即将推出</p>
              <p>当前页码: {currentPage}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'annotations',
      label: '批注列表',
      content: ({
        annotations,
        currentPage,
        onAnnotationSelect,
        onAnnotationDelete,
      }) => {
        return (
          <>
            <div className="annotation-page">页码: {currentPage}</div>
            <div className="annotation-list">
              {annotations.length === 0 ? (
                <div className="empty-annotations">暂无批注</div>
              ) : (
                annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="annotation-item"
                    onClick={() => onAnnotationSelect(annotation.id)}
                  >
                    <div className="annotation-info">
                      <div className="annotation-type">
                        {getAnnotationTypeName(annotation.type)}
                      </div>
                      <div className="annotation-time">
                        {new Date(annotation.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {annotation.text && annotation.type === 'text' && (
                      <div className="annotation-text">{annotation.text}</div>
                    )}
                    <div
                      className="annotation-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnnotationDelete(annotation.id);
                      }}
                    >
                      删除
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );
      },
    },
  ];

  return (
    <div className="pdf-side-menu">
      <div className="side-menu-tabs">
        {items.map((item) => (
          <div
            key={item.key}
            className={`tab-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="tab-content">
        {items.find((item) => item.key === activeTab)?.content(props)}
      </div>
    </div>
  );
};

export default SideMenu;
