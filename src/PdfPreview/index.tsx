import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Spin, message } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './index.less';

// 设置PDF.js worker路径
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
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
   * @returns
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

  // 页数变化事件
  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1)
        ? newPageNumber
        : prevPageNumber;
    });
  };

  // 上一页 事件
  const previousPage = () => changePage(-1);

  // 下一页 事件
  const nextPage = () => changePage(1);

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

  // 渲染内容
  const renderContent = () => {
    if (loading || !pdfFile) {
      return (
        <div className="document-preview-loading">
          <div className="loading-container">
            <Spin size="large" />
            <div className="loading-text">加载中...</div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="pdf-container">
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
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
        <div className="pdf-controls">
          <Button
            icon={<LeftOutlined />}
            onClick={previousPage}
            disabled={pageNumber <= 1}
          />
          <span>{`${pageNumber} / ${numPages || 1}`}</span>
          <Button
            icon={<RightOutlined />}
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
          />
          <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
          <span>{`${Math.round(scale * 100)}%`}</span>
          <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          <Button icon={<DownloadOutlined />} onClick={downloadFile}>
            下载
          </Button>
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
