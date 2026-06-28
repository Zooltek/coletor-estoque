import React from 'react';

export default function ScannerInfoCard({ title, value, icon, className = '' }) {
  return (
    <div className={`scanner-info-card ${className}`}>
      <span className="sic-title">{title}</span>
      <div className="sic-content">
        {icon && <span className="sic-icon">{icon}</span>}
        <span className="sic-value">{value}</span>
      </div>
    </div>
  );
}
