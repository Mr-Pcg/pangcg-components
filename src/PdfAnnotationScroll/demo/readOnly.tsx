// 使用PdfAnnotationExtension组件并传递预设的批注数据示例
import dayjs from 'dayjs';
import { Annotation, PdfAnnotationScroll } from 'pangcg-components';
import React from 'react';

const MyPdfViewer: React.FC = () => {
  // 预设的批注数据，包含矩形、圆形和椭圆
  const predefinedAnnotations: Annotation[] = [
    {
      id: '1',
      type: 'rectangle', // 矩形
      pageNumber: 1,
      x: 100,
      y: 100,
      width: 150,
      height: 80,
      color: '#FF5733', // 橙红色
      opacity: 0.7,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '2',
      type: 'circle', // 圆形
      pageNumber: 1,
      radius: 73, // 直径
      width: 146,
      height: 33,
      x: 179.5,
      y: 238.0625, // 圆心y轴位置
      color: '#33A1FF', // 蓝色
      opacity: 0.7,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '3',
      type: 'ellipse', // 椭圆
      pageNumber: 2,
      opacity: 1,
      strokeWidth: 2,
      width: 182,
      height: 53,
      x: 112,
      y: 105.234375,
      color: '#33FF57', // 绿色
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '38766888',
      type: 'freedraw', // 自由绘制
      pageNumber: 1,
      opacity: 1,
      strokeWidth: 2,
      points: [
        339.5, 168.234375, 339.5, 168.234375, 339.5, 168.234375, 340.5,
        168.234375, 342.5, 168.234375, 344.5, 168.234375, 346.5, 168.234375,
        349.5, 168.234375, 352.5, 168.234375, 355.5, 168.234375, 359.5,
        168.234375, 362.5, 168.234375, 365.5, 168.234375, 367.5, 168.234375,
        370.5, 168.234375, 372.5, 168.234375, 374.5, 168.234375, 375.5,
        167.234375, 376.5, 166.234375, 377.5, 166.234375, 378.5, 166.234375,
        379.5, 165.234375, 380.5, 164.234375, 380.5, 163.234375, 381.5,
        163.234375, 381.5, 162.234375, 382.5, 161.234375, 382.5, 161.234375,
        382.5, 161.234375, 382.5, 160.234375, 382.5, 160.234375, 383.5,
        159.234375, 383.5, 159.234375, 383.5, 159.234375, 383.5, 158.234375,
        383.5, 157.234375, 383.5, 156.234375, 384.5, 154.234375, 384.5,
        152.234375, 384.5, 150.234375, 384.5, 149.234375, 385.5, 147.234375,
        385.5, 145.234375, 385.5, 143.234375, 385.5, 141.234375, 385.5,
        140.234375, 385.5, 138.234375, 385.5, 137.234375, 385.5, 136.234375,
        385.5, 135.234375, 386.5, 134.234375, 386.5, 132.234375, 386.5,
        131.234375, 386.5, 130.234375, 386.5, 129.234375, 386.5, 128.234375,
        386.5, 127.234375, 386.5, 126.234375, 386.5, 125.234375, 386.5,
        125.234375, 386.5, 124.234375, 386.5, 123.234375, 385.5, 123.234375,
        384.5, 122.234375, 383.5, 121.234375, 382.5, 121.234375, 381.5,
        120.234375, 380.5, 119.234375, 379.5, 119.234375, 377.5, 118.234375,
        375.5, 117.234375, 374.5, 116.234375, 372.5, 116.234375, 371.5,
        116.234375, 370.5, 116.234375, 369.5, 116.234375, 368.5, 115.234375,
        368.5, 115.234375, 367.5, 115.234375, 367.5, 115.234375, 366.5,
        115.234375, 366.5, 115.234375, 366.5, 115.234375, 365.5, 115.234375,
        365.5, 115.234375, 365.5, 115.234375, 365.5, 115.234375, 365.5,
        115.234375, 364.5, 116.234375, 364.5, 116.234375, 364.5, 116.234375,
        364.5, 116.234375, 364.5, 117.234375, 364.5, 117.234375, 364.5,
        117.234375, 364.5, 117.234375, 364.5, 118.234375, 364.5, 119.234375,
        364.5, 120.234375, 364.5, 121.234375, 364.5, 123.234375, 364.5,
        126.234375, 364.5, 129.234375, 365.5, 133.234375, 365.5, 137.234375,
        366.5, 142.234375, 366.5, 148.234375, 367.5, 154.234375, 368.5,
        161.234375, 369.5, 167.234375, 370.5, 173.234375, 371.5, 179.234375,
        373.5, 183.234375, 373.5, 186.234375, 374.5, 189.234375, 375.5,
        192.234375, 376.5, 195.234375, 376.5, 196.234375, 376.5, 197.234375,
        376.5, 198.234375, 377.5, 199.234375, 377.5, 200.234375, 377.5,
        200.234375, 378.5, 201.234375, 378.5, 201.234375, 378.5, 201.234375,
        378.5, 201.234375, 378.5, 202.234375, 378.5, 202.234375, 378.5,
        201.234375, 379.5, 201.234375, 379.5, 199.234375, 379.5, 197.234375,
      ],
      color: '#33FF57', // 绿色
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '1747067796200',
      type: 'signature',
      pageNumber: 2,
      x: -12,
      y: 221,
      width: 306,
      height: 99,
      imageData:
        'data:image/png;base64,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',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      color: '#000000',
      opacity: 1,
    },
  ] as Annotation[];

  return (
    <div style={{ height: 910 }}>
      <PdfAnnotationScroll
        readOnly={true}
        fileName="示例文档.pdf"
        fileUrl="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
        annotationList={predefinedAnnotations}
        onSave={(annotations: Annotation[], saveFile: Blob | undefined) => {
          console.log('保存的批注:', annotations);
          // 可以将批注数据保存到服务器: updatedPdf为Blob格式，可以转成 File 格式
          const file = new File([saveFile as Blob], '示例文档.pdf', {
            type: 'application/pdf',
          });
          console.log(file, '保存的文件----->>');
        }}
      />
    </div>
  );
};

export default MyPdfViewer;
