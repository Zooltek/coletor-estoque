import React from 'react';

const ToolbarButton = React.memo(({ icon, onClick, active, disabled, title, className = '' }) => {
  return (
    <button
      type="button"
      className={`toolbar-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
});

export default ToolbarButton;
