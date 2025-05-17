export type AnnotationTool =
  | 'text' // 文本
  | 'highlight' // 高亮
  | 'underline' // 下划线
  | 'strikethrough' // 删除线
  | 'rectangle' // 矩形
  | 'circle' // 圆形
  | 'ellipse' // 椭圆
  | 'freehand' // 自由绘制
  | 'freeHighlight' // 自由高亮
  | 'signature' // 签名
  | 'stamp'; // 印章

export type AnnotationColor = string;

export interface AnnotationStyle {
  strokeColor: string;
  fillColor: string;
  opacity: number;
  lineWidth: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  type: AnnotationTool;
  pageNumber: number;
  points?: number[];
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  text?: string;
  style: AnnotationStyle;
  createdAt: number;
}

export interface PdfAnnotationExtensionProps {
  /**
   * 文件URL或文件数据
   */
  fileUrl: string | Blob | File;

  /**
   * 文件名
   */
  fileName?: string;

  /**
   * 样式
   */
  className?: string;
  style?: React.CSSProperties;

  /**
   * 初始注释
   */
  initialAnnotations?: Annotation[];

  /**
   * 注释变化回调
   */
  onAnnotationsChange?: (annotations: Annotation[]) => void;

  /**
   * 保存回调
   */
  onSave?: (annotations: Annotation[], pdfData?: Blob) => void;
}
