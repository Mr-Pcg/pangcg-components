import { Button, message, Spin } from 'antd';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { v4 as uuidv4 } from 'uuid';
import AnnotationLayer from './components/AnnotationLayer';
import SideMenu from './components/SideMenu';
import Toolbar from './components/ToolBar';
import { useAnnotations } from './hooks/useAnnotations';
import './index.less';
import type {
  Annotation,
  AnnotationTool,
  PdfAnnotationExtensionProps,
} from './types';

// 设置PDF.js worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const PdfAnnotationExtension: React.FC<PdfAnnotationExtensionProps> = ({
  fileUrl,
  fileName = '文档',
  className = '',
  style = {},
  initialAnnotations = [],
  onSave,
}) => {
  // 状态管理
  const [numPages, setNumPages] = useState<number>(0); // 页码
  const [pageNumber, setPageNumber] = useState<number>(1); // 当前页码
  const [scale, setScale] = useState<number>(1.0); // 缩放比例
  const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
  const [lineType, setLineType] = useState<'line' | 'dashed'>('line'); // 线条类型
  const [currentTool, setCurrentTool] = useState<AnnotationTool>(
    '' as AnnotationTool,
  ); // 当前工具
  const [strokeColor, setStrokeColor] = useState<string>('#FF0000'); // 颜色
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(true); // 侧边菜单可见性

  // 签名相关状态
  const [isDrawingSignature, setIsDrawingSignature] = useState<boolean>(false);
  const [signatureLastPoint, setSignatureLastPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 使用自定义hook管理注释
  const {
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    getAnnotationsByPage,
    addAnnotations,
  } = useAnnotations(initialAnnotations);

  // 引用
  const containerRef = useRef<HTMLDivElement>(null); // 容器引用
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]); // 页面引用
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null); // 签名画布引用

  // 批注创建相关状态
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null,
  );

  // 当工具改变时的处理
  useEffect(() => {
    // 清除之前的签名画布状态
    if (currentTool !== 'signature' && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // 重置批注创建状态
    setIsCreatingAnnotation(false);
    setStartPoint(null);
    setCurrentAnnotation(null);

    // 根据当前工具更新页面的类名
    pagesRef.current?.forEach((pageRef) => {
      if (pageRef) {
        // 始终设置active-annotation-layer类，确保注释层可接收鼠标事件
        // 除非当前工具是签名工具，因为签名有自己的交互界面
        if (currentTool !== 'signature') {
          pageRef.className = 'pdf-page-wrapper active-annotation-layer';
        } else {
          pageRef.className = 'pdf-page-wrapper';
        }
      }
    });

    console.log('当前工具已更新为:', currentTool);
  }, [currentTool]);

  // 创建测试批注
  const createTestAnnotations = () => {
    console.log('创建测试批注');

    // 为每个页面添加测试批注
    const testAnnotations: Annotation[] = [];

    // 页面1的矩形批注
    testAnnotations.push({
      id: 'test-rect-' + uuidv4(),
      type: 'rectangle',
      pageNumber: 1,
      position: { x: 100, y: 100, width: 200, height: 100 },
      style: {
        strokeColor: '#FF0000',
        fillColor: 'rgba(255, 0, 0, 0.2)',
        opacity: 1,
        lineWidth: 3,
      },
      createdAt: Date.now(),
    });

    // 页面1的文本批注
    testAnnotations.push({
      id: 'test-text-' + uuidv4(),
      type: 'text',
      pageNumber: 1,
      position: { x: 150, y: 250, width: 200, height: 80 },
      text: '这是一个测试文本批注',
      style: {
        strokeColor: '#0000FF',
        fillColor: 'rgba(255, 255, 255, 0.9)',
        opacity: 1,
        lineWidth: 1,
        fontSize: 16,
      },
      createdAt: Date.now(),
    });

    // 页面1的圆形批注
    testAnnotations.push({
      id: 'test-circle-' + uuidv4(),
      type: 'circle',
      pageNumber: 1,
      position: { x: 400, y: 300, width: 100, height: 100 },
      style: {
        strokeColor: '#00FF00',
        fillColor: 'rgba(0, 255, 0, 0.2)',
        opacity: 1,
        lineWidth: 2,
      },
      createdAt: Date.now(),
    });

    // 高亮批注
    testAnnotations.push({
      id: 'test-highlight-' + uuidv4(),
      type: 'highlight',
      pageNumber: 1,
      position: { x: 250, y: 400, width: 300, height: 30 },
      text: '高亮文本示例',
      style: {
        strokeColor: '#000000',
        fillColor: '#FFFF00',
        opacity: 0.5,
        lineWidth: 1,
      },
      createdAt: Date.now(),
    });

    // 批量添加测试批注
    addAnnotations(testAnnotations);
  };

  // 文档加载成功
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);

    // 测试：直接添加批注
    setTimeout(() => {
      createTestAnnotations();
    }, 1000);
  };

  // 处理签名绘制开始
  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'signature' || !signatureCanvasRef.current) return;

    setIsDrawingSignature(true);
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSignatureLastPoint({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2; // 固定线宽
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  // 处理签名绘制过程
  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !isDrawingSignature ||
      !signatureLastPoint ||
      !signatureCanvasRef.current
    )
      return;

    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(signatureLastPoint.x, signatureLastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setSignatureLastPoint({ x, y });
  };

  // 处理签名绘制结束
  const handleSignatureEnd = () => {
    if (!isDrawingSignature || !signatureCanvasRef.current) return;

    setIsDrawingSignature(false);
    setSignatureLastPoint(null);
  };

  // 清除签名
  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // 完成签名并添加到PDF
  const completeSignature = () => {
    if (!signatureCanvasRef.current) return;

    const canvas = signatureCanvasRef.current;
    // 检查画布是否为空
    const ctx = canvas.getContext('2d');
    const pixelData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
    const isCanvasBlank = !pixelData?.some((channel) => channel !== 0);

    if (isCanvasBlank) {
      message.error('请先绘制签名');
      return;
    }

    // 获取签名图像数据
    const dataUrl = canvas.toDataURL('image/png');

    // 创建一个图像对象来获取尺寸
    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      // 根据图像尺寸创建批注
      const aspectRatio = img.width / img.height;
      const width = 200; // 默认宽度
      const height = width / aspectRatio;

      // 添加到中心位置
      const pageWidth = pagesRef.current[pageNumber - 1]?.clientWidth || 600;
      const pageHeight = pagesRef.current[pageNumber - 1]?.clientHeight || 800;

      const x = (pageWidth / scale - width) / 2;
      const y = (pageHeight / scale - height) / 2;

      const annotation: Annotation = {
        id: 'add-' + uuidv4(),
        type: 'signature',
        pageNumber: pageNumber,
        position: { x, y, width, height },
        style: {
          strokeColor: strokeColor,
          fillColor: '#FFFF00',
          opacity: 0.5,
          lineWidth: 2,
        },
        text: dataUrl, // 将dataUrl存储在text字段
        createdAt: Date.now(),
      };

      addAnnotation(annotation);
      clearSignature();
      setCurrentTool('' as AnnotationTool); // 返回选择工具
    };
  };

  // 处理盖章
  const handleStamp = () => {
    // 创建一个简单的盖章图案 - 在实际应用中，这可以是一个预设的图像或用户上传的图像
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 绘制红色圆形印章
      ctx.beginPath();
      ctx.arc(100, 100, 90, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      // 添加文字
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('企业印章', 100, 100);
      ctx.font = 'bold 20px Arial';
      ctx.fillText(new Date().toLocaleDateString(), 100, 140);
    }

    const dataUrl = canvas.toDataURL('image/png');

    // 创建印章注释
    const width = 150;
    const height = 150;

    // 添加到中心位置
    const pageWidth = pagesRef.current[pageNumber - 1]?.clientWidth || 600;
    const pageHeight = pagesRef.current[pageNumber - 1]?.clientHeight || 800;

    const x = (pageWidth / scale - width) / 2;
    const y = (pageHeight / scale - height) / 2;

    const annotation: Annotation = {
      id: 'add-' + uuidv4(),
      type: 'stamp',
      pageNumber: pageNumber,
      position: { x, y, width, height },
      style: {
        strokeColor: strokeColor,
        fillColor: '#FFFF00',
        opacity: 0.5,
        lineWidth: 2,
      },
      text: dataUrl,
      createdAt: Date.now(),
    };

    addAnnotation(annotation);
    setCurrentTool('' as AnnotationTool); // 返回选择工具
  };

  // 工具切换处理
  const handleToolChange = (tool: AnnotationTool) => {
    console.log('工具切换', {
      currentTool,
      newTool: tool,
      isChangingTool: tool !== currentTool,
    });

    // 如果已经选择了这个工具，则取消选择
    if (tool === currentTool) {
      setCurrentTool('' as AnnotationTool);
      console.log('取消选择工具');
      return;
    }

    // 设置当前工具
    setCurrentTool(tool);
    console.log('当前工具切换为:', tool); // 添加日志以便调试

    // 测试直接添加批注
    if (tool === 'stamp') {
      handleStamp();
    }
  };

  // 线条类型变更处理
  const handleLineTypeChange = (type: 'line' | 'dashed') => {
    setLineType(type);
  };

  // 颜色变更处理
  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
  };

  // 菜单切换处理
  const handleMenuToggle = () => {
    setSideMenuVisible(!sideMenuVisible);
  };

  // 选择批注处理
  const handleAnnotationSelect = (annotationId: string) => {
    // 找到选中的批注
    const selectedAnnotation = annotations.find((a) => a.id === annotationId);
    if (selectedAnnotation) {
      // 切换到对应页面
      setPageNumber(selectedAnnotation.pageNumber);
      // 设置为选择工具
      setCurrentTool('' as AnnotationTool);
      // 这里可以进一步实现选中效果，例如高亮显示该批注
    }
  };

  // 保存PDF
  const handleSave = async () => {
    try {
      // 显示加载
      message.loading({ content: '正在保存PDF...', key: 'savePdf' });

      const pages = Array.from(document.querySelectorAll('.pdf-page-wrapper'));
      const pdf = new jsPDF('p', 'pt', 'a4');

      // 确保页面尺寸合适
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        // 使用html2canvas将页面转为canvas
        const canvas = await html2canvas(page, {
          scale: 2, // 更高分辨率
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        // 获取canvas数据
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // 调整尺寸以适应PDF页面
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 添加到PDF
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          'JPEG',
          0,
          0,
          imgWidth,
          Math.min(imgHeight, pageHeight),
        );
      }

      // 创建Blob对象
      const pdfBlob = pdf.output('blob');

      // 调用保存回调
      if (onSave) {
        onSave(annotations, pdfBlob);
      } else {
        // 默认下载
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${fileName || 'document'}_annotated.pdf`;
        link.click();
        URL.revokeObjectURL(pdfUrl);
      }

      message.success({ content: 'PDF已保存！', key: 'savePdf' });
    } catch (error) {
      console.error('保存PDF失败:', error);
      message.error({ content: '保存PDF失败，请重试', key: 'savePdf' });
    }
  };

  // 下载PDF
  const handleDownload = () => {
    handleSave();
  };

  // 打印PDF
  const handlePrint = () => {
    window.print();
  };

  // 处理批注更新
  const handleUpdateAnnotation = (updatedAnnotation: Annotation) => {
    console.log('更新批注', updatedAnnotation);
    updateAnnotation(updatedAnnotation.id, updatedAnnotation);
  };

  // 开始创建批注
  const handleAnnotationStart = (e: React.MouseEvent, pageNum: number) => {
    if (!currentTool) return;

    console.log('开始创建批注', {
      tool: currentTool,
      pageNum,
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.currentTarget,
    });

    // 直接在当前位置创建固定批注（用于测试）
    if (currentTool === 'rectangle') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      const testAnnotation: Annotation = {
        id: 'test-' + uuidv4(),
        type: 'rectangle',
        pageNumber: pageNum,
        position: {
          x: x,
          y: y,
          width: 150,
          height: 80,
        },
        style: {
          strokeColor: '#FF0000',
          fillColor: 'rgba(255, 0, 0, 0.2)',
          opacity: 1,
          lineWidth: 2,
        },
        createdAt: Date.now(),
      };
      addAnnotation(testAnnotation);
      console.log('直接添加点击位置测试批注', testAnnotation);

      // 自动切换回默认工具
      setCurrentTool('' as AnnotationTool);
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // 确保坐标准确
    console.log('批注起始位置', {
      clientX: e.clientX,
      clientY: e.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      x,
      y,
      scale,
    });

    setIsCreatingAnnotation(true);
    setStartPoint({ x, y });

    // 创建一个初始批注对象
    const newAnnotation: Annotation = {
      id: 'temp-' + uuidv4(),
      type: currentTool,
      pageNumber: pageNum,
      position: {
        x,
        y,
        width: 0,
        height: 0,
      },
      style: {
        strokeColor,
        fillColor:
          currentTool === 'highlight' ? '#FFFF00' : 'rgba(255, 0, 0, 0.2)',
        opacity: 0.5,
        lineWidth: 2,
      },
      createdAt: Date.now(),
    };

    setCurrentAnnotation(newAnnotation);
    console.log('创建批注对象', newAnnotation);
  };

  // 绘制批注
  const handleAnnotationMove = (e: React.MouseEvent) => {
    if (
      !isCreatingAnnotation ||
      !startPoint ||
      !currentAnnotation ||
      !currentAnnotation.position
    )
      return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    // 计算宽度和高度
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);

    // 计算左上角坐标（确保即使用户向任何方向拖动，都能正确绘制）
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);

    // 记录日志
    console.log('移动批注', {
      currentX,
      currentY,
      width,
      height,
      x,
      y,
    });

    // 更新当前批注
    const updatedAnnotation = {
      ...currentAnnotation,
      position: {
        x,
        y,
        width,
        height,
      },
    };

    setCurrentAnnotation(updatedAnnotation);
    console.log('更新临时批注', updatedAnnotation);
  };

  // 完成批注创建
  const handleAnnotationEnd = () => {
    if (!isCreatingAnnotation || !currentAnnotation) {
      console.log('结束批注 - 未创建批注或无当前批注');
      return;
    }

    console.log('完成批注创建', currentAnnotation);

    // 确保批注有最小尺寸
    if (
      !currentAnnotation.position?.width ||
      !currentAnnotation.position?.height ||
      currentAnnotation.position.width < 5 ||
      currentAnnotation.position.height < 5
    ) {
      // 批注太小，忽略
      console.log('批注尺寸太小，忽略', currentAnnotation);
      setIsCreatingAnnotation(false);
      setStartPoint(null);
      setCurrentAnnotation(null);
      return;
    }

    // 生成最终的批注ID和对象
    const finalAnnotation = {
      ...currentAnnotation,
      id: 'anno-' + uuidv4(),
    };

    // 添加批注
    addAnnotation(finalAnnotation);
    console.log('批注已添加到列表', finalAnnotation);

    // 重置状态
    setIsCreatingAnnotation(false);
    setStartPoint(null);
    setCurrentAnnotation(null);

    // 如果是文本类型的批注，可以选择切换回默认工具
    if (['text', 'rectangle', 'circle', 'ellipse'].includes(currentTool)) {
      // 自动切换回默认工具，提高用户体验
      setCurrentTool('' as AnnotationTool);
    }
  };

  // 渲染内容
  const renderContent = () => {
    return (
      <div className="pdf-content-container" ref={containerRef}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Spin size="large" />}
          className="pdf-document"
        >
          {!isLoading &&
            Array.from(new Array(numPages), (_, index) => {
              const thisPageNumber = index + 1;

              // 获取当前页面的批注
              const pageAnnotations = [
                ...annotations.filter((a) => a.pageNumber === thisPageNumber),
                ...(currentAnnotation &&
                currentAnnotation.pageNumber === thisPageNumber
                  ? [currentAnnotation]
                  : []),
              ];

              console.log(`页面 ${thisPageNumber} 的批注:`, pageAnnotations);

              return (
                <div
                  key={`page-${thisPageNumber}`}
                  className={`pdf-page-wrapper ${
                    currentTool !== 'signature' ? 'active-annotation-layer' : ''
                  }`}
                  ref={(el) => {
                    pagesRef.current[index] = el;
                  }}
                  style={{ position: 'relative' }} // 确保相对定位
                >
                  <Page
                    pageNumber={thisPageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="pdf-page"
                    loading={<Spin size="large" />}
                    onRenderSuccess={() => {
                      console.log(`页面 ${thisPageNumber} 渲染成功`, {
                        pageWidth: pagesRef.current[index]?.clientWidth,
                        pageHeight: pagesRef.current[index]?.clientHeight,
                      });
                    }}
                  />

                  {/* 页面信息 - 调试用 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      left: '5px',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: '2px 5px',
                      fontSize: '12px',
                      zIndex: 1001,
                    }}
                  >
                    页码: {thisPageNumber}, 尺寸:{' '}
                    {pagesRef.current[index]?.clientWidth}x
                    {pagesRef.current[index]?.clientHeight}, 批注数:{' '}
                    {pageAnnotations.length}
                  </div>

                  {/* 使用AnnotationLayer组件来渲染批注 */}
                  <AnnotationLayer
                    annotations={pageAnnotations}
                    pageNumber={thisPageNumber}
                    scale={scale}
                    pageWidth={pagesRef.current[index]?.clientWidth || 600}
                    pageHeight={pagesRef.current[index]?.clientHeight || 800}
                    onUpdateAnnotation={handleUpdateAnnotation}
                    isToolActive={!!currentTool}
                  />

                  {/* 用于生成批注的交互层 */}
                  <div
                    className="annotation-interaction-layer"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: currentTool ? 'auto' : 'none',
                      backgroundColor: currentTool
                        ? 'rgba(0, 0, 0, 0.01)'
                        : 'transparent', // 轻微的背景色以便调试
                      zIndex: 900, // 确保在PDF内容之上，但在批注层之下
                    }}
                    onMouseDown={(e) =>
                      handleAnnotationStart(e, thisPageNumber)
                    }
                    onMouseMove={handleAnnotationMove}
                    onMouseUp={handleAnnotationEnd}
                  />
                </div>
              );
            })}
        </Document>
        {isLoading && (
          <div className="pdf-loading">
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载文档中...</div>
          </div>
        )}
        {/* 签名面板 */}
        {currentTool === 'signature' && (
          <div className="signature-panel">
            <div className="signature-panel-header">
              <span>请在下方区域签名</span>
              <div className="signature-actions">
                <Button onClick={clearSignature}>清除</Button>
                <Button type="primary" onClick={completeSignature}>
                  完成
                </Button>
              </div>
            </div>
            <canvas
              ref={signatureCanvasRef}
              width={500}
              height={300}
              className="signature-canvas"
              onMouseDown={handleSignatureStart}
              onMouseMove={handleSignatureMove}
              onMouseUp={handleSignatureEnd}
              onMouseLeave={handleSignatureEnd}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`pdf-annotation-container ${className}`}
      style={style}
      ref={containerRef}
    >
      <Toolbar
        currentTool={currentTool}
        scale={scale}
        pageNumber={pageNumber}
        pageCount={numPages}
        lineType={lineType}
        strokeColor={strokeColor}
        sideMenuVisible={sideMenuVisible}
        onToolChange={handleToolChange}
        onLineTypeChange={handleLineTypeChange}
        onStrokeColorChange={handleStrokeColorChange}
        onPageChange={setPageNumber}
        onZoomChange={setScale}
        onSave={handleSave}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onMenuToggle={handleMenuToggle}
      />

      <div className="pdf-annotation-main">
        {/* 侧边菜单 */}
        <SideMenu
          visible={sideMenuVisible}
          annotations={getAnnotationsByPage(pageNumber)} // 获取当前页码的批注
          currentPage={pageNumber}
          onAnnotationSelect={handleAnnotationSelect}
          onAnnotationDelete={removeAnnotation}
          fileUrl={fileUrl}
          onThumbnailClick={setPageNumber}
        />

        {/* PDF内容 */}
        <div className="pdf-annotation-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PdfAnnotationExtension;
