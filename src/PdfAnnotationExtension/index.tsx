import {
  CloseCircleOutlined,
  DownloadOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PrinterOutlined,
  RightOutlined,
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Tabs } from 'antd';
import Konva from 'konva';
import React, { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// 导入react-pdf样式
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 禁用 Konva 警告
// @ts-ignore
Konva.showWarnings = false;

// 批注层级常量： 根据选择的批注工具 区分 HighlighterLayer 和 AnnotationLayer 的批注层级
const Z_INDEX = {
  BASE: 6, // 基础层级
  TOP: 9, // 顶层层级
};

// hooks
import { useAnnotations } from './hooks/useAnnotations'; // 批注钩子
// 类型
import {
  Annotation,
  AnnotationType,
  LineStyle,
  TextNoteAnnotation,
} from './types';
// 组件
import AnnotationLayer from './components/AnnotationLayer'; // 批注图层
import AnnotationToolbar from './components/AnnotationToolbar'; // 批注工具栏
import HighlighterLayer from './components/HighlighterLayer'; // 新增: 使用web-highlighter的高亮图层
import SignaturePanel from './components/SignaturePanel'; // 签名面板
import TextNotePanel from './components/TextNotePanel'; // 文本批注面板
// 样式
import dayjs from 'dayjs';
import { generateUUID } from 'pangcg-components/api';
import AnnotationList from './components/AnnotationList';
import ThumbnailPreview from './components/ThumbnailPreview';
import './index.less';

// 设置PDF.js worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export interface PdfAnnotationExtensionProps {
  fileUrl: string | File | Blob;
  fileName?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
  annotationList?: Annotation[]; // 新增：接收外部传入的注释数据，用于显示PDF已有的批注
  onSave?: (annotations: Annotation[], updatedPdf?: Blob) => void;
}

