import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  active = false,
  disabled = false,
  onClick,
}) => {
  return (
    <div
      className={`annotation-tool-button ${active ? 'active' : ''} ${
        disabled ? 'disabled' : ''
      }`}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      <span>{icon}</span>
    </div>
  );
};

export default ToolButton;
