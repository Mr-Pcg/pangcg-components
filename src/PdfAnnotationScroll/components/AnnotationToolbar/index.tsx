import {
  BgColorsOutlined,
  BorderOutlined,
  DashOutlined,
  EditOutlined,
  FileTextOutlined,
  HighlightOutlined,
  MinusOutlined,
  PictureOutlined,
  SignatureOutlined,
  StrikethroughOutlined,
  TagOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import { ColorPicker, Divider } from 'antd';
import React from 'react';
import { AnnotationType, LineStyle } from '../../types';
import ToolButton from './ToolButton';
import './index.less';

interface AnnotationToolbarProps {
  activeTool: AnnotationType | null;
  activeColor: string;
  activeLineStyle: LineStyle;
  onToolSelect: (tool: AnnotationType) => void;
  onColorChange: (color: string) => void;
  onLineStyleChange: (lineStyle: LineStyle) => void;
  readOnly?: boolean;
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  activeColor,
  activeLineStyle = 'solid',
  onToolSelect,
  onColorChange,
  onLineStyleChange,
}) => {
  // 预设颜色
  const presetColors = [
    '#FFFF00', // 黄色
    '#FF0000', // 红色
    '#00FF00', // 绿色
    '#0000FF', // 蓝色
    '#FF00FF', // 粉色
    '#00FFFF', // 青色
    '#FFA500', // 橙色
    '#000000', // 黑色
    '#FFFFFF', // 白色
    '#888888', // 灰色
  ];

  // 处理颜色变化
  const handleColorChange = (color: any, hex: string) => {
    onColorChange(hex);
  };

  return (
    <div className="annotation-toolbar">
      <div className="annotation-tools">
        {/* 文本批注工具组 */}
        <div className="tool-group">
          <div className="tool-item">
            <ToolButton
              icon={<HighlightOutlined />}
              active={activeTool === 'highlight'}
              disabled={true}
              onClick={() => onToolSelect('highlight')}
            />
            <span className="tool-name">高亮</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<StrikethroughOutlined />}
              active={activeTool === 'strikethrough'}
              disabled={true}
              onClick={() => onToolSelect('strikethrough')}
            />
            <span className="tool-name">删除线</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<UnderlineOutlined />}
              active={activeTool === 'underline'}
              disabled={true}
              onClick={() => onToolSelect('underline')}
            />
            <span className="tool-name">下划线</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<FileTextOutlined />}
              active={activeTool === 'text'}
              onClick={() => onToolSelect('text')}
            />
            <span className="tool-name">文本</span>
          </div>
        </div>

        <Divider type="vertical" className="tool-divider" />

        {/* 形状批注工具组 */}
        <div className="tool-group">
          <div className="tool-item">
            <ToolButton
              icon={<BorderOutlined />}
              active={activeTool === 'rectangle'}
              onClick={() => onToolSelect('rectangle')}
            />
            <span className="tool-name">矩形</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<TagOutlined style={{ transform: 'rotate(45deg)' }} />}
              active={activeTool === 'circle'}
              onClick={() => onToolSelect('circle')}
            />
            <span className="tool-name">圆形</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<PictureOutlined />}
              active={activeTool === 'ellipse'}
              onClick={() => onToolSelect('ellipse')}
            />
            <span className="tool-name">椭圆</span>
          </div>
        </div>

        <Divider type="vertical" className="tool-divider" />

        {/* 绘制批注工具组 */}
        <div className="tool-group">
          <div className="tool-item">
            <ToolButton
              icon={<EditOutlined />}
              active={activeTool === 'freedraw'}
              onClick={() => onToolSelect('freedraw')}
            />
            <span className="tool-name">自由绘制</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<BgColorsOutlined />}
              active={activeTool === 'freehighlight'}
              onClick={() => onToolSelect('freehighlight')}
            />
            <span className="tool-name">自由高亮</span>
          </div>
        </div>

        <Divider type="vertical" className="tool-divider" />

        {/* 图像批注工具组 */}
        <div className="tool-group">
          <div className="tool-item">
            <ToolButton
              icon={<SignatureOutlined />}
              active={activeTool === 'signature'}
              onClick={() => onToolSelect('signature')}
            />
            <span className="tool-name">签名</span>
          </div>

          <div className="tool-item">
            <ToolButton
              icon={<PictureOutlined style={{ color: '#ff4d4f' }} />}
              active={activeTool === 'stamp'}
              onClick={() => onToolSelect('stamp')}
            />
            <span className="tool-name">盖章</span>
          </div>
        </div>

        <Divider type="vertical" className="tool-divider" />

        {/* 线型工具组 */}
        <div className="tool-group">
          <div className="tool-item">
            <ToolButton
              icon={<MinusOutlined />}
              active={activeLineStyle === 'solid'}
              onClick={() => onLineStyleChange('solid')}
            />
            <span className="tool-name">实线</span>
          </div>
          <div className="tool-item">
            <ToolButton
              icon={<DashOutlined />}
              active={activeLineStyle === 'dashed'}
              onClick={() => onLineStyleChange('dashed')}
            />
            <span className="tool-name">虚线</span>
          </div>
        </div>

        <Divider type="vertical" className="tool-divider" />

        <div className="tool-group">
          <div className="tool-item">
            {/* 颜色选择器 */}
            <ColorPicker
              value={activeColor}
              size="small"
              className="color-picker"
              format="hex"
              arrow={false}
              placement="bottomRight"
              presets={[
                {
                  label: '预设颜色',
                  colors: presetColors,
                },
              ]}
              onChange={handleColorChange}
            />
            <span className="tool-name">颜色选择</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationToolbar;
