import { Button, Modal, Space } from 'antd';
import { PdfPreview } from 'pangcg-components';
import React, { useState } from 'react';

export default () => {
  const [visible, setVisible] = useState(false);

  // 示例PDF文件URL - 在线链接
  const fileUrl =
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  return (
    <div>
      <Space>
        <Button type="primary" onClick={() => setVisible(true)}>
          预览在线PDF
        </Button>
      </Space>
      <Modal
        title="pdf文件预览"
        width={900}
        okText="确认"
        cancelText="取消"
        open={visible}
        onCancel={() => setVisible(false)}
        onClose={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
        <PdfPreview fileUrl={fileUrl} style={{ height: 500 }} />
      </Modal>
    </div>
  );
};
