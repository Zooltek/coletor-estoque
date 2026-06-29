import React, { useState } from 'react';

export function SettingsGroup({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="settings-group card-custom glassmorphism" style={{ marginBottom: '15px', overflow: 'hidden' }}>
      <div 
        className="settings-group-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}
      >
        <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div className="settings-group-content animate-slide" style={{ padding: '0 15px 15px 15px' }}>
          {children}
        </div>
      )}
    </div>
  );
}
