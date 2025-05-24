import { Tabs } from 'antd';
import dayjs from 'dayjs';
import Konva from 'konva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// 导入react-pdf样式
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// hooks ｜ 方法 ｜ ts类型
import { generateUUID } from 'pangcg-components/api';
import { useAnnotations } from './hooks/useAnnotations';
import {
  Annotation,
  AnnotationType,
  LineStyle,
  TextNoteAnnotation,
} from './types';
// 组件
import AnnotationLayer from './components/AnnotationLayer'; // 批注图层
import AnnotationList from './components/AnnotationList'; // 批注列表组件
import AnnotationToolbar from './components/AnnotationToolbar'; // 批注工具栏
import HeaderAction from './components/HeaderAction'; // 头部组件
import HighlighterLayer from './components/HighlighterLayer'; // 新增: 使用web-highlighter的高亮图层
import SignaturePanel from './components/SignaturePanel'; // 签名面板
import TextNotePanel from './components/TextNotePanel'; // 文本批注面板
import ThumbnailPreview from './components/ThumbnailPreview'; // pdf缩略图组件
// 样式
import './index.less';

// 禁用 Konva 警告
// @ts-ignore
Konva.showWarnings = false;

// 批注层级常量： 根据选择的批注工具 区分 HighlighterLayer 和 AnnotationLayer 的批注层级
const Z_INDEX = {
  BASE: 6, // 基础层级
  TOP: 9, // 顶层层级
};

// 设置PDF.js worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export interface PdfAnnotationExtensionProps {
  fileUrl: string | File | Blob;
  fileName?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
  annotationList?: Annotation[]; // 新增：接收外部传入的注释数据，用于显示PDF已有的批注
  onSave?: (annotations: Annotation[], updatedPdf?: Blob | File) => void;
}

