import { Annotation, PdfAnnotationExtension } from 'pangcg-components';
import React from 'react';

// 示例PDF文件URL
const pdfUrl =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const DemoPage = () => {
  // 处理批注保存
  const handleSave = (
    annotations: Annotation[],
    updatedPdf: Blob | undefined,
  ) => {
    console.log('批注数据:', annotations, updatedPdf);
    // 可以将批注数据保存到服务器: updatedPdf为Blob格式，可以转成 File 格式
    const file = new File([updatedPdf as Blob], '示例文档.pdf', {
      type: 'application/pdf',
    });
    console.log(file, 'file----->>');
  };

  return (
    <PdfAnnotationExtension
      fileUrl={pdfUrl}
      fileName="示例文档.pdf"
      onSave={handleSave}
    />
  );
};

export default DemoPage;