const PdfAnnotationExtension = ({
  fileUrl,
  fileName,
  onSave,
  readOnly = false,
  style = {},
  className = '',
  annotationList = [], // 新增：默认为空数组
}: PdfAnnotationExtensionProps): JSX.Element => {
  // PDF状态
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  // PDF尺寸
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

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
  const pdfLayerRef = useRef<HTMLDivElement>(null);

  // 使用批注钩子，传入初始注释数据
  const {
    annotations,
    addAnnotation, // 添加批注
    updateAnnotation, // 更新批注
    removeAnnotation, // 删除批注
    // clearAnnotations, // 清理所有批注
  } = useAnnotations(annotationList);

  // 添加 ref 用于访问 Page 组件
  const pageRef = useRef<any>(null);

  // 添加状态
  const [isPrinting, setIsPrinting] = useState<boolean>(false); // 打印状态
  const [printProgress, setPrintProgress] = useState<string>(''); // 打印进度

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

  // 处理PDF加载成功
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
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

  // 保存批注
  const handleSaveAnnotations = async () => {
    try {
      if (onSave) {
        // 将文件转换为blob
        let pdfBlob: Blob | File | undefined;

        if (typeof fileUrl === 'string') {
          // 处理base64
          if (fileUrl.startsWith('data:')) {
            const base64Data = fileUrl.split(',')[1];
            const binary = atob(base64Data);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            pdfBlob = new Blob([array], { type: 'application/pdf' });
          } else if (fileUrl.startsWith('http')) {
            // 在线的pdf的URL
            try {
              const response = await fetch(fileUrl);
              pdfBlob = await response.blob();
            } catch (error) {
              console.error('获取PDF文件失败:', error);
            }
          }
        } else if (
          (fileUrl as any) instanceof Blob ||
          (fileUrl as any) instanceof File
        ) {
          // 如果已经是Blob或File对象，直接使用
          pdfBlob = fileUrl as Blob;
        }

        // 保存批注数据和PDF文件
        onSave(annotations, pdfBlob);
      }
      message.success('批注已保存');
    } catch (error) {
      message.error('保存批注失败');
    }
  };

  // 处理页面直接跳转
  const handlePageChange = (pageNumber: number) => {
    // 当页面改变时，清除DOM中的高亮元素
    if (pdfLayerRef.current) {
      // 更彻底地清理所有高亮相关元素
      clearAllHighlights();
    }

    setCurrentPage(pageNumber);
  };

  // 翻页也需要清理高亮
  const changePage = (offset: number) => {
    // 新页面
    const newPageNumber = Math.min(Math.max(currentPage + offset, 1), numPages);

    if (newPageNumber === currentPage) {
      return; // 如果页码未变，不执行任何操作
    }

    // 清除现有高亮，与上面相同的逻辑
    if (pdfLayerRef.current) {
      // 使用同一个清理函数，确保一致性
      clearAllHighlights();
    }

    setCurrentPage(newPageNumber);
  };

  // 缩放
  const zoomIn = () => setScale(scale * 1.2);
  const zoomOut = () => setScale(scale / 1.2);

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  /**
   * 下载原始PDF文件（不含批注）
   */
  const downloadOriginalPdf = async () => {
    try {
      let pdfBlob: Blob | null = null;
      let downloadFileName = fileName || 'document.pdf';

      // 根据fileUrl类型获取或转换为Blob
      if (typeof fileUrl === 'string') {
        // 处理base64
        if (fileUrl.startsWith('data:')) {
          const base64Data = fileUrl.split(',')[1];
          const binary = atob(base64Data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          pdfBlob = new Blob([array], { type: 'application/pdf' });
        } else if (fileUrl.startsWith('http')) {
          // 处理网络URL
          try {
            const response = await fetch(fileUrl);
            pdfBlob = await response.blob();

            // 从URL中提取文件名
            if (!fileName) {
              const urlParts = fileUrl.split('/');
              const lastPart = urlParts[urlParts.length - 1];
              if (lastPart && lastPart.includes('.pdf')) {
                downloadFileName = lastPart;
              }
            }
          } catch (error) {
            console.error('获取PDF文件失败:', error);
            message.error({
              content: '下载失败：无法获取文件',
              key: 'downloadLoading',
            });
            return;
          }
        }
      } else if ((fileUrl as any) instanceof Blob) {
        pdfBlob = fileUrl as Blob;
      } else if ((fileUrl as any) instanceof File) {
        pdfBlob = new Blob([fileUrl as File], { type: (fileUrl as File).type });
        if (!fileName) {
          downloadFileName = (fileUrl as File).name;
        }
      }

      if (!pdfBlob) {
        message.error({
          content: '下载失败：无效的文件格式',
          key: 'downloadLoading',
        });
        return;
      }

      // 创建下载链接
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        message.success({ content: '下载成功', key: 'downloadLoading' });
      }, 100);
    } catch (error) {
      console.error('下载原始PDF失败:', error);
      message.error({ content: '下载过程中发生错误', key: 'downloadLoading' });
    }
  };

  /**
   * 捕获所有PDF页面
   * @param progressKey 进度消息的key
   * @param onComplete 捕获完成后的回调函数，接收捕获的所有页面Canvas数组
   */
  const captureAllPages = async (
    progressKey: 'printLoading' | 'downloadLoading',
    onComplete: (pageImages: HTMLCanvasElement[]) => Promise<void>,
  ): Promise<void> => {
    try {
      // 显示加载提示
      message.loading({ content: '准备处理PDF页面...', key: progressKey });

      if (!pdfLayerRef.current) {
        message.error({ content: '无法获取PDF内容', key: progressKey });
        return;
      }

      // 存储当前页码
      const originalPage = currentPage;

      // 显示处理遮罩层
      setIsPrinting(true);
      setPrintProgress('准备中...');

      try {
        // 动态加载html2canvas
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;

        // 创建一个数组存储所有页面的图像数据
        const pageImages: HTMLCanvasElement[] = [];

        // 逐页捕获
        for (let i = 1; i <= numPages; i++) {
          // 更新进度提示
          const progressMsg = `正在处理第 ${i} 页 / 共 ${numPages} 页...`;
          setPrintProgress(progressMsg);

          // 切换到指定页面
          setCurrentPage(i);

          // 等待页面渲染完成
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });

          // 捕获当前页面
          const canvas = await html2canvas(pdfLayerRef.current as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            ignoreElements: (element: Element) => {
              return element.classList?.contains('print-ignore') || false;
            },
          });

          pageImages.push(canvas);
        }

        // 恢复原始页面
        setCurrentPage(originalPage);

        // 调用完成回调
        await onComplete(pageImages);
      } catch (error) {
        console.error('处理PDF页面失败:', error);
        message.error({ content: '处理PDF页面失败', key: progressKey });
      } finally {
        // 关闭遮罩层
        setIsPrinting(false);
      }
    } catch (error) {
      console.error('捕获页面错误:', error);
      message.error({ content: '处理过程中发生错误', key: progressKey });
      setIsPrinting(false);
    }
  };

  /**
   * 处理下载功能 - 下载带批注的PDF文件
   */
  const handleDownloadWithAnnotations = async () => {
    captureAllPages('downloadLoading', async (pageImages) => {
      try {
        // 使用jsPDF合并所有页面为一个PDF文件
        const jspdfModule = await import('jspdf');
        const jsPDF = jspdfModule.default;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [pageImages[0].width / 2, pageImages[0].height / 2],
        });

        // 添加所有页面到PDF
        for (let i = 0; i < pageImages.length; i++) {
          const canvas = pageImages[i];
          const imgData = canvas.toDataURL('image/jpeg', 0.85);

          // 第一页不需要新增页面
          if (i > 0) {
            pdf.addPage([canvas.width / 2, canvas.height / 2]);
          }

          pdf.addImage(
            imgData,
            'JPEG',
            0,
            0,
            canvas.width / 2,
            canvas.height / 2,
          );
        }

        // 下载PDF
        let downloadFileName = fileName || 'document-with-annotations.pdf';
        pdf.save(downloadFileName);

        message.success({ content: '下载成功', key: 'downloadLoading' });
      } catch (error) {
        console.error('生成批注PDF失败:', error);
        message.error({ content: '生成批注PDF失败', key: 'downloadLoading' });

        // 如果合并失败，退回到原始下载方法
        downloadOriginalPdf();
      }
    }).catch(() => {
      // 如果捕获失败，退回到原始下载方法
      downloadOriginalPdf();
    });
  };

  /**
   * 打印原始PDF文件（不含批注）
   * 直接使用iframe加载原始PDF进行打印
   */
  const printOriginalPdf = async () => {
    try {
      // 显示加载提示
      message.loading({ content: '准备打印中...', key: 'printLoading' });

      let pdfBlob: Blob | null = null;

      // 获取原始PDF的Blob对象
      if (typeof fileUrl === 'string') {
        if (fileUrl.startsWith('data:')) {
          const base64Data = fileUrl.split(',')[1];
          const binary = atob(base64Data);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          pdfBlob = new Blob([array], { type: 'application/pdf' });
        } else if (fileUrl.startsWith('http')) {
          try {
            const response = await fetch(fileUrl);
            pdfBlob = await response.blob();
          } catch (error) {
            console.error('获取PDF文件失败:', error);
            message.error({
              content: '打印失败：无法获取文件',
              key: 'printLoading',
            });
            return;
          }
        }
      } else if ((fileUrl as any) instanceof Blob) {
        pdfBlob = fileUrl as Blob;
      } else if ((fileUrl as any) instanceof File) {
        pdfBlob = new Blob([fileUrl as File], { type: (fileUrl as File).type });
      }

      if (!pdfBlob) {
        message.error({
          content: '打印失败：无效的文件格式',
          key: 'printLoading',
        });
        return;
      }

      // 创建一个URL对象来表示PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // 创建一个iframe用于打印
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = '0';
      printIframe.style.left = '-1000px';

      // 添加iframe到文档
      document.body.appendChild(printIframe);

      // 获取当前时间戳，用于监测打印对话框关闭
      const startTime = Date.now();

      // 标记打印状态
      let isPrintDialogOpen = false;
      let printCompleted = false;

      // 监测打印对话框状态的函数
      const checkPrintStatus = () => {
        // 如果打印已完成，不再检查
        if (printCompleted) return;

        try {
          // 如果iframe已被移除，说明操作已完成
          if (!document.body.contains(printIframe)) {
            printCompleted = true;
            URL.revokeObjectURL(pdfUrl);
            message.success({ content: '打印操作已完成', key: 'printLoading' });
            return;
          }

          // 如果打印对话框曾经打开过且当前时间距开始打印已超过1秒，
          // 但焦点已回到主窗口，则认为打印对话框已关闭
          if (
            isPrintDialogOpen &&
            document.hasFocus() &&
            Date.now() - startTime > 1000
          ) {
            printCompleted = true;

            // 清理资源
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            URL.revokeObjectURL(pdfUrl);

            // 通知用户
            message.success({ content: '打印操作已完成', key: 'printLoading' });
            return;
          }

          // 继续检查
          setTimeout(checkPrintStatus, 3000);
        } catch (error) {
          console.error('检查打印状态失败:', error);
          // 出错时也要清理资源
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
          URL.revokeObjectURL(pdfUrl);
        }
      };

      // 设置iframe源并添加加载事件
      printIframe.onload = () => {
        // 显示加载成功消息
        message.success({
          content: '文档已准备好，正在打开打印对话框...',
          key: 'printLoading',
          duration: 2,
        });

        setTimeout(() => {
          try {
            // 尝试触发打印
            if (printIframe.contentWindow) {
              printIframe.contentWindow.focus();
              printIframe.contentWindow.print();
              isPrintDialogOpen = true;

              // 开始监测打印状态
              setTimeout(checkPrintStatus, 1000);
            } else {
              // 如果contentWindow不存在，清理资源
              message.error({
                content: '打印失败: 无法访问打印窗口',
                key: 'printLoading',
              });
              if (document.body.contains(printIframe)) {
                document.body.removeChild(printIframe);
              }
              URL.revokeObjectURL(pdfUrl);
            }
          } catch (error) {
            console.error('打印失败:', error);
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            URL.revokeObjectURL(pdfUrl);
            message.error({ content: '打印失败', key: 'printLoading' });
          }
        }, 800);
      };

      // 设置iframe源
      printIframe.src = pdfUrl;
    } catch (error) {
      console.error('准备打印内容失败:', error);
      message.error({ content: '打印准备失败', key: 'printLoading' });
    }
  };

  /**
   * 处理打印功能 - 打印所有页面
   * 要使用html2canvas一页一页的捕获，是因为批注的图层是分层的，如果使用canvas捕获，会导致批注图层被覆盖
   * 所以为了能打印出批注，只能一页一页的捕获
   */
  const handlePrint = (printType: 'original' | 'with-annotations') => {
    // 打印原始PDF
    if (printType === 'original') {
      printOriginalPdf();
      return;
    }

    // 打印带批注的PDF
    const printIframe = document.createElement('iframe'); // 创建iframe元素
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = '0';
    printIframe.style.left = '-1000px';

    // 添加到文档中
    document.body.appendChild(printIframe);

    // 获取iframe的文档对象
    const frameDoc = printIframe.contentWindow?.document;
    if (!frameDoc) {
      document.body.removeChild(printIframe);
      message.error('创建打印框架失败');
      return;
    }

    // 写入iframe基本结构
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF打印</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .print-container {
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            .page-container {
              page-break-after: always;
              margin: 0;
              padding: 0;
              border: none;
            }
            .page-container:last-child {
              page-break-after: avoid;
              margin: 0;
            }
            img {
              max-width: 100%;
              display: block;
              margin: 0;
              padding: 0;
              box-shadow: none;
              border: none;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .print-container {
                margin: 0;
                padding: 0;
              }
              .page-container {
                width: 100%;
                height: auto;
                page-break-after: always;
                margin: 0;
                padding: 0;
                border: none;
              }
              @page {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container" id="print-container">
            <!-- 页面内容将动态插入这里 -->
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    const printContainer = frameDoc.getElementById('print-container');
    if (!printContainer) {
      document.body.removeChild(printIframe);
      message.error('准备打印内容失败');
      return;
    }

    // 捕获所有页面并处理打印
    captureAllPages('printLoading', async (pageImages) => {
      try {
        // 为每个捕获的页面创建打印元素
        pageImages.forEach((canvas) => {
          // 创建页面容器
          const pageContainer = frameDoc.createElement('div');
          pageContainer.className = 'page-container';

          // 将canvas转换为图像
          const img = frameDoc.createElement('img');
          img.src = canvas.toDataURL('image/png');
          pageContainer.appendChild(img);

          // 添加到打印容器
          printContainer.appendChild(pageContainer);
        });

        message.success({
          content: '打印准备完成',
          key: 'printLoading',
          duration: 1,
        });

        // 短暂延迟后打印
        setTimeout(() => {
          try {
            // 调用iframe的打印功能
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();

            // 打印对话框关闭后移除iframe
            setTimeout(() => {
              if (document.body.contains(printIframe)) {
                document.body.removeChild(printIframe);
              }
            }, 1000);
          } catch (error) {
            console.error('打印调用失败:', error);
            document.body.removeChild(printIframe);
            message.error('打印调用失败');
          }
        }, 500);
      } catch (error) {
        console.error('准备打印内容失败:', error);
        document.body.removeChild(printIframe);
        message.error('准备打印内容失败');
      }
    });
  };

  /**
   * 取消打印或下载操作
   */
  const handleCancelOperation = () => {
    setIsPrinting(false);
    setPrintProgress('');
    message.info('操作已取消');
  };

  /**
   * 处理下载按钮点击 - 显示选择弹窗
   */
  const handleDownloadPrintClick = (type: 'print' | 'download') => {
    Modal.info({
      title: type === 'print' ? '选择打印类型' : '选择下载类型',
      icon: null,
      centered: true,
      okText: '取消',
      content: (
        <div
          className="download-options"
          style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
        >
          {/* 有批注数据 显示 */}
          {annotations?.length ? (
            <Button
              type="primary"
              style={{ marginRight: 16, height: 60, fontSize: 16, width: 180 }}
              onClick={() => {
                Modal.destroyAll();
                // 打印
                if (type === 'print') {
                  handlePrint('with-annotations');
                  return;
                }
                // 下载带批注pdf
                handleDownloadWithAnnotations();
              }}
            >
              <div>
                <div>{`${type === 'print' ? '打印' : '下载'}带批注的PDF`}</div>
                <div style={{ fontSize: 12 }}>(包含所有批注标记)</div>
              </div>
            </Button>
          ) : null}

          <Button
            type="primary"
            style={{ height: 60, fontSize: 16, width: 180 }}
            onClick={() => {
              Modal.destroyAll();
              if (type === 'print') {
                handlePrint('original');
                return;
              }
              // 下载原始PDF
              downloadOriginalPdf();
            }}
          >
            <div>
              <div>{`${type === 'print' ? '打印' : '下载'}原始PDF`}</div>
              <div style={{ fontSize: 12 }}>(不含批注)</div>
            </div>
          </Button>
        </div>
      ),
      width: 500,
    });
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

  return (
    <div
      className={`pdf-annotation-container ${className}`}
      style={style}
      ref={containerRef}
    >
      {/* 打印 和 下载有批注的pdf 过程中的遮罩层 */}
      {isPrinting && (
        <div className="pdf-print-mask">
          <div className="print-message">
            正在处理PDF文件，请勿关闭或操作页面
          </div>
          <div className="print-progress">{printProgress}</div>
          <Button
            style={{ marginTop: 20 }}
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleCancelOperation}
          >
            终止操作
          </Button>
        </div>
      )}

      {/* 头部操作: 缩放｜保存 */}
      <div className="pdf-annotation-header">
        <div className="pdf-annotation-actions">
          <div className="pdf-annotation-actions-sidebar">
            <Button
              type="text"
              icon={
                sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
              }
              onClick={toggleSidebar}
            />
          </div>
          <div className="pdf-annotation-actions-zoom">
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
            <span style={{ margin: '0 8px' }}>{Math.round(scale * 100)}%</span>
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          </div>

          <div className="pdf-annotation-actions-page">
            <Button
              icon={<LeftOutlined />}
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
            />
            <span
              style={{ margin: '0 8px' }}
            >{`${currentPage} / ${numPages}`}</span>
            <Button
              icon={<RightOutlined />}
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
            />
          </div>
          {!readOnly && (
            <div className="pdf-annotation-actions-save">
              {/* 保存 */}
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSaveAnnotations}
              />

              {/* 下载 */}
              <Button
                style={{ marginLeft: 8 }}
                icon={<DownloadOutlined />}
                type="primary"
                onClick={() => handleDownloadPrintClick('download')}
              />

              {/* 打印 */}
              <Button
                style={{ marginLeft: 8 }}
                icon={<PrinterOutlined />}
                type="primary"
                onClick={() => handleDownloadPrintClick('print')}
              />
            </div>
          )}
        </div>
      </div>

      {/* 工具栏 */}
      {!readOnly && (
        <div className="pdf-annotation-toolbar-row">
          <AnnotationToolbar
            activeTool={activeTool} // 当前选中的工具
            activeColor={activeColor} // 当前选中的颜色
            activeLineStyle={activeLineStyle} // 当前选中的线型
            onToolSelect={handleToolSelect} // 工具选择
            onColorChange={setActiveColor} // 颜色选择
            onLineStyleChange={handleLineStyleChange} // 线型选择
            readOnly={readOnly} // 是否只读
          />
        </div>
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
                    pdfLayerRef={pdfLayerRef}
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

        <div className="pdf-annotation-main">
          <div className="pdf-viewer" ref={pdfLayerRef}>
            <Document
              file={fileUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={<div className="pdf-loading">加载中...</div>}
              error={<div className="pdf-error">加载PDF失败</div>}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                onLoadSuccess={handlePageLoadSuccess}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                inputRef={pageRef}
              />
            </Document>

            {/* 批注图层 */}
            {!loading && pdfDimensions.width > 0 && (
              <>
                {/* 文本批注图层：高亮 / 删除线 / 下划线 - 使用web-highlighter插件实现 */}
                <HighlighterLayer
                  pageNumber={currentPage}
                  scale={scale}
                  activeTool={
                    ['highlight', 'strikethrough', 'underline'].includes(
                      activeTool as string,
                    )
                      ? (activeTool as
                          | 'highlight'
                          | 'strikethrough'
                          | 'underline')
                      : null
                  }
                  activeColor={activeColor}
                  pdfLayerRef={pdfLayerRef}
                  annotations={annotations.filter(
                    (a) => a.pageNumber === currentPage,
                  )}
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

                {/* 其他批注图层 - 形状、自由绘制、自由高亮、签名、盖章 */}
                <AnnotationLayer
                  pageNumber={currentPage}
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
                  annotations={annotations.filter(
                    (a) => a.pageNumber === currentPage,
                  )}
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
              </>
            )}
          </div>
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
