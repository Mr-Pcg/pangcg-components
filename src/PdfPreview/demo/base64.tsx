import { Button, Modal, Space, Spin } from 'antd';
import { PdfPreview } from 'pangcg-components';
import React, { useEffect, useState } from 'react';

export default () => {
  const [visible, setVisible] = useState(false);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 将在线PDF转换为Base64
  useEffect(() => {
    const fileUrl =
      'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

    setLoading(true);

    // 从URL获取PDF并转换为Base64
    const fetchPdfAndConvertToBase64 = async () => {
      try {
        // 获取PDF文件
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('无法获取PDF文件');
        }

        // 将响应转换为Blob
        const pdfBlob = await response.blob();

        // 使用FileReader将Blob转换为Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setBase64Data(base64);
          setLoading(false);
        };

        reader.onerror = () => {
          console.error('转换Base64时出错');
          setLoading(false);
        };

        // 开始读取Blob
        reader.readAsDataURL(pdfBlob);
      } catch (error) {
        console.error('获取PDF时出错:', error);
        setLoading(false);
      }
    };

    fetchPdfAndConvertToBase64();
  }, []);

  return (
    <div>
      <Space>
        <Button type="primary" onClick={() => setVisible(true)}>
          预览Base64编码PDF
        </Button>
      </Space>

      <Modal
        title="PDF文件预览"
        width={900}
        okText="确认"
        cancelText="取消"
        open={visible}
        onCancel={() => setVisible(false)}
        onClose={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 500,
              background: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <Spin size="large" />
            <div
              style={{
                marginTop: '16px',
                color: 'rgba(0, 0, 0, 0.65)',
                fontSize: '14px',
              }}
            >
              正在加载PDF文件，请稍候...
            </div>
          </div>
        ) : (
          base64Data && (
            <PdfPreview
              fileUrl={base64Data}
              fileName="Base64示例文档.pdf"
              style={{ height: 500 }}
            />
          )
        )}
      </Modal>
    </div>
  );
};
