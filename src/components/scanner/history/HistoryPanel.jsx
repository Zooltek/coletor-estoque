import React from 'react';
import { useHistory } from '../../../hooks/useHistory';
import HistoryList from './HistoryList';
import './history.css';

const HistoryPanel = React.memo(() => {
  const { history } = useHistory();
  
  // Limita a exibição visual às últimas 10 leituras conforme RFC-0008
  const displayList = history.slice(0, 10);

  return (
    <div className="history-panel-container">
      <HistoryList records={displayList} />
    </div>
  );
});

export default HistoryPanel;
