/**
 * 批注类型
 */
export type AnnotationType =
  | 'highlight'
  | 'strikethrough'
  | 'underline'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'freedraw'
  | 'freehighlight'
  | 'signature'
  | 'stamp'
  | 'text';

/**
 * 线条类型
 */
export type LineStyle = 'solid' | 'dashed';

/**
 * 批注基类
 */
export interface BaseAnnotation {
  id: string; // 批注ID
  type: AnnotationType; // 批注类型
  pageNumber: number; // 页码
  createdAt: string; // 创建时间
  modifiedAt: string; // 修改时间
  color: string; // 颜色
  opacity: number; // 透明度
  comment?: string; // 批注评论
  lineStyle?: LineStyle; // 线条样式
}

// 文本批注
export interface TextAnnotation extends BaseAnnotation {
  type: 'highlight' | 'strikethrough' | 'underline'; // 高亮/删除线/下划线
  rects: Array<{ x: number; y: number; width: number; height: number }>;
  text: string;
  highlightId?: string; // web-highlighter ID
}

// 纯文本标注
export interface TextNoteAnnotation extends BaseAnnotation {
  type: 'text'; // 纯文本批注
  x: number; // 文本x轴位置
  y: number; // 文本y轴位置
  width: number; // 文本框宽度
  height: number; // 文本框高度
  text: string; // 文本内容
  fontSize?: number; // 字体大小
  backgroundColor?: string; // 背景颜色
}

// 形状批注
export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'circle' | 'ellipse'; // 矩形/圆形/椭圆
  x: number; // 矩形/椭圆x轴位置
  y: number; // 矩形/椭圆y轴位置
  width?: number; // 矩形/椭圆宽度
  height?: number; // 矩形/椭圆高度
  radius?: number; // 圆形/椭圆半径
  fillColor?: string; // 填充颜色
  strokeWidth: number; // 边框宽度
}

// 绘制批注
export interface DrawAnnotation extends BaseAnnotation {
  type: 'freedraw' | 'freehighlight'; // 绘制/高亮
  points: number[];
  strokeWidth: number;
}

// 图片批注
export interface ImageAnnotation extends BaseAnnotation {
  type: 'signature' | 'stamp'; // 签名/盖章
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
}

// 批注类型
export type Annotation =
  | TextAnnotation // 文本批注
  | ShapeAnnotation // 形状批注
  | DrawAnnotation // 绘制批注
  | ImageAnnotation // 图片批注
  | TextNoteAnnotation; // 纯文本标注
