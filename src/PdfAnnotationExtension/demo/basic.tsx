import { message } from 'antd';
import { PdfAnnotationExtension } from 'pangcg-components';
import React from 'react';

export default () => {
  // 示例PDF URL
  const fileUrl =
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  // 保存处理函数
  const handleSave = (annotations: any[], pdfBlob?: Blob) => {
    message.success(`保存了${annotations.length}个批注`);

    // 下载生成的PDF
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${'document'}_annotated.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      {fileUrl && (
        <PdfAnnotationExtension
          fileUrl={fileUrl}
          fileName={'测试pdf'}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
