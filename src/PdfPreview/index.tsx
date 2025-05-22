import {
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Divider, Spin, message } from 'antd';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './index.less';

// 设置PDF.js worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type FileUrlType = string | Blob | File;

interface PdfPreviewProps {
  /**
   * 文件URL或文件数据
   * 支持三种格式：
   * 1. 在线链接: 'https://example.com/file.pdf'
   * 2. Base64: 'data:application/pdf;base64,JVBERi0x...'
   * 3. 文件流: Blob 或 File 对象
   */
  fileUrl: FileUrlType;

  /**
   * 文件名
   * 当 fileUrl 为 Blob 或 Base64 时，可以指定文件名
   */
  fileName?: string;

  /**
   *  class 属性
   */
  className?: string;

  /**
   * style 样式
   */
  style?: CSSProperties;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  fileUrl,
  fileName = '文件预览',
  className = '',
  style = {},
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfFile, setPdfFile] = useState<FileUrlType | null>(null);
  const [displayFileName, setDisplayFileName] = useState<string>(fileName);
  const [thumbnailCollapsed, setThumbnailCollapsed] = useState<boolean>(false);
  // 标记当前滚动来源： pdf ｜ 缩略图pdf
  const [activeScrolling, setActiveScrolling] = useState<
    'pdf' | 'thumbnail' | null
  >(null);

  const pdfContainerRef = useRef<HTMLDivElement>(null); // pdf区域
  const thumbnailContainerRef = useRef<HTMLDivElement>(null); // 缩略图区域
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 判断是否为文件对象
  const isFileObject = (file: any): file is File => {
    return typeof File !== 'undefined' && file instanceof File;
  };

  // 判断是否为Blob对象
  const isBlobObject = (file: any): file is Blob => {
    return typeof Blob !== 'undefined' && file instanceof Blob;
  };

  /**
   * 根据 fileUrl 判断文件类型 和 设置文件名称
   */
  const processFile = async () => {
    let file_name: string = '';
    let isDisplayFileNameFlag: boolean = true;

    try {
      // 检查是否为在线链接 (string 类型且以 http 或 https 开头)
      if (
        typeof fileUrl === 'string' &&
        (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))
      ) {
        setPdfFile(fileUrl);
        file_name = fileUrl.split('/').pop() || fileName; // 从URL中提取文件名
      } else if (typeof fileUrl === 'string' && fileUrl.startsWith('data:')) {
        // 检查是否为Base64 (string 类型且以 data: 开头)
        setPdfFile(fileUrl);
      } else if (isBlobObject(fileUrl) || isFileObject(fileUrl)) {
        // 处理文件流 (Blob 或 File 对象)
        setPdfFile(fileUrl);
        // 如果是File对象，使用其名称
        file_name =
          isFileObject(fileUrl) && fileUrl?.name ? fileUrl.name : fileName;
      } else {
        // 不支持的格式
        message.error('不支持的文件格式');
        isDisplayFileNameFlag = false;
      }
      // 设置 文件名称
      if (isDisplayFileNameFlag) {
        setDisplayFileName(file_name);
      }
      // 关闭加载状态
      setLoading(false);
    } catch (error) {
      console.error('处理文件时出错:', error);
      message.error('无法加载文件');
      setLoading(false);
    }
  };

  // 处理不同类型的文件URL
  useEffect(() => {
    setLoading(true);
    setPdfFile(null);
    setPageNumber(1); // 显示第一页

    // 判断文件类型 和 文件名称
    processFile();
  }, [fileUrl, fileName]);

  // 文档加载成功
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  // 缩略图文档加载成功
  const onThumbnailDocumentLoadSuccess = () => {
    // 缩略图加载成功
  };

  // 滚动PDF到指定页面
  const scrollPdfToPage = (page: number) => {
    if (!pdfContainerRef.current || !numPages) return;

    setActiveScrolling('thumbnail');

    // 计算每页的大致高度和位置
    const pdfContainer = pdfContainerRef.current;
    const totalHeight = pdfContainer.scrollHeight;
    const pageHeight = totalHeight / (numPages || 1);

    // 计算目标滚动位置 - 直接滚动到页面顶部，不再居中显示
    const targetScrollTop = (page - 1) * pageHeight;

    // 使用平滑滚动
    pdfContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });

    // 滚动结束后重置activeScrolling状态
    setTimeout(() => {
      setActiveScrolling(null);
    }, 500);
  };

  // 点击缩略图跳转到指定页面
  const handleThumbnailClick = (pageIndex: number) => {
    setPageNumber(pageIndex + 1);
    scrollPdfToPage(pageIndex + 1);
  };

  // 滚动缩略图到当前页
  const scrollThumbnailToCurrentPage = () => {
    if (!thumbnailContainerRef.current || !pageNumber || !numPages) return;

    const thumbnailContainer = thumbnailContainerRef.current;
    const containerHeight = thumbnailContainer.clientHeight;
    const totalHeight = thumbnailContainer.scrollHeight;
    const thumbnailHeight = totalHeight / (numPages || 1);

    // 计算目标滚动位置
    const targetScrollTop =
      (pageNumber - 1) * thumbnailHeight -
      containerHeight / 2 +
      thumbnailHeight / 2;

    // 使用平滑滚动
    thumbnailContainer.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });
  };

  // pdf：放大
  const zoomIn = () => {
    setScale(scale * 1.2);
  };
  // pdf：缩小
  const zoomOut = () => {
    setScale(scale / 1.2);
  };

  // 下载
  const downloadFile = () => {
    try {
      // 处理不同类型的文件下载
      if (
        typeof fileUrl === 'string' &&
        (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))
      ) {
        // 在线链接：打开新窗口
        window.open(fileUrl, '_blank');
      } else if (typeof fileUrl === 'string' && fileUrl.startsWith('data:')) {
        // Base64：创建下载链接
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = displayFileName || 'document.pdf';
        link.click();
      } else if (isBlobObject(fileUrl) || isFileObject(fileUrl)) {
        // 文件流：创建URL并下载
        const url = URL.createObjectURL(fileUrl);
        const link = document.createElement('a');
        link.href = url;
        link.download = displayFileName || 'document.pdf';
        link.click();
        // 清理URL对象
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error('下载文件时出错:', error);
      message.error('下载文件失败');
    }
  };

  // 切换侧边栏收缩状态
  const toggleThumbnailCollapsed = () => {
    setThumbnailCollapsed(!thumbnailCollapsed);
  };

  // 监听PDF滚动，同步缩略图
  useEffect(() => {
    const pdfContainer = pdfContainerRef.current;
    if (!pdfContainer || !numPages) return;

    const handleScroll = () => {
      // 如果是由缩略图触发的滚动，不处理
      if (activeScrolling === 'thumbnail') return;

      // 标记为PDF正在滚动
      setActiveScrolling('pdf');

      // 计算当前页码
      const scrollTop = pdfContainer.scrollTop;
      const totalHeight = pdfContainer.scrollHeight;
      const pageHeight = totalHeight / numPages;

      // 根据滚动位置计算当前页码
      const currentPage = Math.floor(scrollTop / pageHeight) + 1;
      const offset = (scrollTop % pageHeight) / pageHeight;

      // 如果滚动超过页面的一半，则认为是下一页
      const calculatedPage = offset > 0.5 ? currentPage + 1 : currentPage;
      const newPage = Math.max(1, Math.min(calculatedPage, numPages));

      if (newPage !== pageNumber) {
        setPageNumber(newPage);
      }

      // 延迟重置activeScrolling状态
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setActiveScrolling(null);
      }, 150);
    };

    // 节流处理，减少滚动事件触发频率
    let scrollTimeout: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 50);
      }
    };

    pdfContainer.addEventListener('scroll', throttledHandleScroll);

    return () => {
      pdfContainer.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [numPages, pageNumber, activeScrolling]);

  // 当页码变化时，如果是由PDF滚动引起的，滚动缩略图
  useEffect(() => {
    if (activeScrolling === 'pdf') {
      scrollThumbnailToCurrentPage();
    }
  }, [pageNumber, activeScrolling]);

  // 渲染内容
  const renderContent = () => {
    if (loading || !pdfFile) {
      return (
        <div className="document-preview-loading">
          <div className="loading-container">
            <Spin size="large" />
            <div
              className="loading-text"
              style={{
                marginTop: '16px',
                color: 'rgba(0, 0, 0, 0.65)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              正在加载PDF文件，请稍候...
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="pdf-controls">
          <div className="pdf-controls-left">
            <Button
              type="text"
              icon={
                thumbnailCollapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={toggleThumbnailCollapsed}
              className="thumbnail-toggle-btn"
            />
          </div>
          <div className="pdf-controls-center">
            <div className="page-indicator">
              {`${pageNumber} / ${numPages || 1}`}
            </div>
            <Divider type="vertical" className="page-divider" />
            <div>
              <Button
                type="text"
                icon={<ZoomOutOutlined />}
                onClick={zoomOut}
              />
              <span className="zoom-indicator">{`${Math.round(
                scale * 100,
              )}%`}</span>
              <Button type="text" icon={<ZoomInOutlined />} onClick={zoomIn} />
            </div>
          </div>

          <div className="pdf-controls-right">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={downloadFile}
              className="download-btn"
            />
          </div>
        </div>

        <div className="pdf-content-container">
          <div
            className={`pdf-thumbnails-container ${
              thumbnailCollapsed ? 'collapsed' : ''
            }`}
            ref={thumbnailContainerRef}
          >
            {numPages && (
              <Document
                file={pdfFile}
                onLoadSuccess={onThumbnailDocumentLoadSuccess}
                loading={<Spin size="small" />}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`thumbnail-${index}`}
                    className={`pdf-thumbnail ${
                      pageNumber === index + 1 ? 'active' : ''
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={0.15}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                    <div className="thumbnail-page-number">{index + 1}</div>
                  </div>
                ))}
              </Document>
            )}
          </div>

          <div className="pdf-container" ref={pdfContainerRef}>
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
                message.error('无法加载PDF文件');
                setLoading(false);
              }}
              loading={<Spin size="large" />}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page-wrapper-${index}`}
                  className="pdf-page-wrapper"
                  id={`pdf-page-${index + 1}`}
                >
                  <Page
                    key={`page-${index}`}
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className={`document-preview-container ${className}`}
      style={style ? { ...style } : undefined}
    >
      {renderContent()}
    </div>
  );
};

export default PdfPreview;
