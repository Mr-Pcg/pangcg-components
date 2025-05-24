import { Button, ColorPicker, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect } from 'react';
import { TextNoteAnnotation } from '../types';

interface TextNotePanelProps {
  onSave: (text: string, fontSize: number, backgroundColor: string) => void;
  onCancel: () => void;
  visible: boolean; // 新增 visible 属性控制弹框显示
  curTextNotePanelData: TextNoteAnnotation; // 用于数据回显
}

const TextNotePanel: React.FC<TextNotePanelProps> = ({
  onSave,
  onCancel,
  visible,
  curTextNotePanelData = {} as TextNoteAnnotation,
}) => {
  const [form] = Form.useForm();

  // 监听
  const watch_backgroundColor = Form.useWatch(['backgroundColor'], form);

  // 预设背景颜色
  const presetColors = [
    '#FFFFA0', // 浅黄色
    '#A0E7E5', // 浅青色
    '#FFC0CB', // 浅粉色
    '#FFCBA4', // 浅橙色
    '#D3D3D3', // 浅灰色
    '#C1FFC1', // 浅绿色
    '#FFFFFF', // 白色
  ];

  // 组件挂载时设置默认值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        text: curTextNotePanelData?.text || '',
        fontSize: curTextNotePanelData?.fontSize || 12,
        backgroundColor: curTextNotePanelData?.backgroundColor || '#FFFFA0',
      });
    }
  }, [visible, curTextNotePanelData]);

  // 保存文本批注
  const handleSave = (values: {
    text: string;
    fontSize: number;
    backgroundColor: string;
  }) => {
    const { text, fontSize, backgroundColor } = values;
    onSave(text, fontSize, backgroundColor);
  };

  return (
    <Modal
      title="添加文本批注"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={() => form.submit()}>
          添加批注
        </Button>,
      ]}
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="text"
          rules={[{ required: true, message: '请输入批注文本' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入批注文本..."
            autoFocus
            style={{
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: watch_backgroundColor,
            }}
          />
        </Form.Item>

        <Form.Item label="字体大小" name="fontSize">
          <InputNumber
            min={1}
            max={100}
            style={{ width: '200px' }}
            addonAfter="px"
          />
        </Form.Item>

        <Form.Item label="背景颜色" name="backgroundColor">
          <ColorPicker
            presets={[
              {
                label: '预设颜色',
                colors: presetColors,
              },
            ]}
            size="middle"
            format="hex"
            onChange={(color) => {
              form.setFieldValue('backgroundColor', color?.toHexString?.());
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TextNotePanel;
