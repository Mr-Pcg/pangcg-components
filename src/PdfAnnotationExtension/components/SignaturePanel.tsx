import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Tabs, Upload, message } from 'antd';
import React, { useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';

interface SignaturePanelProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: 'signature' | 'stamp', dataUrl: string) => void;
}

const SignaturePanel: React.FC<SignaturePanelProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<string>('draw');
  const [lines, setLines] = useState<Array<{ points: number[] }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stampPreview, setStampPreview] = useState<string>('');

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // 清空签名
  const handleClear = () => {
    setLines([]);
  };

  // 开始绘制
  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  // 绘制中
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;

    lastLine.points = lastLine.points.concat([point.x, point.y]);

    setLines([...lines.slice(0, -1), lastLine]);
  };

  // 结束绘制
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 确认签名
  const handleConfirmSignature = () => {
    if (lines.length === 0) {
      message.error('请先绘制签名');
      return;
    }

    if (stageRef.current) {
      const dataUrl = stageRef.current.toDataURL();
      onConfirm('signature', dataUrl);
      onClose();
      handleClear();
    }
  };

  // 确认印章
  const handleConfirmStamp = () => {
    if (!stampPreview) {
      message.error('请先上传印章图片');
      return;
    }

    onConfirm('stamp', stampPreview);
    onClose();
    setStampPreview('');
  };

  // 处理印章上传前
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }

    // 将图片转换为Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setStampPreview(reader.result as string);
    };

    return false; // 阻止自动上传
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Modal
      title="签名 & 印章"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: 'draw',
            label: '手写签名',
            children: (
              <div>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    marginBottom: 16,
                  }}
                >
                  <Stage
                    ref={stageRef}
                    width={450}
                    height={200}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ background: '#f0f0f0' }}
                  >
                    <Layer ref={layerRef}>
                      {lines.map((line, i) => (
                        <Line
                          key={i}
                          points={line.points}
                          stroke="#000"
                          strokeWidth={2}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={handleClear} style={{ marginRight: 8 }}>
                    清除
                  </Button>
                  <Button type="primary" onClick={handleConfirmSignature}>
                    确认
                  </Button>
                </div>
              </div>
            ),
          },
          {
            key: 'stamp',
            label: '印章',
            children: (
              <div>
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                >
                  {stampPreview ? (
                    <img
                      src={stampPreview}
                      alt="印章"
                      style={{ width: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 16,
                  }}
                >
                  {stampPreview && (
                    <Button
                      onClick={() => setStampPreview('')}
                      style={{ marginRight: 8 }}
                    >
                      清除
                    </Button>
                  )}
                  <Button
                    type="primary"
                    onClick={handleConfirmStamp}
                    disabled={!stampPreview}
                  >
                    确认
                  </Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default SignaturePanel;
