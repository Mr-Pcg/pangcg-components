import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import { PdfPreview } from 'pangcg-components';
import React, { useRef, useState } from 'react';

export default () => {
  const [visible, setVisible] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // 检查是否为PDF文件
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setVisible(true);
      message.success(`${file.name} 文件已准备好预览`);
    } else if (file) {
      message.error('请上传PDF格式的文件');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Space>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <Button icon={<UploadOutlined />} onClick={handleButtonClick}>
          选择PDF文件
        </Button>

        {pdfFile && (
          <Button type="primary" onClick={() => setVisible(true)}>
            预览已上传的PDF
          </Button>
        )}
      </Space>

      {pdfFile && (
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
          <PdfPreview fileUrl={pdfFile} style={{ height: 500 }} />
        </Modal>
      )}
    </div>
  );
};