const PdfAnnotationExtension = ({
  fileUrl,
  fileName,
  onSave,
  readOnly = false,
  style = {},
  className = '',
  annotationList = [],
}: PdfAnnotationExtensionProps): JSX.Element => {
  // PDF状态
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // 批注工具状态
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [activeColor, setActiveColor] = useState<string>('#FFFF00');
  const [activeLineStyle, setActiveLineStyle] = useState<LineStyle>('solid');
  const [showSignaturePanel, setShowSignaturePanel] = useState<boolean>(false);

  // 文本批注面板状态
  const [showTextNotePanel, setShowTextNotePanel] = useState<boolean>(false);
  // 文本批注面板数据
  const [textNotePanelData, setTextNotePanelData] = useState(
    {} as TextNoteAnnotation,
  );

  // 侧边栏状态
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'annotations'>(
    'thumbnails',
  );
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfLayerRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const pdfPagesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  // 使用批注钩子，传入初始注释数据
  const { annotations, addAnnotation, updateAnnotation, removeAnnotation } =
    useAnnotations(annotationList);

  // 清理所有高亮元素的辅助函数
  const clearAllHighlights = () => {
    // 第1步：清理直接添加的高亮元素（包括自定义高亮）
    const highlightElementSelectors = [
      '.highlight-container',
      '[data-highlight-id]',
      '.custom-pdf-highlight',
      '.web-highlighter-selection',
      '.web-highlighter-wrapper',
    ];

    // 在文档范围内查找
    highlightElementSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        try {
          // 如果是文本容器，确保文本内容保留
          if (el.textContent) {
            // 如果元素有父节点并且不是顶层元素
            if (el.parentNode && el.parentNode !== document.body) {
              // 对于可能包含文本的高亮容器，替换为其文本内容
              const text = el.textContent;
              const textNode = document.createTextNode(text);
              el.parentNode.replaceChild(textNode, el);
            } else {
              el.remove();
            }
          } else {
            el.remove();
          }
        } catch (error) {
          console.error('清理高亮元素失败:', error);
        }
      });
    });

    // 第2步：清理web-highlighter创建的样式和脚本
    try {
      // 清理相关样式元素
      document.querySelectorAll('style[data-highlight-style]').forEach((el) => {
        el.remove();
      });

      // 重置页面缓存
      const pageContent = document.querySelector(
        '.react-pdf__Page__textContent',
      );
      if (pageContent) {
        // 重新启用文本元素选择
        pageContent.querySelectorAll('span, div').forEach((el) => {
          (el as HTMLElement).style.userSelect = 'text';
          (el as HTMLElement).style.webkitUserSelect = 'text';
          (el as HTMLElement).style.pointerEvents = 'auto';
        });
      }
    } catch (error) {
      console.error('清理web-highlighter元素失败:', error);
    }
  };

  // 处理页面滚动同步
  const handleScroll = useCallback(() => {
    if (!mainContentRef.current || !pdfPagesRef.current) return;

    const container = mainContentRef.current;
    const scrollTop = container.scrollTop;

    // 找到当前可见的页面
    let visiblePage = currentPage;
    let minDistance = Infinity;

    Object.entries(pdfPagesRef.current).forEach(([pageNum, pageEl]) => {
      if (!pageEl) return;
      const pageTop = pageEl.offsetTop;
      const distance = Math.abs(pageTop - scrollTop);

      if (distance < minDistance) {
        minDistance = distance;
        visiblePage = parseInt(pageNum);
      }
    });

    // 如果页码发生变化，更新当前页
    if (visiblePage !== currentPage) {
      setCurrentPage(visiblePage);
    }
  }, [currentPage]);

  // 监听滚动事件
  useEffect(() => {
    const container = mainContentRef.current;
    if (!container) return;

    // 使用 requestAnimationFrame 优化滚动性能
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', scrollListener, { passive: true });
    return () => {
      container.removeEventListener('scroll', scrollListener);
    };
  }, [handleScroll]);

  // 处理页面直接跳转
  const handlePageChange = useCallback((pageNumber: number) => {
    // 当页面改变时，清除DOM中的高亮元素
    if (pdfLayerRef.current) {
      clearAllHighlights();
    }

    // 更新当前页码
    setCurrentPage(pageNumber);

    // 滚动到目标页面
    const pageElement = pdfPagesRef.current[pageNumber];
    if (pageElement && mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: pageElement.offsetTop,
        behavior: 'smooth',
      });
    }
  }, []);

  // 处理PDF加载成功
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // 处理页面加载成功，获取页面尺寸
  const handlePageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfDimensions({
      width: viewport.width,
      height: viewport.height,
    });
  };

  // 处理线型选择
  const handleLineStyleChange = (lineStyle: LineStyle) => {
    setActiveLineStyle(lineStyle);
  };

  // 处理工具选择
  const handleToolSelect = (tool: AnnotationType) => {
    setActiveTool(tool);

    // 工具选择：signature：签名   stamp：盖章
    if (tool === 'signature' || tool === 'stamp') {
      setShowSignaturePanel(true);
    }

    // 工具选择：text：文本批注
    if (tool === 'text') {
      setShowTextNotePanel(true);
      setTextNotePanelData({} as TextNoteAnnotation);
    }
  };

  // 处理签名/盖章保存
  const handleImageSave = (imageData: string, type: 'signature' | 'stamp') => {
    if (!pdfDimensions.width || !pdfDimensions.height) return;

    // 添加签名/盖章批注
    addAnnotation({
      id: 'add-' + generateUUID(),
      type,
      pageNumber: currentPage,
      x: pdfDimensions.width / 4,
      y: pdfDimensions.height / 4,
      width: pdfDimensions.width / 2,
      height:
        type === 'signature'
          ? pdfDimensions.height / 8
          : pdfDimensions.width / 4,
      imageData,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      color: '#000000',
      opacity: 1,
    });

    setShowSignaturePanel(false);
    setActiveTool(null);
  };

  // 处理文本批注保存
  const handleTextNoteSave = (
    text: string,
    fontSize: number,
    backgroundColor: string,
  ) => {
    if (!pdfDimensions.width || !pdfDimensions.height) return;

    // 计算文本尺寸的函数
    const calculateTextSize = (
      text: string,
      fontSize: number,
    ): { width: number; height: number } => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return { width: 200, height: 100 }; // 默认值
      }

      // 设置字体
      context.font = `${fontSize}px Arial`;

      // 拆分文本行，考虑中文和英文混合情况
      const maxWidth = pdfDimensions.width * 0.8; // 最大宽度为PDF宽度的80%
      const characters = text.split('');
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const testLine = currentLine + char;
        const metrics = context.measureText(testLine);

        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // 计算所需高度 (行数 * 行高)
      const lineHeight = fontSize * 1.5; // 行高设置为字体大小的1.5倍
      const height = Math.max(lines.length * lineHeight + 16, 40); // 添加内边距，并设置最小高度

      // 计算所需宽度 (找到最宽的行)
      let maxLineWidth = 0;
      for (const line of lines) {
        const lineWidth = context.measureText(line).width;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }

      return {
        width: Math.min(Math.max(maxLineWidth + 16, 100), maxWidth), // 添加内边距，设置最小和最大宽度
        height: height,
      };
    };

    // 编辑文本批注
    if (textNotePanelData?.id) {
      // 计算适合文本内容的尺寸
      const { width: textWidth, height: textHeight } = calculateTextSize(
        text,
        fontSize,
      );

      // 保留原有的位置信息，更新文本内容、字体大小、背景颜色和尺寸
      updateAnnotation(textNotePanelData.id, {
        text,
        fontSize,
        backgroundColor,
        width: textWidth,
        height: textHeight,
        modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      } as Partial<TextNoteAnnotation>);
    } else {
      // 计算适合文本内容的尺寸
      const { width: textWidth, height: textHeight } = calculateTextSize(
        text,
        fontSize,
      );

      // 添加文本批注
      const newAnnotation: TextNoteAnnotation = {
        id: 'add-' + generateUUID(),
        type: 'text',
        pageNumber: currentPage,
        x: (pdfDimensions.width - textWidth) / 2, // 水平居中
        y: pdfDimensions.height / 4,
        width: textWidth,
        height: textHeight,
        text,
        fontSize,
        backgroundColor,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        color: '#333333',
        opacity: 1,
      };

      addAnnotation(newAnnotation);
    }
    setShowTextNotePanel(false);
    setActiveTool(null);
    setTextNotePanelData({} as TextNoteAnnotation);
  };

  // 缩放
  const zoomIn = () => setScale(scale * 1.2);
  const zoomOut = () => setScale(scale / 1.2);

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // 添加批注时应用当前线型
  const addAnnotationWithStyle = (annotation: Annotation) => {
    // 对形状和自由绘制类型批注应用线型设置
    if (
      ['rectangle', 'circle', 'ellipse', 'freedraw', 'freehighlight'].includes(
        annotation.type,
      )
    ) {
      addAnnotation({
        ...annotation,
        lineStyle: activeLineStyle,
      });
    } else {
      addAnnotation(annotation);
    }
  };

  // 修改 AnnotationList 组件的 pdfLayerRef 传递方式
  const getAnnotationListRef = useCallback((pageNumber: number) => {
    return {
      current: pdfLayerRef.current[pageNumber] || null,
    } as React.RefObject<HTMLDivElement>;
  }, []);

  // 渲染PDF页面
  const renderPages = () => {
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <div
          key={i}
          className="pdf-page-container"
          style={{ position: 'relative', marginBottom: '10px' }}
          ref={(el) => {
            if (el) {
              pdfPagesRef.current[i] = el;
            }
          }}
        >
          <Page
            pageNumber={i}
            width={pdfDimensions.width}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            onLoadSuccess={(page) => handlePageLoadSuccess(page)}
            loading={null}
          />
          {/* 每页独立的批注层容器 */}
          <div
            ref={(el) => {
              if (el) {
                pdfLayerRef.current[i] = el;
              }
            }}
            className="pdf-layer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* 文本批注图层 */}
            <HighlighterLayer
              pageNumber={i}
              scale={scale}
              activeTool={
                ['highlight', 'strikethrough', 'underline'].includes(
                  activeTool as string,
                )
                  ? (activeTool as 'highlight' | 'strikethrough' | 'underline')
                  : null
              }
              activeColor={activeColor}
              pdfLayerRef={getAnnotationListRef(i)}
              annotations={annotations.filter((a) => a.pageNumber === i)}
              onAnnotationAdd={addAnnotation}
              onAnnotationRemove={removeAnnotation}
              onAnnotationUpdate={updateAnnotation}
              onToolReset={() => setActiveTool(null)}
              readOnly={readOnly}
              zIndex={
                ['highlight', 'strikethrough', 'underline'].includes(
                  activeTool as string,
                )
                  ? Z_INDEX.TOP
                  : Z_INDEX.BASE
              }
            />
            {/* 其他批注图层 */}
            <AnnotationLayer
              pageNumber={i}
              scale={scale}
              width={pdfDimensions.width}
              height={pdfDimensions.height}
              activeTool={
                !['highlight', 'strikethrough', 'underline'].includes(
                  activeTool as string,
                )
                  ? activeTool
                  : null
              }
              activeColor={activeColor}
              activeLineStyle={activeLineStyle}
              annotations={annotations.filter((a) => a.pageNumber === i)}
              readOnly={readOnly}
              zIndex={
                !['highlight', 'strikethrough', 'underline'].includes(
                  activeTool as string,
                )
                  ? Z_INDEX.TOP
                  : Z_INDEX.BASE
              }
              onAnnotationAdd={addAnnotationWithStyle}
              onAnnotationUpdate={updateAnnotation}
              onAnnotationRemove={removeAnnotation}
              onToolReset={() => setActiveTool(null)}
              setShowTextNotePanel={setShowTextNotePanel}
              setTextNotePanelData={setTextNotePanelData}
            />
          </div>
        </div>,
      );
    }
    return pages;
  };

  return (
    <div
      className={`pdf-annotation-container ${className}`}
      style={style}
      ref={containerRef}
    >
      {/* 头部操作: 缩放｜保存 */}
      <HeaderAction
        fileUrl={fileUrl}
        fileName={fileName}
        annotations={[...annotations]}
        currentPage={currentPage}
        numPages={numPages}
        readOnly={readOnly}
        pdfLayerRef={pdfLayerRef}
        scale={scale}
        sidebarVisible={sidebarVisible}
        toggleSidebar={toggleSidebar}
        setCurrentPage={setCurrentPage}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
        onSave={onSave}
      />

      {/* 工具栏 */}
      {!readOnly && (
        <AnnotationToolbar
          activeTool={activeTool} // 当前选中的工具
          activeColor={activeColor} // 当前选中的颜色
          activeLineStyle={activeLineStyle} // 当前选中的线型
          onToolSelect={handleToolSelect} // 工具选择
          onColorChange={setActiveColor} // 颜色选择
          onLineStyleChange={handleLineStyleChange} // 线型选择
          readOnly={readOnly} // 是否只读
        />
      )}

      <div className="pdf-annotation-content">
        {/* 左侧侧边栏 */}
        <div
          className={`pdf-annotation-sidebar ${
            sidebarVisible ? 'visible' : 'hidden'
          }`}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) =>
              setActiveTab(key as 'thumbnails' | 'annotations')
            }
            items={[
              {
                key: 'thumbnails',
                label: '页面预览',
                children: (
                  <ThumbnailPreview
                    fileUrl={fileUrl}
                    numPages={numPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                ),
              },
              {
                key: 'annotations',
                label: '批注列表',
                children: (
                  <AnnotationList
                    annotations={annotations?.filter(
                      (a) => a.pageNumber === currentPage,
                    )}
                    currentPage={currentPage}
                    pdfLayerRef={getAnnotationListRef(currentPage)}
                    scale={scale}
                    handlePageChange={handlePageChange}
                    onAnnotationDelete={removeAnnotation}
                    onAnnotationUpdate={updateAnnotation}
                    readOnly={readOnly}
                  />
                ),
              },
            ]}
          />
        </div>

        <div
          className="pdf-annotation-main"
          ref={mainContentRef}
          style={{
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={
              <div
                className="pdf-loading"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <svg
                    viewBox="0 0 1024 1024"
                    width="48"
                    height="48"
                    fill="#1677ff"
                  >
                    <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
                    <path d="M304 544h416c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H304c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8zm0-144h416c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H304c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8zm0 288h416c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H304c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path>
                  </svg>
                </div>
                <div
                  style={{
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontSize: '14px',
                    fontWeight: 500,
                    textAlign: 'center',
                  }}
                >
                  正在加载PDF文件，请稍候...
                </div>
              </div>
            }
            error={
              <div
                className="pdf-error"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <svg
                    viewBox="64 64 896 896"
                    width="48"
                    height="48"
                    fill="#ff4d4f"
                  >
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                    <path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path>
                  </svg>
                </div>
                <div
                  style={{
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontSize: '16px',
                    fontWeight: 500,
                    marginBottom: '8px',
                  }}
                >
                  加载PDF失败
                </div>
                <div
                  style={{
                    color: 'rgba(0, 0, 0, 0.65)',
                    fontSize: '14px',
                  }}
                >
                  请检查文件格式或网络连接后重试
                </div>
              </div>
            }
          >
            {renderPages()}
          </Document>
        </div>
      </div>

      {/* 签名/盖章面板 */}
      {showSignaturePanel && activeTool && (
        <SignaturePanel
          visible={showSignaturePanel}
          type={activeTool as 'signature' | 'stamp'}
          onSave={(imageData) =>
            handleImageSave(imageData, activeTool as 'signature' | 'stamp')
          }
          onCancel={() => {
            setShowSignaturePanel(false);
            setActiveTool(null);
          }}
        />
      )}

      {/* 文本批注面板 */}
      {showTextNotePanel && (
        <TextNotePanel
          onSave={handleTextNoteSave}
          onCancel={() => {
            setShowTextNotePanel(false);
            setActiveTool(null);
            setTextNotePanelData({} as TextNoteAnnotation);
          }}
          visible={showTextNotePanel}
          curTextNotePanelData={textNotePanelData}
        />
      )}
    </div>
  );
};

export default PdfAnnotationExtension;
