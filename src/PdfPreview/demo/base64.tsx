import { Button, Modal, Space } from 'antd';
import { PdfPreview } from 'pangcg-components';
import React, { useState } from 'react';

export default () => {
  const [visible, setVisible] = useState(false);

  // 这里只是一个示例，实际应用中应替换为真实的 Base64 数据
  // 通常在实际应用中，Base64数据会从后端接口获取
  const base64Data =
    'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSAxMSAwIFI+Pi9Qcm9jU2V0WzIgMCBSIDMgMCBSIDUgMCBSIDYgMCBSXS9YT2JqZWN0PDwvWDEgOSAwIFI+Pj4+L01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyAxMiAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0V4dEdTdGF0ZS9TQSBmYWxzZS9TTSAwLjAyL1RSMS9UeXBlL0V4dEdTdGF0ZT4+CmVuZG9iago1IDAgb2JqClsvUGF0dGVybiAvRGV2aWNlUkdCXQplbmRvYmoKNiAwIG9iagpbL0NhbElSRyA8PC9HYW1tYVsyLjIgMi4yIDIuMl0vV2hpdGVQb2ludFswLjk1MDUgMSAxLjA4OTFdPj4gL0RldmljZVJHQl0KZW5kb2JqCjcgMCBvYmoKPDwvVHlwZS9YT2JqZWN0L1Jlc291cmNlczw8L1Byb2NTZXRbNyAwIFJdPj4vQkJveFswIDAgOCAxNl0vTmFtZS9YMS9MZW5ndGggMTE0L0Zvcm1UeXBlIDEvRmlsdGVyL0ZsYXRlRGVjb2RlL1R5cGUvWE9iamVjdC9TdWJ0eXBlL0Zvcm0+PgpzdHJlYW0KeJwr5CrkMuQyMDAzMzY0tjI2tTI1NbcyNTezMrc0MjKzMjK3MrG0MLO0MDQ0MTK2NFQwVjA0MFFISeYqLdbIy8xJVQhJzEtPLVLQtHdVUEksSXRPzahUMOQqBADMZRGdCmVuZHN0cmVhbQplbmRvYmoKOCAwIG9iago8PC9UeXBlL0FjdGlvbi9TL1VSSS9VUkkoaHR0cDovL3ZlcnNpb24ucGRmLXRvb2xzLmNvbS9wZGZjcmVhdG9yLmFzcCk+PgplbmRvYmoKOSAwIG9iago8PC9UeXBlL1hPYmplY3QvUmVzb3VyY2VzPDwvUHJvY1NldFs3IDAgUl0+Pi9CQm94WzAgMCAyNTMgMzNdL05hbWUvWDEvTGVuZ3RoIDU4MS9Gb3JtVHlwZSAxL0ZpbHRlci9GbGF0ZURlY29kZS9UeXBlL1hPYmplY3QvU3VidHlwZS9Gb3JtPj4Kc3RyZWFtCnicK+Qq5DLkMjAwMzM2NLYyMjU1MLW0MjUwNrY0NLIwMbA0srA0M7MwMTQ2MTYxUEjLLCnKTC1WMFAwAoHEsszs1CIF38SyTCTx4uSS1FyFzLzk/BzNpEwFl/y8VCC/uCQ1BSS9ODc/NxXIuLm1tDQ9VKQatK7UyjyGQi4A1/wcigplbmRzdHJlYW0KZW5kb2JqCjEwIDAgb2JqCjw8L1R5cGUvQWN0aW9uL1MvVVJJL1VSSShodHRwOi8vd3d3LnBkZi10b29scy5jb20pPj4KZW5kb2JqCjExIDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKMTIgMCBvYmoKPDwvTGVuZ3RoIDQwL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCvkKlQwAEIjCI2kFXK5CrkMuQwMzMwVDAwMTS0s9UpLzBT89RXCPRUUDAEXrgjOCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDEzCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY3IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDI3MSAwMDAwMCBuIAowMDAwMDAwMzQ3IDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKMDAwMDAwMDQ3MCAwMDAwMCBuIAowMDAwMDAwNzAyIDAwMDAwIG4gCjAwMDAwMDA3ODYgMDAwMDAgbiAKMDAwMDAwMTQ4OCAwMDAwMCBuIAowMDAwMDAxNTY1IDAwMDAwIG4gCjAwMDAwMDE2NTMgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDEzL1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTc2MgolJUVPRgo=';

  return (
    <div>
      <Space>
        <Button type="primary" onClick={() => setVisible(true)}>
          预览Base64编码PDF
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
      >
        <PdfPreview
          fileUrl={base64Data}
          fileName="Base64示例文档.pdf"
          style={{ height: 500 }}
        />
      </Modal>
    </div>
  );
};
