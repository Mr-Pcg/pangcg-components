import {
  BorderOutlined,
  CloseCircleOutlined,
  DashOutlined,
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileTextOutlined,
  HighlightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusOutlined,
  PrinterOutlined,
  SaveOutlined,
  StarOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, ColorPicker, Divider, Tooltip } from 'antd';
import React from 'react';
import type { AnnotationTool } from '../types';
import './ToolBar.less';

interface ToolbarProps {
  currentTool: AnnotationTool; // 当前工具
  scale: number; // 缩放比例
  pageNumber: number; // 当前页码
  pageCount: number; // 总页数
  lineType: 'line' | 'dashed'; // 线条类型
  strokeColor: string; // 线条颜色
  sideMenuVisible: boolean; // 侧边菜单是否显示
  onToolChange: (tool: AnnotationTool) => void; // 工具切换回调
  onLineTypeChange: (type: 'line' | 'dashed') => void; // 线条类型切换回调
  onStrokeColorChange: (color: string) => void; // 线条颜色变更回调
  onPageChange: (pageNumber: number) => void; // 页码变更回调
  onZoomChange: (scale: number) => void; // 缩放比例变更回调
  onSave: () => void; // 保存回调
  onDownload: () => void; // 下载回调
  onPrint: () => void; // 打印回调
  onMenuToggle: () => void; // 菜单折叠回调
}

interface ToolGroup {
  title: string;
  tools: {
    key: AnnotationTool;
    title: string;
    icon: React.ReactNode;
  }[];
}

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

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  scale,
  pageNumber,
  pageCount,
  lineType,
  strokeColor,
  sideMenuVisible,
  onToolChange,
  onLineTypeChange,
  onStrokeColorChange,
  onPageChange,
  onZoomChange,
  onSave,
  onDownload,
  onPrint,
  onMenuToggle,
}) => {
  // 工具分组 - 只包含批注工具
  const toolGroups: ToolGroup[] = [
    {
      title: '文本标注',
      tools: [
        { key: 'highlight', title: '高亮', icon: <HighlightOutlined /> },
        { key: 'underline', title: '下划线', icon: <UnderlineOutlined /> },
        {
          key: 'strikethrough',
          title: '删除线',
          icon: <StrikethroughOutlined />,
        },
        { key: 'text', title: '文本', icon: <FileTextOutlined /> },
      ],
    },
    {
      title: '图形',
      tools: [
        { key: 'rectangle', title: '矩形', icon: <BorderOutlined /> },
        {
          key: 'circle',
          title: '圆形',
          icon: <EllipsisOutlined style={{ transform: 'scale(1, 1)' }} />,
        },
        { key: 'ellipse', title: '椭圆', icon: <EllipsisOutlined /> },
      ],
    },
    {
      title: '自由绘制',
      tools: [
        { key: 'freehand', title: '自由绘制', icon: <EditOutlined /> },
        {
          key: 'freeHighlight',
          title: '自由高亮',
          icon: <HighlightOutlined style={{ color: '#FFFF00' }} />,
        },
      ],
    },
    {
      title: '签名印章',
      tools: [
        { key: 'signature', title: '签名', icon: <EditOutlined /> },
        { key: 'stamp', title: '盖章', icon: <StarOutlined /> },
      ],
    },
  ];

  // 处理线条工具点击
  const handleLineToolClick = (type: 'line' | 'dashed') => {
    onLineTypeChange(type);
  };

  // 处理颜色变更
  const handleColorChange = (color: any) => {
    onStrokeColorChange(color.toHexString());
  };

  // 单个工具按钮
  const renderToolButton = (tool: {
    key: AnnotationTool;
    title: string;
    icon: React.ReactNode;
  }) => (
    <Tooltip key={tool.key} title={tool.title}>
      <div className={`tool-button`}>
        <Button
          type={currentTool === tool.key ? 'primary' : 'default'}
          size="small"
          onClick={() => onToolChange(tool.key)}
          className={`tool-icon ${currentTool === tool.key ? 'active' : ''}`}
          icon={tool.icon}
        />
        <div className="tool-title">{tool.title}</div>
      </div>
    </Tooltip>
  );

  return (
    <div className="pdf-annotation-toolbar">
      {/* 控件组 */}
      <div className="toolbar-container">
        {/* 控制 左侧菜单栏显示和隐藏 */}
        <div className="toolbar-control-item">
          <Button
            icon={
              sideMenuVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
            }
            onClick={onMenuToggle}
            size="small"
          />
        </div>
        {/* 缩放控件 */}
        <div className="toolbar-control-item">
          <Button
            icon={<ZoomOutOutlined />}
            onClick={() => onZoomChange(scale - 0.1)}
            disabled={scale <= 0.5}
            size="small"
          />
          <span>{Math.round(scale * 100)}%</span>
          <Button
            icon={<ZoomInOutlined />}
            onClick={() => onZoomChange(scale + 0.1)}
            disabled={scale >= 3}
            size="small"
          />
        </div>
        <Divider type="vertical" className="toolbar-divider" />
        {/* 页面控件 */}
        <div className="toolbar-control-item">
          <Button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            size="small"
          >
            上一页
          </Button>
          <span>
            {pageNumber} / {pageCount}
          </span>
          <Button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= pageCount}
            size="small"
          >
            下一页
          </Button>
        </div>
        <Divider type="vertical" className="toolbar-divider" />
        {/* 操作控件 */}
        <div className="toolbar-control-item">
          <Button icon={<SaveOutlined />} onClick={onSave} size="small">
            保存
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onDownload} size="small">
            下载
          </Button>
          <Button icon={<PrinterOutlined />} onClick={onPrint} size="small">
            打印
          </Button>
        </div>
      </div>

      <div className="toolbar-left">
        <div className="toolbar-tools">
          {/* 批注工具组 */}
          {toolGroups.map((group, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <Divider
                  type="vertical"
                  style={{ height: '40px', margin: '0 4px' }}
                />
              )}
              <div className="tool-group">
                {group.tools.map(renderToolButton)}
              </div>
            </React.Fragment>
          ))}

          <Divider
            type="vertical"
            style={{ height: '40px', margin: '0 4px' }}
          />

          {/* 工具 */}
          <div>
            {/* 线条工具 */}
            <div className="tool-group line-tools-group">
              <Tooltip title="实线">
                <div className={`tool-button`}>
                  <Button
                    type={lineType === 'line' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleLineToolClick('line')}
                    className={`tool-icon ${
                      lineType === 'line' ? 'active' : ''
                    }`}
                    icon={<MinusOutlined />}
                  />
                  <div className="tool-title">实线</div>
                </div>
              </Tooltip>
              <Tooltip title="虚线">
                <div className={`tool-button`}>
                  <Button
                    type={lineType === 'dashed' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleLineToolClick('dashed')}
                    className={`tool-icon ${
                      lineType === 'dashed' ? 'active' : ''
                    }`}
                    icon={<DashOutlined />}
                  />
                  <div className="tool-title">虚线</div>
                </div>
              </Tooltip>
              {/* 颜色选择 */}
              <div className="tool-button ">
                <ColorPicker
                  value={strokeColor}
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
                <div className="tool-title">颜色</div>
              </div>
            </div>
          </div>

          {/* 如果当前不是选择工具，显示退出编辑按钮 */}
          {currentTool ? (
            <>
              <Divider
                type="vertical"
                style={{ height: '40px', margin: '0 4px' }}
              />
              <div className="tool-button">
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={() => onToolChange('' as AnnotationTool)}
                  size="small"
                  danger
                  className="tool-icon"
                />
                <div className="tool-title">退出编辑</div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
