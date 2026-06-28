import React from 'react';
import HistoryCard from './HistoryCard';
import HistoryEmpty from './HistoryEmpty';

const HistoryList = React.memo(({ records }) => {
  if (!records || records.length === 0) {
    return <HistoryEmpty />;
  }

  return (
    <div className="history-list-wrapper">
      {records.map(record => (
        <HistoryCard key={record.id} record={record} />
      ))}
    </div>
  );
});

export default HistoryList;
