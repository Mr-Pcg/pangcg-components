import { InboxOutlined } from '@ant-design/icons';
import { Button, ColorPicker, Modal, Radio, Tabs, Upload, message } from 'antd';
import React, { useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';

interface SignaturePanelProps {
  type: 'signature' | 'stamp';
  visible: boolean;
  onSave: (imageData: string) => void;
  onCancel: () => void;
}

const { Dragger } = Upload;

// 签名面板
const SignaturePanel: React.FC<SignaturePanelProps> = ({
  type,
  visible,
  onSave,
  onCancel,
}) => {
  const [lines, setLines] = useState<
    Array<{ points: number[]; stroke: string; strokeWidth: number }>
  >([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [color, setColor] = useState<string>(
    type === 'signature' ? '#000000' : '#ff0000',
  );
  const [strokeWidth, setStrokeWidth] = useState<number>(
    type === 'signature' ? 2 : 4,
  );
  const stageRef = useRef<any>(null);

  // 画布尺寸
  const width = 400;
  const height = 200;

  // 处理鼠标按下事件
  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: strokeWidth,
      },
    ]);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    // 添加新的点到最后一条线
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // 更新线条
    setLines([...lines.slice(0, -1), lastLine]);
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 处理触摸事件
  const handleTouchStart = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setIsDrawing(true);
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: strokeWidth,
      },
    ]);
  };

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault();
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    // 添加新的点到最后一条线
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // 更新线条
    setLines([...lines.slice(0, -1), lastLine]);
  };

  const handleTouchEnd = (e: any) => {
    e.evt.preventDefault();
    setIsDrawing(false);
  };

  // 清除画布
  const handleClear = () => {
    setLines([]);
    setUploadedImage(null);
  };

  // 保存图像
  const handleSave = () => {
    if (uploadedImage) {
      onSave(uploadedImage);
      return;
    }

    if (lines.length === 0) {
      message.warning('请先绘制或上传图像');
      return;
    }

    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      onSave(dataURL);
    }
  };

  // 处理颜色变化
  const handleColorChange = (color: any, hex: string) => {
    setColor(hex);
  };

  // 预设颜色
  const presetColors =
    type === 'signature'
      ? [
          '#000000', // 黑色
          '#0000FF', // 蓝色
          '#FF0000', // 红色
          '#008000', // 绿色
        ]
      : [
          '#FF0000', // 红色
          '#0000FF', // 蓝色
          '#800000', // 深红色
          '#FF8C00', // 深橙色
        ];

  // 定义标签页内容
  const tabItems = [
    {
      key: 'draw',
      label: '手绘',
      children: (
        <div className="signature-canvas-container">
          <Stage
            width={width}
            height={height}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              border: '1px solid #ddd',
              borderRadius: 4,
              background: '#fff',
            }}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          </Stage>

          <div className="signature-controls">
            <div className="control-group">
              <div className="control-label">颜色:</div>
              <ColorPicker
                value={color}
                onChange={handleColorChange}
                presets={[
                  {
                    label: '预设颜色',
                    colors: presetColors,
                  },
                ]}
                size="small"
                format="hex"
              />
            </div>

            <div className="control-group">
              <div className="control-label">线条粗细:</div>
              <div className="stroke-width-control">
                <Radio.Group
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(e.target.value)}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value={1}>细</Radio.Button>
                  <Radio.Button value={3}>中</Radio.Button>
                  <Radio.Button value={5}>粗</Radio.Button>
                </Radio.Group>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                size="middle"
                onClick={handleClear}
                style={{ marginRight: 8 }}
              >
                清除
              </Button>
              <Button size="middle" type="primary" onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'upload',
      label: '上传',
      children: uploadedImage ? (
        <div style={{ textAlign: 'center' }}>
          <img
            src={uploadedImage}
            alt="上传的图片"
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          />
          <div>
            <Button onClick={handleClear} style={{ marginRight: 8 }}>
              清除
            </Button>
            <Button type="primary" onClick={handleSave}>
              使用此图片
            </Button>
          </div>
        </div>
      ) : (
        <Dragger
          accept=".png,.jpg,.jpeg"
          showUploadList={false}
          beforeUpload={(file) => {
            // 直接在这里处理文件上传
            const reader = new FileReader(); // 创建文件读取器，将文件转换为 base64 格式的数据 URL
            reader.onload = (e) => {
              if (e.target?.result) {
                setUploadedImage(e.target.result as string);
              }
            };
            reader.readAsDataURL(file);

            // 返回false阻止默认上传行为
            return false;
          }}
          multiple={false} // 禁止多文件上传
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个图片上传，推荐使用透明背景的PNG图片
          </p>
        </Dragger>
      ),
    },
  ];

  return (
    <Modal
      title={type === 'signature' ? '添加签名' : '添加盖章'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Tabs defaultActiveKey="draw" items={tabItems} />
    </Modal>
  );
};

export default SignaturePanel;
