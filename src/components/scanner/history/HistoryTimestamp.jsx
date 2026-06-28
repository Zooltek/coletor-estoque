import React from 'react';

const HistoryTimestamp = React.memo(({ timestamp }) => {
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <span className="hc-timestamp">
      {formatTime(timestamp)}
    </span>
  );
});

export default HistoryTimestamp;
