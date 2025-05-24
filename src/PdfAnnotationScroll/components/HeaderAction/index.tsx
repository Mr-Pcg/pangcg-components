import {
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PrinterOutlined,
  SaveOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Divider, message, Modal } from 'antd';
import React, { useState } from 'react';
import { Annotation } from '../../types';
import './index.less';

export interface HeaderActionProps {
  fileUrl: string | File | Blob;
  fileName?: string;
  annotations: Annotation[];
  currentPage: number;
  numPages: number;
  scale: number;
  readOnly?: boolean;
  pdfLayerRef: any;
  sidebarVisible: boolean;
  toggleSidebar: (flag: boolean) => void;
  setCurrentPage: (pageNum: number) => void;
  zoomOut: () => void;
  zoomIn: () => void;
  onSave?: (annotations: Annotation[], updatedPdf?: Blob | File) => void;
}

const HeaderAction: React.FC<HeaderActionProps> = ({
  fileUrl,
  fileName,
  annotations,
  currentPage,
  numPages,
  scale,
  sidebarVisible,
  readOnly,
  pdfLayerRef,
  toggleSidebar,
  setCurrentPage,
  zoomOut,
  zoomIn,
  onSave,
}) => {
  // 添加状态
  const [isPrinting, setIsPrinting] = useState<boolean>(false); // 打印状态
  const [printProgress, setPrintProgress] = useState<string>(''); // 打印进度

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
              console.log('获取PDF文件失败:', error);
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

      // 获取PDF容器 - 使用querySelector直接获取
      const mainContainer = document.querySelector('.pdf-annotation-main');
      const pdfContainer = mainContainer
        ? (mainContainer as HTMLElement)
        : null;
      const originalScrollTop = pdfContainer?.scrollTop || 0; //

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

          // 切换到当前页面并等待渲染
          setCurrentPage(i);
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });

          try {
            // 获取当前页面的容器 - 使用i-1作为页面索引
            const pageContainers = document.querySelectorAll(
              '.pdf-page-container',
            );
            if (
              !pageContainers ||
              pageContainers.length === 0 ||
              !pageContainers[i - 1]
            ) {
              console.log(`无法找到第 ${i} 页的容器`);
              continue;
            }
            const pageContainer = pageContainers[i - 1] as HTMLElement;

            // 获取PDF页面元素
            const pdfPage = pageContainer.querySelector(
              '.react-pdf__Page',
            ) as HTMLElement;
            if (!pdfPage) {
              console.log(`无法找到第 ${i} 页的PDF页面元素`);
              continue;
            }

            // 获取PDF画布和容器
            const pdfCanvas = pdfPage.querySelector('canvas');
            if (!pdfCanvas) {
              console.log(`第 ${i} 页的PDF画布未找到`);
              continue;
            }

            // 获取批注层
            const annotationLayer = pdfLayerRef.current[i];
            if (!annotationLayer) {
              console.log(`第 ${i} 页的批注层未找到`);
            }

            // 创建一个新的canvas来合并内容
            const mergedCanvas = document.createElement('canvas');
            mergedCanvas.width = pdfCanvas.width;
            mergedCanvas.height = pdfCanvas.height;
            const ctx = mergedCanvas.getContext('2d');

            if (!ctx) {
              console.error('无法创建canvas上下文');
              continue;
            }

            // 1. 首先绘制PDF内容
            ctx.drawImage(pdfCanvas, 0, 0);

            // 2. 如果有批注层，将其绘制到canvas上
            if (annotationLayer) {
              // 使用html2canvas仅捕获批注层
              const annotationCanvas = await html2canvas(annotationLayer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: true,
              });

              // 将批注层绘制到合并的canvas上
              ctx.drawImage(
                annotationCanvas,
                0,
                0,
                mergedCanvas.width,
                mergedCanvas.height,
              );
            }

            // 将合并后的canvas添加到结果数组
            pageImages.push(mergedCanvas);
          } catch (error) {
            console.log(`捕获第 ${i} 页时出错:`, error);
            continue;
          }

          // 额外等待以确保资源释放
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 500);
          });
        }

        // 恢复原始页面和滚动位置
        setCurrentPage(originalPage);
        if (pdfContainer) {
          pdfContainer.scrollTop = originalScrollTop;
        }

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
      console.error('处理过程中发生错误:', error);
      message.error({ content: '处理过程中发生错误', key: progressKey });
      setIsPrinting(false);
    }
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

    message.loading({ content: '准备打印内容...', key: 'printLoading' });

    // 打印带批注的PDF
    const printIframe = document.createElement('iframe'); // 创建iframe元素
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = '0';
    printIframe.style.left = '-1000px';
    printIframe.style.display = 'none'; // 完全隐藏iframe

    // 添加到文档中
    document.body.appendChild(printIframe);

    // 获取iframe的文档对象
    const frameDoc = printIframe.contentWindow?.document;
    if (!frameDoc) {
      document.body.removeChild(printIframe);
      message.error({ content: '创建打印框架失败', key: 'printLoading' });
      return;
    }

    // 写入iframe基本结构
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName || 'PDF打印'}</title>
          <meta charset="utf-8">
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
              width: 100%;
              box-sizing: border-box;
            }
            .page-container:last-child {
              page-break-after: avoid;
              margin: 0;
            }
            img {
              max-width: 100%;
              display: block;
              width: 100%;
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
                margin: 0.5cm;
                size: auto;
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
      message.error({ content: '准备打印内容失败', key: 'printLoading' });
      return;
    }

    // 捕获所有页面并处理打印
    captureAllPages('printLoading', async (pageImages) => {
      try {
        if (pageImages.length === 0) {
          message.error({ content: '无法捕获PDF页面', key: 'printLoading' });
          document.body.removeChild(printIframe);
          return;
        }

        // 为每个捕获的页面创建打印元素
        pageImages.forEach((canvas, index) => {
          // 创建页面容器
          const pageContainer = frameDoc.createElement('div');
          pageContainer.className = 'page-container';
          pageContainer.style.margin = '0 auto';

          // 将canvas转换为图像
          const img = frameDoc.createElement('img');
          img.src = canvas.toDataURL('image/png', 0.95);
          img.style.width = '100%';
          img.style.maxWidth = '100%';
          img.alt = `页面 ${index + 1}`;

          // 添加到页面容器
          pageContainer.appendChild(img);

          // 添加到打印容器
          printContainer.appendChild(pageContainer);
        });

        message.success({
          content: '打印准备完成，正在打开打印对话框...',
          key: 'printLoading',
          duration: 1,
        });

        // 短暂延迟后打印
        setTimeout(() => {
          try {
            // 调用iframe的打印功能
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();

            // 监听打印对话框关闭
            const checkPrintStatus = () => {
              if (document.body.contains(printIframe)) {
                setTimeout(() => {
                  // 假设3秒后打印对话框已关闭
                  if (document.body.contains(printIframe)) {
                    document.body.removeChild(printIframe);
                  }
                }, 3000);
              }
            };

            // 打印完成或取消后，移除iframe
            if (printIframe.contentWindow) {
              if (printIframe.contentWindow.matchMedia) {
                const mediaQueryList =
                  printIframe.contentWindow.matchMedia('print');
                mediaQueryList.addEventListener('change', (mql) => {
                  if (!mql.matches && document.body.contains(printIframe)) {
                    // 打印对话框已关闭
                    document.body.removeChild(printIframe);
                  }
                });
              } else {
                // 不支持matchMedia的情况
                checkPrintStatus();
              }
            } else {
              checkPrintStatus();
            }
          } catch (error) {
            console.error('打印调用失败:', error);
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            message.error({ content: '打印调用失败', key: 'printLoading' });
          }
        }, 500);
      } catch (error) {
        console.error('准备打印内容失败:', error);
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
        message.error({ content: '准备打印内容失败', key: 'printLoading' });
      }
    });
  };

  /**
   *  下载带批注的PDF文件
   */
  const handleDownloadWithAnnotations = async () => {
    message.loading({ content: '正在准备下载...', key: 'downloadLoading' });
    captureAllPages('downloadLoading', async (pageImages) => {
      try {
        if (pageImages.length === 0) {
          message.error({ content: '无法捕获PDF页面', key: 'downloadLoading' });
          return;
        }

        // 使用jsPDF合并所有页面为一个PDF文件
        const jspdfModule = await import('jspdf');
        const jsPDF = jspdfModule.default;

        // 获取第一页的尺寸作为基准
        const firstPage = pageImages[0];
        const pageWidth = firstPage.width;
        const pageHeight = firstPage.height;

        // 确定PDF方向 (portrait 或 landscape)
        const orientation = pageWidth > pageHeight ? 'landscape' : 'portrait';

        // 创建PDF文档，使用实际尺寸，设置精度和压缩
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [pageWidth, pageHeight],
          compress: true,
          hotfixes: ['px_scaling'],
          putOnlyUsedFonts: true,
          floatPrecision: 'smart',
        });

        // 压缩质量参数 - 调整以平衡文件大小和质量
        const imageQuality = 0.8; // 降低质量以减小文件大小
        const imageFormat = 'JPEG'; // 使用JPEG格式以获得更小的文件大小

        // 添加所有页面到PDF
        for (let i = 0; i < pageImages.length; i++) {
          const canvas = pageImages[i];
          // 转换为图像数据
          const imgData = canvas.toDataURL(
            `image/${imageFormat.toLowerCase()}`,
            imageQuality,
          );

          // 第一页不需要新增页面
          if (i > 0) {
            pdf.addPage([pageWidth, pageHeight]);
          }

          // 添加图像，使用完整尺寸
          pdf.addImage(
            imgData,
            imageFormat,
            0,
            0,
            pageWidth,
            pageHeight,
            `page-${i + 1}`,
            'FAST',
          );

          // 显示进度
          message.loading({
            content: `正在处理第 ${i + 1} 页，共 ${pageImages.length} 页...`,
            key: 'downloadLoading',
          });
        }

        // 下载PDF
        let downloadFileName = fileName || 'document-with-annotations.pdf';
        // 确保文件名以.pdf结尾
        if (!downloadFileName.toLowerCase().endsWith('.pdf')) {
          downloadFileName += '.pdf';
        }

        try {
          pdf.save(downloadFileName);
          message.success({ content: '下载成功', key: 'downloadLoading' });
        } catch (error) {
          console.error('保存PDF文件失败:', error);
          message.error({ content: '保存PDF文件失败', key: 'downloadLoading' });
        }
      } catch (error) {
        console.error('生成批注PDF失败:', error);
        message.error({ content: '生成批注PDF失败', key: 'downloadLoading' });
      }
    }).catch((error: any) => {
      console.error('捕获PDF失败:', error);
      message.error({ content: '捕获PDF失败', key: 'downloadLoading' });
    });
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
   * 下载 ｜ 打印 - 显示选择弹窗
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

  return (
    <>
      {/* 打印 和 下载有批注的pdf 过程中的遮罩层 */}
      {isPrinting && (
        <div className="pdf-print-mask">
          <div className="print-message">
            正在处理PDF文件，请勿关闭或操作页面
          </div>
          <div className="print-progress">{printProgress}</div>
        </div>
      )}
      <div className="pdf-annotation-header">
        <div className="pdf-annotation-actions">
          <div
            className="pdf-annotation-actions-sidebar"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleSidebar(!sidebarVisible)}
          >
            {sidebarVisible ? (
              <MenuFoldOutlined className="actions-sidebar-menu" />
            ) : (
              <MenuUnfoldOutlined className="actions-sidebar-menu" />
            )}
          </div>
          <div className="pdf-annotation-actions-option">
            <div className="pdf-annotation-actions-page">
              {`${currentPage} / ${numPages}`}
            </div>
            <Divider
              type="vertical"
              className="pdf-annotation-actions-divider"
            />
            <div className="pdf-annotation-actions-zoom">
              <Button
                type="text"
                icon={<ZoomOutOutlined />}
                onClick={zoomOut}
              />
              <span style={{ margin: '0 8px' }}>
                {Math.round(scale * 100)}%
              </span>
              <Button type="text" icon={<ZoomInOutlined />} onClick={zoomIn} />
            </div>
          </div>
          <div className="pdf-annotation-actions-save">
            {/* 保存 */}
            {!readOnly ? (
              <Button
                icon={<SaveOutlined />}
                type="text"
                onClick={handleSaveAnnotations}
              />
            ) : null}

            {/* 下载 */}
            <Button
              style={{ marginLeft: 8 }}
              icon={<DownloadOutlined />}
              type="text"
              onClick={() => handleDownloadPrintClick('download')}
            />

            {/* 打印 */}
            <Button
              style={{ marginLeft: 8 }}
              icon={<PrinterOutlined />}
              type="text"
              onClick={() => handleDownloadPrintClick('print')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderAction;
