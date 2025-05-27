import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import './index.less';

interface ThumbnailPreviewProps {
  fileUrl: string | File | Blob;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  fileUrl,
  numPages,
  currentPage,
  onPageChange,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState<boolean>(false);
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  // 处理文档加载成功
  const handleDocumentLoadSuccess = () => {
    setIsDocumentLoaded(true);

    // 初始化时加载前20页或所有页面（如果少于20页）
    const initialPages = [];
    for (let i = 1; i <= Math.min(numPages, 20); i++) {
      initialPages.push(i);
    }
    setVisiblePages(initialPages);

    // 文档加载后，标记完成状态（延迟以等待初始页面渲染）
    setTimeout(() => setLoadingComplete(true), 500);
  };

  // 更新可见页面函数
  const updateVisiblePages = useCallback(() => {
    if (!listRef.current || numPages === 0 || !loadingComplete) return;

    const container = listRef.current;
    const { scrollTop, clientHeight } = container;

    // 计算可见区域
    const buffer = 5; // 增加缓冲区大小，加载更多页面
    const itemHeight = 150; // 估计的每个缩略图高度（包括间距）

    const startIndex = Math.max(1, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      numPages,
      Math.ceil((scrollTop + clientHeight) / itemHeight) + buffer,
    );

    // 更新可见页面数组
    const newVisiblePages = [];
    for (let i = startIndex; i <= endIndex; i++) {
      newVisiblePages.push(i);
    }

    // 确保当前页始终在可见范围内
    if (!newVisiblePages.includes(currentPage) && currentPage <= numPages) {
      newVisiblePages.push(currentPage);
    }

    setVisiblePages(newVisiblePages);
  }, [numPages, currentPage, loadingComplete]);

  // 处理缩略图点击
  const handleThumbnailClick = useCallback(
    (pageNumber: number) => {
      if (pageNumber === currentPage) {
        return;
      }

      // 调用页面切换回调
      onPageChange(pageNumber);
    },
    [currentPage, onPageChange],
  );

  // 监听滚动事件
  useEffect(() => {
    if (!listRef.current || !loadingComplete) return;

    // 初始化可见页面
    updateVisiblePages();

    // 监听滚动事件
    const container = listRef.current;
    const handleScroll = () => {
      requestAnimationFrame(updateVisiblePages);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [updateVisiblePages, loadingComplete]);

  // 滚动到当前页
  useEffect(() => {
    if (listRef.current && currentPage && isDocumentLoaded && loadingComplete) {
      // 简单估算每个缩略图的高度
      const itemHeight = 150;
      const scrollPosition = (currentPage - 1) * itemHeight;

      // 只有当当前页不在可视区域时才滚动
      const container = listRef.current;
      const { scrollTop, clientHeight } = container;

      if (
        scrollPosition < scrollTop ||
        scrollPosition > scrollTop + clientHeight - itemHeight
      ) {
        container.scrollTo({
          top: scrollPosition - clientHeight / 2 + itemHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [currentPage, isDocumentLoaded, loadingComplete]);

  // 渲染缩略图
  const renderThumbnails = () => {
    if (!isDocumentLoaded) {
      return <div className="thumbnail-loading">加载PDF缩略图...</div>;
    }

    const thumbnails = [];

    for (let i = 1; i <= numPages; i++) {
      const isVisible = visiblePages.includes(i);

      thumbnails.push(
        <div
          key={i}
          className={`thumbnail-item ${i === currentPage ? 'active' : ''}`}
          onClick={() => handleThumbnailClick(i)}
          style={{ cursor: 'pointer' }}
        >
          <div className="thumbnail-page-number">{i}</div>
          <div className="thumbnail-container">
            {isVisible && (
              <Page
                pageNumber={i}
                width={100}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={null}
              />
            )}
          </div>
        </div>,
      );
    }

    // 添加底部空间，确保可以滚动到最后一页
    thumbnails.push(
      <div key="bottom-space" style={{ height: '20px', flexShrink: 0 }} />,
    );

    return thumbnails;
  };

  return (
    <div className="thumbnail-preview-box">
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={<div className="thumbnail-loading">加载文档中...</div>}
        error={<div className="thumbnail-error">PDF加载失败</div>}
      >
        <div className="thumbnail-list" ref={listRef}>
          {renderThumbnails()}
        </div>
      </Document>
    </div>
  );
};

export default ThumbnailPreview;
